import api from "./api";
import {useAuth} from "../components/AuthProvider";

export const login = async (username: string, password: string) => {
    try {
        const response = await api.post("/login", { username, password });
        if (response.data?.access_token) {
            localStorage.setItem("authToken", response.data.access_token);
            return response.data;
        }
        throw new Error("Invalid response from server");
    } catch (error: any) {
        const errorMessage = error.response?.data?.detail || "Login failed. Please check your credentials.";
        throw new Error(errorMessage);
    }
};

export const register = async (username: string, password: string, role: string = "") => {
    try {
        const response = await api.post("/register", { username, password, role });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || "Registration failed");
    }
};

export const logout = async () => {
    localStorage.removeItem("authToken");
    try {
        const response = await api.post("/logout");
        return response.data;
    } catch (error: any) {
        console.error("Logout API call failed", error);
        return { message: "Logged out (but server request failed)" };
    }
};
