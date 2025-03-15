import React, { useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import styles from '../styles/GetStarted.module.css';
import Sidebar from "../components/Sidebar";
import {executeScanner} from "../services/scanner";
import {useNavigate} from "react-router-dom";

const GetStarted = ({ className, ...props }: { className: any }) => {
    const [progress, setProgress] = useState<number>(0);
    const [url, setUrl] = useState<string>("");
    const [attack, setAttack] = useState<string>("");
    const [cnn, setCnn] = useState<string>("");
    const navigate = useNavigate();

    const handleLaunch = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            await executeScanner(url, cnn, attack);

            let newProgress = 0;
            const interval = setInterval(() => {
                newProgress += 10;
                if (newProgress > 100) {
                    clearInterval(interval);
                } else {
                    setProgress(newProgress);
                }
            }, 500);

            navigate('/dashboard');
        } catch (err) {
            console.error('Execution error: ', err);
        }
    };

    return (
        <Box className={`${styles.getStarted} ${className}`} {...props}>
            <Sidebar />
            <Box className={styles.mainContent}>
                <Typography className={styles.header}>
                    TESTING AI MODEL
                </Typography>

                <Box className={styles.formContainer}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Input URL"
                        className={styles.textField}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        InputLabelProps={{
                            shrink: url !== "", // Hide label when user types
                        }}
                    />

                    <FormControl fullWidth variant="outlined" className={styles.formControl}>
                        <InputLabel id="attack-type-label">Select Type Of Attack</InputLabel>
                        <Select
                            labelId="attack-type-label"
                            value={attack}
                            onChange={(e) => setAttack(e.target.value)}
                            label="Select Type Of Attack"
                        >
                            <MenuItem value="score">Score Based Attack</MenuItem>
                            <MenuItem value="boundary">Boundary Based Attack</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined" className={styles.formControl}>
                        <InputLabel id="cnn-select-label">Select CNN</InputLabel>
                        <Select
                            labelId="cnn-select-label"
                            value={cnn}
                            onChange={(e) => setCnn(e.target.value)}
                            label="Select CNN"
                        >
                            <MenuItem value="ResNet">ResNet-50</MenuItem>
                            <MenuItem value="EfficientNet">EfficientNet</MenuItem>
                            <MenuItem value="MobileNet">MobileNet</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box className={styles.progressContainer}>
                    {/* Left side: Donut semi-circle progress */}
                    <Box className={styles.progressWrapper}>
                        <svg width="250" height="250" viewBox="0 0 200 100">
                            <path
                                d="M 10,100 A 90,90 0 0,1 190,100"
                                fill="none"
                                stroke="#e0e0e0"
                                strokeWidth="25"
                            />
                            <path
                                d="M 10,100 A 90,90 0 0,1 190,100"
                                fill="none"
                                stroke="#1976d2"
                                strokeWidth="25"
                                strokeDasharray="180"
                                strokeDashoffset={180 - (progress * 1.8)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <Typography className={styles.progressText}>{progress}%</Typography>
                    </Box>

                    {/* Right side: Instruction and Launch button */}
                    <Box className={styles.actionContainer}>
                        <Typography variant="body1" className={styles.instruction}>
                            Press Launch to Start the Scan
                        </Typography>
                        <Button variant="contained" color="primary" className={styles.launchButton} onClick={handleLaunch}>
                            LAUNCH
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default GetStarted;
