import api from "./api";

export const executeScanner = async (model_url: string, cnn_type: string, attack_type: string) => {
    try {
        const target_class = 0;
        const response = await api.post(`/scan`, {model_url, attack_type, cnn_type, target_class});

        if (!response.data.pdf_report || !response.data.adv_image) {
            throw new Error("Invalid response from the server.");
        }

        // 1️⃣ Save Adversarial Image to LocalStorage for Dashboard
        localStorage.setItem("adv_image", response.data.adv_image);

        // 2️⃣ Download the PDF automatically
        const pdfBlob = new Blob([Uint8Array.from(atob(response.data.pdf_report), c => c.charCodeAt(0))], {type: "application/pdf"});
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "security_report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        return response.data; // Returning just in case
    } catch (error: any) {
        console.error("API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || "Failed to execute scanner");
    }
};

export const getPreviousScans = async () => {
    try {
        const response = await api.get(`/previous-scans`);
        return response.data;
    } catch (error: any) {
        console.error("API Error:", error.response?.data || error.message);
    }
}