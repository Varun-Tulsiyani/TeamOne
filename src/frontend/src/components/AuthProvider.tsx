import React, { createContext, useState, useEffect, useContext } from "react";
import { Navigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

// Define the authentication context
interface AuthContextType {
    authenticated: boolean;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
    authenticated: false,
    loading: true,
    login: () => {},
    logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const isTokenExpired = (token: string) => {
        try {
            const decoded: any = jwtDecode(token);

            console.log("🔍 Decoded Token:", decoded); // ✅ Debugging

            if (!decoded.exp) {
                console.log("❌ No expiration field found in token.");
                return true;
            }

            console.log("Current Time:", Date.now(), "Token Expiry:", decoded.exp * 1000);

            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.log("❌ Invalid Token:", error);
            return true;  // Treat invalid token as expired
        }
    };

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("authToken");

            console.log("Checking Auth, Token Found:", token); // ✅ Debugging step

            if (token && !isTokenExpired(token)) {
                setAuthenticated(true);
                console.log("✅ Authentication Successful");
            } else {
                localStorage.removeItem("authToken");
                setAuthenticated(false);
                console.log("❌ Authentication Failed - Token Expired or Invalid");
            }

            setLoading(false);
        };

        checkAuth();
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    const login = (token: string) => {
        localStorage.setItem("authToken", token);
        setAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        setAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ authenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ Fix `Protected` Component to Handle `loading` Properly
export const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { authenticated, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>; // ✅ Show a loading state only while checking auth
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

// Custom Hook for accessing auth state
export const useAuth = () => useContext(AuthContext);
