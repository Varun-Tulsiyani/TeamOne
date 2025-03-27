# Protego

> An AI vulnerability scanner that performs **Model Inversion Attacks** (Score-based and Boundary-based) on deployed Convolutional Neural Networks like ResNet, EfficientNet, and MobileNet.

---

## What is Protego?

**Protego** is a security-focused tool designed to simulate and analyze model inversion attacks on deployed CNN models during their inference phase. It helps researchers and developers understand potential vulnerabilities in their AI systems — especially where there are currently no off-the-shelf solutions for this kind of threat.

---

## Features

- Score-based & Boundary-based model inversion attacks
- Supports popular CNN architectures: ResNet, EfficientNet, MobileNet
- Backend in FastAPI for handling attack requests
- Frontend in React + TypeScript with a clean UI
- Automatic PDF report generation after each attack
- Dashboard for viewing past scan summaries

---

## Project Structure

```
TeamOne/
├── src/
│   ├── backend/         # FastAPI backend logic and API routes
│   ├── frontend/        # React + TypeScript frontend
│   │   ├── public/         # Static assets
│   │   ├── src/            # Frontend source code
│   │   │   ├── components/    # Reusable React components
│   │   │   ├── pages/         # Page-level React components
│   │   │   ├── services/      # API functions
│   │   │   └── styles/        # CSS styling files
│   │   ├── package.json       # Frontend dependencies and scripts
│   │   ├── package-lock.json  # Locked versions of dependencies
│   │   └── tsconfig.json      # TypeScript configuration
│   └── models/           # CNN models
└── README.md
```

---

## Getting Started

### Frontend Setup

```bash
cd src/frontend
npm install
npm start
```

###  Backend Setup

The backend is built using Python + FastAPI. You can run it through an IDE like **PyCharm**, or directly with Uvicorn (you may need to adapt this based on your environment):

```bash
cd src/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

> ⚠️ A database is required for registering and logging in before accessing protected routes (like dashboard, reports, etc).

---

## Usage

1. **Start both frontend and backend servers.**
2. **Log in or register** on the frontend.
3. Navigate to **Dashboard** → **Get Started**.
4. Provide:
    - Model URL
    - Attack type (Score-based / Boundary-based)
    - Model type (ResNet / EfficientNet / MobileNet)
5. Click **Launch**.
6. The backend performs the attack and:
    - Triggers an automatic **PDF report download**
    - Sends the result as a dictionary for rendering on the **Report** page.

---

##  Demo

A demo video will be available soon on [YouTube](#) — stay tuned!

---
