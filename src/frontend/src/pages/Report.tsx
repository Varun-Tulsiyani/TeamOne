import React, {useEffect, useState} from "react";
import {Box, Button, Modal, TextField, Typography} from "@mui/material";
import styles from "../styles/Report.module.css";
import Sidebar from "../components/Sidebar";
import {getReport, IReport} from "../services/report";
import {styled} from "@mui/system";
// import {emailReport} from "../services/report";

const CustomTypography = styled(Typography)({
    color: "white"
});

const Report = ({...props}) => {
    const [report, setReport] = useState<IReport>({
        attack_type: "a",
        cnn_model: "a",
        created_at: "a",
        execution_time: "",
        iterations: 0,
        mitigations: "",
        scan_url: "",
        target_class: 0,
        user_id: 0
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await getReport();
                setReport(data);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    if (loading) return <p>Loading report...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleEmail = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            // await emailReport(email);
            alert("Report has been successfully sent to " + email);
            setOpen(false);
        } catch (error) {
            alert("Failed to send the report. Please try again.");
        }
    };

    return (
        <Box className={styles.report} {...props}>
            <Sidebar/>

            {report && (
                <Box className={styles.container}>
                    {/* Left Side: Main Content */}
                    <Box className={styles.leftSide}>
                        <CustomTypography variant="h4">TESTING AI MODEL</CustomTypography>
                        <CustomTypography variant="subtitle1">
                            Model - <strong>{report.cnn_model}</strong>
                        </CustomTypography>
                        <CustomTypography variant="subtitle1">
                            Attack - <strong>{report.attack_type}</strong>
                        </CustomTypography>
                        <CustomTypography variant="subtitle1">
                            Vulnerability - <strong>Gradient Exploit Vulnerability</strong>
                        </CustomTypography>

                        {/* Mitigation Steps */}
                        <Box className={styles.mitigationSteps}>
                            <CustomTypography variant="h6">Mitigation Steps:</CustomTypography>
                            <ol className={styles.mitigationList}>
                                <CustomTypography>{report.mitigations}</CustomTypography>
                            </ol>
                        </Box>
                    </Box>

                    {/* Right Side: Vulnerabilities & Risk */}
                    <Box className={styles.rightSide}>
                        {/* Action Buttons */}
                        <Box className={styles.buttonContainer}>
                            <Button onClick={handleOpen} variant="outlined" sx={{ color: "white", borderColor: "white" }}>
                                EMAIL REPORT
                            </Button>
                        </Box>

                        {/* Popup Modal for Email Input */}
                        <Modal open={open} onClose={handleClose} className={styles.modal}>
                            <Box className={styles.modal}>
                                <CustomTypography variant="h6">Enter your email to receive the
                                    report:</CustomTypography>
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
                                    <Button onClick={handleEmail} variant="contained"
                                            sx={{color: "white", borderColor: "white"}}>
                                        SEND
                                    </Button>
                                    <Button onClick={handleClose} variant="text"
                                            sx={{color: "white", borderColor: "white"}}>
                                        CANCEL
                                    </Button>
                                </Box>
                            </Box>
                        </Modal>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Report;
