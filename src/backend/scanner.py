from fastapi import HTTPException
from pydantic import BaseModel
from enum import Enum
import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import VGG16
import time
import matplotlib
matplotlib.use('Agg')


# === Data Models ===
class CNNType(str, Enum):
    RESNET = "ResNet"
    MOBILENET = "MobileNet"
    EFFICIENTNET = "EfficientNet"


class AttackType(str, Enum):
    SCORE_BASED = "score"
    BOUNDARY_BASED = "boundary"


# === Frontend Request ===
class ScanRequest(BaseModel):
    model_url: str
    cnn_type: CNNType
    attack_type: AttackType
    target_class: int = 0


def estimate_gradient_nes(image, target_one_hot, model, samples=50, sigma=0.3):
    print("[*] Estimating gradient using NES (random sampling)...")
    grads = tf.zeros_like(image)

    for i in range(samples):
        noise = tf.random.normal(shape=image.shape)
        perturbed_plus = image + sigma * noise
        perturbed_minus = image - sigma * noise

        # Get softmax probs instead of raw logits (more stable)
        probs_plus = tf.nn.softmax(model(perturbed_plus, training=False))
        probs_minus = tf.nn.softmax(model(perturbed_minus, training=False))

        # Use target class confidence difference as reward signal
        target_score_plus = tf.reduce_sum(probs_plus * target_one_hot, axis=1)
        target_score_minus = tf.reduce_sum(probs_minus * target_one_hot, axis=1)

        reward = (target_score_plus - target_score_minus) / (2 * sigma)
        grads += reward[:, None, None, None] * noise

    grads /= tf.cast(samples, tf.float32)
    print("[*] NES gradient estimation complete.")
    return grads


def gaussian_blur_tf(image, sigma):
    return tf.nn.depthwise_conv2d(image, tf.ones((3, 3, 3, 1)) / 9.0, strides=[1, 1, 1, 1], padding='SAME')


class AIVulnerabilityScanner:
    def __init__(self, model_type: CNNType = CNNType.RESNET):
        self.model_type = model_type
        self.model = None
        self.history = None

    def load_model(self, model_path: str):
        """Load model from a .h5 file"""
        try:
            # Check if the file exists
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"The model file '{model_path}' was not found.")

            # Load the entire model from the .h5 file
            self.model = tf.keras.models.load_model(model_path)

        except Exception as e:
            raise HTTPException(400, f"Model loading failed: {str(e)}")

    # === Boundary-Based Mitigation Strategies ===

    resnet_boundarybased_mitigations = [
        "Enhanced Regularization to Smooth Boundaries:",
        "• Increase weight decay values and incorporate dropout layers (especially in the fully connected or later convolutional layers) to reduce overfitting.",
        "• Use aggressive data augmentation (e.g., random crops, flips, rotations, color jittering) so that the model learns to classify under varied conditions.",
        "• Replace hard one-hot labels with soft targets (e.g., 0.9 for the true class and 0.1 distributed among others) to reduce overconfidence.",
        "",
        "Adversarial Training with Boundary Samples:",
        "• During training, generate adversarial examples specifically crafted to lie close to the current decision boundary (using methods such as PGD or FGSM with moderate perturbation).",
        "• Gradually introduce adversarial examples with increasing perturbation levels (curriculum-based adversarial training).",
        "• Use margin-based or regularized loss functions that penalize overly steep transitions in confidence near the boundary.",
        "",
        "Gradient Obfuscation & Noise Injection During Training:",
        "• Introduce a small, controlled amount of noise into intermediate activations or directly into the logits during training.",
        "• Use techniques such as DPSGD (Differentially Private SGD) to add calibrated noise to gradients selectively in critical layers.",
        "",
        "Deployment-Level Strategies:",
        "• Instead of returning full probability vectors, consider returning only top-1 labels or coarse confidence bands.",
        "• Add small randomized perturbations to the output probabilities at inference time to obscure the precise boundary location.",
        "• Implement dynamic response noise, adjusting the amount of noise based on query history.",
        "",
        "Query Throttling and Monitoring:",
        "• Enforce strict per-IP or per-user query limits to prevent excessive probing.",
        "• Monitor query patterns for sequences of inputs that vary only slightly (indicative of boundary probing).",
        "• Provide tiered API access where detailed outputs are only available under strict authentication.",
        "",
        "Ensemble and Model Rotation Strategies:",
        "• Deploy an ensemble of ResNet models trained with slightly different hyperparameters or on different subsets of data.",
        "• Periodically update or rotate the deployed model parameters to change the decision boundary over time.",
    ]
    mobilenet_boundarybased_mitigations = [
        "Tailored Adversarial Training:",
        "• Incorporate adversarial examples generated with low-budget attacks (e.g., FGSM with small epsilon) to prevent overconfident, sharp transitions.",
        "• Because MobileNet is lean, even modest adversarial training can lead to significant boundary smoothing.",
        "• Use mixup (linearly combining pairs of images and their labels) or CutMix techniques during training to force the network to learn smooth interpolations between classes.",
        "",
        "Activation Function and Normalization Tweaks:",
        "• Replace standard ReLU activations with smoother variants such as GELU or softplus.",
        "• Smoother activations lead to a less abrupt change in output near the boundary.",
        "• Fine-tune batch normalization settings or even experiment with alternatives (e.g., group normalization) that can reduce overfitting in low-parameter networks.",
        "",
        "Deployment-Level Strategies:",
        "• Serve only the predicted label (or a coarse confidence interval) rather than the full softmax distribution.",
        "• This reduction in output granularity helps prevent attackers from approximating the decision boundary.",
        "• Inject minimal random noise directly into the output logits at inference time. Ensure that the magnitude of noise is calibrated to be imperceptible to legitimate users yet sufficient to thwart boundary approximation.",
        "• Implement lightweight session-based query monitoring to detect rapid, minor input changes.",
        "• Use caching at the device or edge server level to aggregate similar queries. If repeated queries for near-identical inputs are detected, return a pre-cached (and noise-augmented) result to limit information leakage.",
        "• Impose lower query limits per user for mobile apps, since the threat model in a mobile setting may allow fewer queries overall.",
        "• Dynamically adjust the noise level in the responses based on the observed query rate. For example, if a particular client exceeds a threshold of similar queries, increase the output perturbation.",
    ]

    efficientnet_boundarybased_mitigations = [
        "Training and Architectural Enhancements:",
        "• Incorporate adversarial examples in the compound scaling process so that each scaled version of the model learns robust boundaries.",
        "• Ensure that training data includes near-boundary examples for all scales (depth, width, and resolution).",
        "• Introduce additional loss terms (e.g., margin loss or center loss) that penalize overly confident predictions near the boundary, thereby softening the transition between classes.",
        "• Use mixup or CutMix during training to force the model to learn smooth class transitions, which in turn leads to less steep decision boundaries.",
        "",
        "Regularization and Differential Privacy Techniques:",
        "• Apply label smoothing to reduce extreme confidence values and add gradient penalties to limit how sharply the output changes with respect to input perturbations.",
        "• Integrate differential privacy mechanisms (like DPSGD) specifically in layers that directly influence the final logits.",
        "• This adds calibrated noise during training and can be fine-tuned to balance between accuracy and privacy.",
        "",
        "Deployment and Post-Training Countermeasures:",
        "• Add differential privacy-inspired noise to the output probabilities or logits at inference time.",
        "• The noise level can be dynamically adjusted based on detected query patterns—if a client appears to be probing near the boundary, increase the noise level.",
        "• Use an ensemble of EfficientNet models (or apply stochastic depth at inference time) so that the decision boundary varies slightly with each query.",
        "• This variability makes it harder for an attacker to pin down a stable boundary.",
        "• Monitor for rapid query sequences that indicate boundary probing.",
        "• Implement automatic query blocking or response randomization for clients that exceed normal usage thresholds.",
        "• Return aggregated responses for similar queries over a short time window. This aggregation reduces the granularity of feedback available to an attacker.",
        "• Introduce minor, randomized delays in response time to disrupt timing-based inference techniques that might help in mapping the decision boundary.",
        "• Periodically update model weights or rotate among several EfficientNet versions deployed concurrently.",
        "• This rotation ensures that any query data collected over time does not converge on a single static decision boundary.",
    ]
    # === Placeholder for Score-Based Mitigations ===
    resnet_scorebased_mitigations = [
        "Training and Architectural Enhancements:",
        "• Incorporate adversarial examples across EfficientNet’s compound scaling factors to enhance robustness.",
        "• Introduce margin-based loss adjustments to penalize overconfident predictions near boundaries.",
        "• Integrate Mixup and CutMix during training to enforce smoother class transitions.",
        "",
        "Regularization and Differential Privacy Techniques:",
        "• Apply label smoothing and gradient penalties to prevent extreme confidence scores.",
        "• Selectively apply Differentially Private SGD (DPSGD) in critical layers to disrupt boundary extraction.",
        "",
        "Deployment and Post-Training Countermeasures:",
        "• Use dynamic noise injection at inference time to make boundary probing more difficult.",
        "• Employ an ensemble of EfficientNet models or stochastic depth at inference to randomize decisions.",
        "• Implement rate limiting and query anomaly detection to prevent rapid probing.",
        "• Use model versioning and frequent updates to prevent static decision boundaries.",
    ]
    mobilenet_scorebased_mitigations = [
        "Training and Architectural Enhancements:",
        "• Incorporate adversarial examples across EfficientNet’s compound scaling factors to enhance robustness.",
        "• Introduce margin-based loss adjustments to penalize overconfident predictions near boundaries.",
        "• Integrate Mixup and CutMix during training to enforce smoother class transitions.",
        "",
        "Regularization and Differential Privacy Techniques:",
        "• Apply label smoothing and gradient penalties to prevent extreme confidence scores.",
        "• Selectively apply Differentially Private SGD (DPSGD) in critical layers to disrupt boundary extraction.",
        "",
        "Deployment and Post-Training Countermeasures:",
        "• Use dynamic noise injection at inference time to make boundary probing more difficult.",
        "• Employ an ensemble of EfficientNet models or stochastic depth at inference to randomize decisions.",
        "• Implement rate limiting and query anomaly detection to prevent rapid probing.",
        "• Use model versioning and frequent updates to prevent static decision boundaries.",
    ]
    efficientnet_scorebased_mitigations = [
        "Training and Architectural Enhancements:",
        "• Incorporate adversarial examples across EfficientNet’s compound scaling factors to enhance robustness.",
        "• Introduce margin-based loss adjustments to penalize overconfident predictions near boundaries.",
        "• Integrate Mixup and CutMix during training to enforce smoother class transitions.",
        "",
        "Regularization and Differential Privacy Techniques:",
        "• Apply label smoothing and gradient penalties to prevent extreme confidence scores.",
        "• Selectively apply Differentially Private SGD (DPSGD) in critical layers to disrupt boundary extraction.",
        "",
        "Deployment and Post-Training Countermeasures:",
        "• Use dynamic noise injection at inference time to make boundary probing more difficult.",
        "• Employ an ensemble of EfficientNet models or stochastic depth at inference to randomize decisions.",
        "• Implement rate limiting and query anomaly detection to prevent rapid probing.",
        "• Use model versioning and frequent updates to prevent static decision boundaries.",
    ]

    # *Model-Specific Attack Methods*

    # ResNet Attacks
    # ------------------------
    # ResNet Score-Based Attack
    # ------------------------
    def score_based_resnet_attack(self, target_class: int):
        """Successful score-based attack using FGSM on ResNet."""
        start_time = time.time()

        input_image = tf.Variable(tf.random.uniform((1, 256, 256, 3), minval=0, maxval=1))

        target_one_hot = tf.one_hot([target_class], self.model.output_shape[-1])
        loss_fn = tf.keras.losses.CategoricalCrossentropy()

        for _ in range(5000):  # Multiple FGSM steps for stronger perturbation
            with tf.GradientTape() as tape:
                tape.watch(input_image)
                predictions = self.model(input_image, training=False)
                loss = loss_fn(target_one_hot, predictions)

            gradients = tape.gradient(loss, input_image)
            signed_grad = tf.sign(gradients)
            input_image.assign_add(0.04 * signed_grad)
            input_image.assign(tf.clip_by_value(input_image, 0, 1))  # Keep values in valid range

        execution_time = time.time() - start_time

        return {
            **self._analyze_results(input_image, target_class),
            'execution_time': execution_time,
            'model_type': "ResNet",
            'attack_type': "Score-Based",
            'mitigations': self.resnet_scorebased_mitigations
        }
    # ------------------------
    # ResNet Boundary-Based Attack
    # ------------------------
    def boundary_based_resnet_attack(self, target_class: int):
        """Successful boundary-based attack on ResNet."""
        start_time = time.time()

        base_image = tf.Variable(tf.random.uniform((1, 256, 256, 3), minval=0, maxval=1))
        original_image = tf.identity(base_image)

        for _ in range(5000):
            perturbation = tf.random.normal(shape=base_image.shape, stddev=0.01)
            candidate = tf.clip_by_value(base_image + perturbation, 0, 1)
            candidate_scaled = candidate * 255.0  # If model expects [0, 255]

            preds = self.model(candidate_scaled, training=False)
            if tf.argmax(preds, axis=1).numpy()[0] == target_class:
                base_image.assign(candidate)

        execution_time = time.time() - start_time

        return {
            **self._analyze_results(base_image, target_class, original_image, iterations=50),
            'execution_time': execution_time,
            'model_type': "ResNet",
            'attack_type': "Boundary-Based",
            'mitigations': self.resnet_boundarybased_mitigations
        }

    # ------------------------
    # MobileNet Score-Based Attack
    # ------------------------
    def score_based_mobilenet_attack(self, target_class: int):
        """Successful score-based attack on MobileNet."""
        start_time = time.time()

        # Ensure the input image is a trainable variable
        input_tensor = self._generate_base_image()
        input_image = tf.Variable(input_tensor, dtype=tf.float32)

        num_classes = self.model.output_shape[-1]
        loss_fn = tf.keras.losses.CategoricalCrossentropy()

        for _ in range(5000):
            with tf.GradientTape() as tape:
                tape.watch(input_image)
                predictions = self.model(input_image, training=False)

                if num_classes == 1:
                    target = tf.constant([[1.0]]) if target_class else tf.constant([[0.0]])
                else:
                    target = tf.one_hot([target_class], num_classes)

                loss = loss_fn(target, predictions)

            gradients = tape.gradient(loss, input_image)
            signed_grad = tf.sign(gradients)
            input_image.assign_add(0.06 * signed_grad)  # Now works since it's a tf.Variable
            input_image.assign(tf.clip_by_value(input_image, 0, 1))  # Valid pixel range

        execution_time = time.time() - start_time

        return {
            **self._analyze_results(input_image, target_class),
            'execution_time': execution_time,
            'model_type': "MobileNet",
            'attack_type': "Score-Based",
            'mitigations': self.mobilenet_scorebased_mitigations
        }

    # ------------------------
    # MobileNet Boundary-Based Attack
    # ------------------------
    def boundary_based_mobilenet_attack(self, target_class: int):
        """Successful boundary-based attack on MobileNet."""
        start_time = time.time()

        base_image = tf.Variable(self._generate_base_image())
        original_image = tf.identity(base_image)
        momentum = tf.zeros_like(base_image)

        for _ in range(5000):
            with tf.GradientTape() as tape:
                tape.watch(base_image)
                predictions = self.model(base_image, training=False)
                loss = -tf.reduce_mean(predictions[:, target_class])  # Maximize confidence

            grad = tape.gradient(loss, base_image)
            momentum = 0.9 * momentum + 0.1 * grad
            base_image.assign_add(0.02 * tf.sign(momentum))
            base_image.assign(tf.clip_by_value(base_image, 0, 1))

        execution_time = time.time() - start_time

        return {
            **self._analyze_results(base_image, target_class, original_image, iterations=100),
            'execution_time': execution_time,
            'model_type': "MobileNet",
            'attack_type': "Boundary-Based",
            'mitigations': self.mobilenet_boundarybased_mitigations
        }

    # EfficientNet Attacks
    def score_based_efficientnet_attack(self, target_class: int):
        """Successful iterative FGSM-based score attack on EfficientNetB0."""
        start_time = time.time()

        input_image_np = np.random.uniform(0, 255, (1, 224, 224, 3)).astype(np.float32)
        input_image_np = tf.keras.applications.efficientnet.preprocess_input(input_image_np)

        input_image = tf.Variable(input_image_np, dtype=tf.float32)

        target_one_hot = tf.one_hot([target_class], self.model.output_shape[-1])
        loss_fn = tf.keras.losses.CategoricalCrossentropy()

        for _ in range(5000):  # Iterative FGSM: 10 steps for better results
            with tf.GradientTape() as tape:
                tape.watch(input_image)
                preds = self.model(input_image, training=False)
                loss = loss_fn(target_one_hot, preds)

            gradients = tape.gradient(loss, input_image)
            signed_grad = tf.sign(gradients)
            input_image.assign_add(0.03 * signed_grad)
            input_image.assign(tf.clip_by_value(input_image, -1, 1))  # Keep in EfficientNet range

        execution_time = time.time() - start_time

        return {
            **self._analyze_results(input_image, target_class),
            'execution_time': execution_time,
            'model_type': "EfficientNetB0",
            'attack_type': "Score-Based",
            'mitigations': self.efficientnet_scorebased_mitigations
        }

    def boundary_based_efficientnet_attack(self, target_class: int):
        """Successful boundary-based attack using FFT perturbations."""
        start_time = time.time()

        base_image = tf.Variable(tf.random.uniform((1, 224, 224, 3), 0, 1))
        original_image = tf.identity(base_image)

        for _ in range(5000):
            fft_img = tf.signal.fft2d(tf.cast(base_image, tf.complex64))
            magnitude = tf.abs(fft_img)
            phase = tf.math.angle(fft_img)

            magnitude *= 0.95  # Slight reduction
            mod_fft = tf.cast(magnitude, tf.complex64) * tf.exp(1j * tf.cast(phase, tf.complex64))
            candidate = tf.math.real(tf.signal.ifft2d(mod_fft))
            candidate = tf.clip_by_value(candidate, 0, 1)

            preds = self.model(candidate)
            if tf.argmax(preds, axis=1).numpy()[0] == target_class:
                base_image.assign(candidate)

        execution_time = time.time() - start_time

        return {
            **self._analyze_results(base_image, target_class, original_image, iterations=75),
            'execution_time': execution_time,
            'model_type': "EfficientNetB0",
            'attack_type': "Boundary-Based",
            'mitigations': self.efficientnet_boundarybased_mitigations
        }

    # === Helper Methods ===
    def _generate_base_image(self):
        """Generate random base image with model-specific preprocessing"""
        image = tf.random.uniform((1, 128, 128, 3), minval=0, maxval=1)
        if self.model_type == CNNType.RESNET:
            image = tf.image.resize(image, (224, 224))  # Resize for ResNet
            return tf.keras.applications.resnet50.preprocess_input(image * 255)
        elif self.model_type == CNNType.MOBILENET:
            return tf.keras.applications.mobilenet.preprocess_input(image * 255)
        elif self.model_type == CNNType.EFFICIENTNET:
            return image

    def _analyze_results(self, adv_image, target_class, original_image=None, iterations=0):
        # Convert adversarial image to numpy array and handle batch dimension
        if isinstance(adv_image, tf.Tensor):
            adv_image_np = adv_image.numpy().squeeze()  # Remove batch dimension
        else:
            adv_image_np = np.squeeze(adv_image)  # Ensure no batch dimension

        # Handle scaling (ensure [0, 255] range for consistency)
        if np.max(adv_image_np) <= 1.0:
            adv_image_np = (adv_image_np * 255).astype(np.uint8)
        else:
            adv_image_np = adv_image_np.astype(np.uint8)

        # Predict using the model (add batch dimension back for prediction)
        preds_after = self.model.predict(np.expand_dims(adv_image_np, axis=0))

        # Predict on original image if provided
        preds_before = None
        if original_image is not None:
            if isinstance(original_image, tf.Tensor):
                original_image_np = original_image.numpy().squeeze()
            else:
                original_image_np = np.squeeze(original_image)

            # Handle scaling for original image
            if np.max(original_image_np) <= 1.0:
                original_image_np = (original_image_np * 255).astype(np.uint8)
            else:
                original_image_np = original_image_np.astype(np.uint8)

            preds_before = self.model.predict(np.expand_dims(original_image_np, axis=0))

        # Return results with adversarial image and metrics
        return {
            'adv_image': adv_image_np.tolist(),  # Adversarial image (numpy array, [0, 255])
            'target_class': target_class,
            'iterations': iterations,
        }

    def _compute_decision_gradient(self, image, target_class):
        """Compute decision boundary gradient"""
        with tf.GradientTape() as tape:
            tape.watch(image)
            logits = self.model(image)
            loss = tf.keras.losses.sparse_categorical_crossentropy(
                np.array([target_class]), logits, from_logits=True)
        return tape.gradient(loss, image)
