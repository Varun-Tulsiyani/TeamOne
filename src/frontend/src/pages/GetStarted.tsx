import React, {useState} from 'react';
import {Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography} from '@mui/material';
import styles from '../styles/GetStarted.module.css';
import Sidebar from "../components/Sidebar";
import {executeScanner} from "../services/scanner";
import {useNavigate} from "react-router-dom";

const GetStarted = ({...props}) => {
    const [url, setUrl] = useState<string>("");
    const [attack, setAttack] = useState<string>("");
    const [cnn, setCnn] = useState<string>("");
    const navigate = useNavigate();

    const handleLaunch = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            await executeScanner(url, cnn, attack);

            navigate('/dashboard');
        } catch (err) {
            console.error('Execution error: ', err);
        }
    };

    return (
        <Box className={styles.getStarted} {...props}>
            <Sidebar/>
            <Box className={styles.mainContent}>
                <Typography className={styles.header}>
                    TESTING AI MODEL
                </Typography>

                <Box className={styles.formContainer}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Input Model

                        URL"
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
    );
};

export default GetStarted;
