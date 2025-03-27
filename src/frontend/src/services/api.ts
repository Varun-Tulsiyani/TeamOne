import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        console.log("🔗 Attaching Token to Request:", token); // ✅ Debugging
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.log("❌ No Token Found");
    }
    return config;
});

export default api;
