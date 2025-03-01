import React, { useState } from 'react';
import { Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Register.module.css";
import {register} from "../services/auth";
import { styled } from "@mui/system";

const CustomTextField = styled(TextField)({
    "& .MuiInput-root": {
        borderBottom: "2px solid white", // Custom underline color
    },
    "& .MuiInputLabel-root": {
        color: "#999", // Label color
    },
    "& .MuiInputBase-input": {
        color: "#333", // Text color inside input
    },
});

const Register = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            await register(username, password);
            navigate('/dashboard'); // Redirect on success
        } catch (err) {
            setError("Registration failed. Try again!");
            console.error('Registration error:', err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Typography variant="h5" className={styles.title}>
                    Register
                </Typography>

                {error && <Typography className={styles.error}>{error}</Typography>}

                <form onSubmit={handleRegister} className={styles.form}>
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
                        id="email"
                        label="Email"
                        type="email"
                        variant="standard"
                        fullWidth
                        required
                        onChange={(e) => setEmail(e.target.value)}
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
                        Register
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Register;
