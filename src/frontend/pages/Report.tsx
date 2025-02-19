import React from 'react';
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material';
import styles from '../styles/Report.module.css';
import Sidebar from "../components/Sidebar";

const Report = ({ className, ...props }: { className: any }) => {
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
                        <Button variant="contained" color="primary" className={styles.button}>
                            VIEW REPORT
                        </Button>
                        <Button variant="outlined" color="primary" className={styles.button}>
                            EMAIL REPORT
                        </Button>
                    </Box>

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
