import React, {useEffect, useState} from 'react';
import { Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import { login } from "../services/auth";
import { styled } from "@mui/system";
import {useAuth} from "../components/AuthProvider";

// No custom styles for TextField
const CustomTextField = styled(TextField)({
    "& .MuiInput-root": {
        borderBottom: "2px solid white",
    },
    "& .MuiInputLabel-root": {
        color: "#999",
    },
    "& .MuiInputBase-input": {
        color: "#333",
    },
});

const Login = () => {
    const { authenticated, login: authLogin } = useAuth();
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (authenticated) {
            navigate("/dashboard");
        }
    }, [authenticated, navigate]);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await login(username, password);

            localStorage.setItem("authToken", response.access_token);

            authLogin(response.access_token);
           navigate("/dashboard");
        } catch (err) {
            setError("Invalid username or password!");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Typography className={styles.title}>
                    Login
                </Typography>

                {error && <Typography className={styles.error}>{error}</Typography>}

                <form onSubmit={handleLogin} className={styles.form}>
                    <CustomTextField
                        id="username"
                        label="Username"
                        variant="standard"
                        fullWidth
                        required
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                    />

                    <CustomTextField
                        id="password"
                        label="Password"
                        type="password"
                        variant="standard"
                        fullWidth
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={styles.button}
                    >
                        Login
                    </Button>

                    <a href={"/forgot-password"} className={styles.forgotPassword}>Forgot Password</a>
                </form>
            </div>
        </div>
    );
};

export default Login;
