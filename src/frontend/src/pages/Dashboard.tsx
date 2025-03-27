import React, {useEffect, useState} from 'react';
import {
    Box,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import styles from '../styles/Dashboard.module.css';
import Sidebar from "../components/Sidebar";
import {getAllReports, IReport} from "../services/report";

const Dashboard = ({...props}) => {
    const [reports, setReports] = useState<IReport[]>([]);
    const [advImage, setAdvImage] = useState<string | null>(null);

    useEffect(() => {
        const storedImage = localStorage.getItem("adv_image");

        if (storedImage) {
            setAdvImage(storedImage);
        }

        const fetchReports = async () => {
            try {
                const data = await getAllReports();
                setReports(data);
            } catch (error: any) {
                console.log(error.message)
            }
        };

        fetchReports();
    }, [])

    return (
        <Box className={styles.dashboard} {...props}>
            <Sidebar/>

            {/* Main Grid Layout */}
            <Box className={styles.mainContent}>

                {/* Container 1: Welcome + Sales Levels */}
                <Box className={styles.container1}>
                    <Box className={styles.welcome}>
                        <Typography variant="h6">Welcome Back,</Typography>
                        {advImage ? (
                            <img
                                src={`data:image/png;base64,${advImage}`}
                                alt="Adversarial Image"
                                style={{ width: "400px", height: "300px", border: "1px solid #ddd" }}
                            />
                        ) : (
                            <p>No adversarial image available.</p>
                        )}
                    </Box>
                </Box>

                {/* Container 3: Key Issues */}
                <Box className={styles.container2}>
                    <Box className={styles.topProductsHeader}>
                        <Typography variant="h6">All Scans</Typography>
                    </Box>
                    <TableContainer component={Paper} className={styles.paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>CNN Model</TableCell>
                                    <TableCell>Attack</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reports.map((report, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{report.created_at}</TableCell>
                                        <TableCell>{report.cnn_model}</TableCell>
                                        <TableCell>{report.attack_type}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;
