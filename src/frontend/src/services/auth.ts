import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: { "Content-Type": "application/json" }
});

// Request Interceptor to Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Login Function
export const login = async (username: string, password: string) => {
    try {
        const response = await api.post("/login", { username, password });
        if (response.data?.access_token) {
            localStorage.setItem("authToken", response.data.access_token);
            return response.data;
        }
        throw new Error("Invalid response from server");
    } catch (error: any) {
        throw new Error(error?.message || "Login failed");
    }
};

// Register Function
export const register = async (username: string, password: string, role: string = "") => {
    try {
        const response = await api.post("/register", { username, password, role });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.message || "Registration failed");
    }
};

// Logout Function (Optional)
export const logout = () => {
    localStorage.removeItem("authToken");
};
