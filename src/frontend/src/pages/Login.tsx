import React, { useState } from 'react';
import { Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import { login } from "../services/auth";
import { styled } from "@mui/system";

// No custom styles for TextField
const CustomTextField = styled(TextField)({
    // No custom styles
});

const Login = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            await login(username, password); // Call login services
            navigate('/dashboard'); // Redirect to dashboard on success
        } catch (err) {
            setError("Invalid username or password!");
            console.error('Login error:', err);
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
                        fullWidth // Ensure fullWidth is set
                        required
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                    />

                    <CustomTextField
                        id="password"
                        label="Password"
                        type="password"
                        variant="standard"
                        fullWidth // Ensure fullWidth is set
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                    />

                    <Button
                        fullWidth // Ensure fullWidth is set
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={styles.button}
                    >
                        Login
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Login;
