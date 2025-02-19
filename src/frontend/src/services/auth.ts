import axios from "axios";

// API Base URL
const API_BASE_URL = "http://localhost:8000";

// Define response interfaces
interface AuthResponse {
    msg: string;
    user: { id: number; username: string; };
    token?: string;
}

// Login Function
export const login = async (username: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/login`, {username, password});

        // If token-based auth, store token in localStorage
        if (response.data.token) {
            localStorage.setItem("authToken", response.data.token);
        }

        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || "Invalid login credentials");
    }
};

// Register Function
export const registerUser = async (
    username: string,
    email: string,
    password: string
): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/register`, {username, password});

        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || "Registration failed");
    }
};

// Logout Function (Optional)
export const logout = () => {
    localStorage.removeItem("authToken");
};
