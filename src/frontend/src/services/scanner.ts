import axios from "axios";

// API Base URL
const API_BASE_URL = "http://localhost:8000";

export const executeScanner = async (model_url: string, cnn_type: string, attack_type: string) => {
    try {
        const target_class = 0;
        const response = await axios.post(`${API_BASE_URL}/scan`, {
            model_url, attack_type, cnn_type, target_class
        }, { responseType: "blob" });

        const contentType = response.headers["content-type"];

        if (contentType === "application/pdf") {
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "security_report.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            const text = await response.data.text();
            const jsonResponse = JSON.parse(text);
            return jsonResponse;
        }
    } catch (error: any) {
        console.error("API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || "Failed to execute scanner");
    }
};
