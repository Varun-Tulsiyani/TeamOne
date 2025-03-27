import React, { useState } from 'react';
import { Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
// import { forgotPassword } from "../services/auth";
import { styled } from "@mui/system";

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

const ForgotPassword = () => {
    const [newPassword, setNewPassword] = useState<string>('');
    const [newPasswordCopy, setNewPasswordCopy] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            // await forgotPassword(newPassword, newPasswordCopy);
            navigate('/login');
        } catch (err) {
            setError("Invalid username or password!");
            console.error('Login error:', err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <Typography className={styles.title}>
                    Forgot Password
                </Typography>

                {error && <Typography className={styles.error}>{error}</Typography>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <CustomTextField
                        id="new_password"
                        label="New Password"
                        variant="standard"
                        fullWidth
                        required
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles.input}
                    />

                    <CustomTextField
                        id="new_password_copy"
                        label="New Password Copy"
                        type="password"
                        variant="standard"
                        fullWidth
                        required
                        onChange={(e) => setNewPasswordCopy(e.target.value)}
                        className={styles.input}
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={styles.button}
                    >
                        Submit
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
