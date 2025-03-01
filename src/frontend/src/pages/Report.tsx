import React, {useState} from 'react';
import {Box, Button, Divider, Grid, Modal, Paper, TextField, Typography} from '@mui/material';
import styles from '../styles/Report.module.css';
import Sidebar from "../components/Sidebar";
import {emailReport} from "../services/report";

const Report = ({ className, ...props }: { className: any }) => {
    const [email, setEmail] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const handleEmail = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            await emailReport(email);
            alert("Report has been successfully sent to " + email);
            setOpen(false);
        } catch (error) {
            alert("Failed to send the report. Please try again.");
        }
    }

    return (
        <Box className={`${styles.report} ${className}`} {...props}>
            <Sidebar />

            {/* Main Content Area */}
            <Box className={styles.mainContent}>
                <Box className={styles.header}>
                    <Typography variant="h4">Report</Typography>
                </Box>
                <Divider className={styles.divider} />

                <Box className={styles.content}>
                    <Typography variant="h6" className={styles.testingAiModel}>
                        TESTING AI MODEL
                    </Typography>
                    <Typography variant="subtitle1">Model - <strong>ResNet-50</strong></Typography>
                    <Typography variant="subtitle1">Attack - <strong>Adversarial Input Attack</strong></Typography>
                    <Typography variant="subtitle1">Vulnerability - <strong>Gradient Exploit Vulnerability</strong></Typography>

                    <Box className={styles.mitigationSteps}>
                        <Typography variant="h6">Mitigation Steps:</Typography>
                        <ol className={styles.mitigationList}>
                            <li>Implement input validation to sanitize and verify all incoming data.</li>
                            <li>Add adversarial training to make the CNN model robust against adversarial attacks.</li>
                            <li>Enable monitoring tools to detect unusual query patterns or data access.</li>
                            <li>Mask sensitive data in logs or responses.</li>
                            <li>Apply encryption for stored sensitive data.</li>
                        </ol>
                    </Box>

                    <Box className={styles.actionButtons}>
                        <Button
                            href="/report/detail"
                            variant="contained"
                            color="primary"
                            className={styles.button}>
                            VIEW REPORT
                        </Button>
                        <Button
                            onClick={handleOpen}
                            variant="outlined"
                            color="primary"
                            className={styles.button}>
                            EMAIL REPORT
                        </Button>
                    </Box>

                    {/* Popup Modal for Email Input */}
                    <Modal open={open} onClose={handleClose}>
                        <Box className={styles.modal}>
                            <Typography variant="h6">Enter your email to receive the report:</Typography>
                            <TextField
                                type="email"
                                label="Email"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Box className={styles.modalActions}>
                                <Button onClick={handleEmail} variant="contained" color="primary">
                                    SEND
                                </Button>
                                <Button onClick={handleClose} variant="text">
                                    CANCEL
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    <Box className={styles.statsSection}>
                        <Typography variant="h5" gutterBottom>
                            VULNERABILITIES
                        </Typography>
                        <Grid container spacing={3}>
                            {[
                                { label: "IDENTIFIED", value: 2115 },
                                { label: "HIGH", value: 812 },
                                { label: "CONFIRMED", value: 1695 },
                                { label: "CRITICAL", value: 203 }
                            ].map((stat, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <Paper className={styles.statCard}>
                                        <Typography variant="h4" className={styles.statValue}>{stat.value}</Typography>
                                        <Typography variant="subtitle1" className={styles.statLabel}>{stat.label}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        <Box className={styles.riskLevel}>
                            <Typography variant="h6">RISK LEVEL</Typography>
                            <Typography variant="h4" className={styles.riskValue}>80%</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Report;
