import React from 'react';
import {
    Box,
    Button,
    Divider,
    Grid,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import styles from '../styles/DetailReport.module.css';
import Sidebar from "../components/Sidebar";

const vulnerabilities = [
    { type: "SQL Injection", severity: "Critical", detected: 25 },
    { type: "Cross-Site Scripting (XSS)", severity: "High", detected: 18 },
    { type: "Broken Authentication", severity: "High", detected: 12 },
    { type: "Sensitive Data Exposure", severity: "Medium", detected: 20 },
    { type: "Security Misconfiguration", severity: "Low", detected: 15 }
];

// Bar Chart Data
const chartData = {
    labels: vulnerabilities.map(v => v.type),
    datasets: [
        {
            label: 'Vulnerabilities Detected',
            data: vulnerabilities.map(v => v.detected),
            backgroundColor: ['#d32f2f', '#f57c00', '#ffb300', '#1976d2', '#388e3c'],
        }
    ]
};

const DetailReport = ({ className, ...props }: { className: any }) => {
    return (
        <Box className={`${styles.detailedReport} ${className}`} {...props}>
            <Sidebar />

            {/* Main Content */}
            <Box className={styles.mainContent}>
                <Typography variant="h4" className={styles.header}>
                    Vulnerability Scan Report
                </Typography>
                <Divider className={styles.divider} />

                {/* Scan Summary */}
                <Box className={styles.summarySection}>
                    <Typography variant="h6">Scan Summary</Typography>
                    <Typography variant="body1">🛡️ **Total Vulnerabilities Found:** 90</Typography>
                    <Typography variant="body1">🔍 **Scan Duration:** 15 minutes</Typography>
                    <Typography variant="body1">📅 **Scan Date:** February 13, 2025</Typography>
                </Box>

                {/* Vulnerability Table */}
                <Box className={styles.tableSection}>
                    <Typography variant="h6">Vulnerabilities Detected</Typography>
                    <TableContainer component={Paper} className={styles.tableContainer}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Severity</TableCell>
                                    <TableCell>Instances Detected</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {vulnerabilities.map((vuln, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{vuln.type}</TableCell>
                                        <TableCell>
                                            <span className={`${styles.severity} ${styles[vuln.severity.toLowerCase()]}`}>
                                                {vuln.severity}
                                            </span>
                                        </TableCell>
                                        <TableCell>{vuln.detected}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Bar Chart Representation */}
                {/* <Box className={styles.chartSection}>
                    <Typography variant="h6">Vulnerability Distribution</Typography>
                    <Bar data={chartData} />
                </Box> */}

                {/* Mitigation Steps */}
                <Box className={styles.mitigationSection}>
                    <Typography variant="h6">Recommended Mitigation Steps</Typography>
                    <ul className={styles.mitigationList}>
                        <li>Apply proper input validation to prevent SQL Injection.</li>
                        <li>Use Content Security Policy (CSP) to mitigate XSS attacks.</li>
                        <li>Implement multi-factor authentication to improve login security.</li>
                        <li>Ensure encryption of sensitive data during storage and transmission.</li>
                        <li>Regularly update and patch software to prevent known exploits.</li>
                    </ul>
                </Box>

                {/* Download Report Button */}
                <Box className={styles.downloadButton}>
                    <Button variant="contained" color="primary">
                        Download Full Report
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default DetailReport;
