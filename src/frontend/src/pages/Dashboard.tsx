import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
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

const Dashboard = ({className, ...props}: { className: any }) => {
    const issues = [
        {name: "Type 1 Attack", popularity: 46, score: 90},
        {name: "Type 2 Attack", popularity: 17, score: 75},
        {name: "Type 3 Attack", popularity: 19, score: 80},
        {name: "Type 4 Attack", popularity: 29, score: 65}
    ];

    // Data for the histogram in Level Visualization
    const histogramData = [
        {primaryHeight: '60%', secondaryHeight: '40%'},
        {primaryHeight: '80%', secondaryHeight: '50%'},
        {primaryHeight: '40%', secondaryHeight: '30%'},
        {primaryHeight: '90%', secondaryHeight: '70%'},
        {primaryHeight: '50%', secondaryHeight: '30%'},
        {primaryHeight: '70%', secondaryHeight: '50%'},
    ];

    return (
        <Box className={`${styles.dashboard} ${className}`} {...props}>
            <Sidebar/>

            {/* Main Grid Layout */}
            <Box className={styles.mainContent}>

                {/* Container 1: Welcome + Sales Levels */}
                <Box className={styles.container1}>
                    <Box className={styles.welcome}>
                        <Typography variant="h6">Welcome Back,</Typography>
                        <Typography variant="subtitle1">
                            Here’s what’s happening in your AI Model
                        </Typography>
                    </Box>

                    <Grid container spacing={3} className={styles.cards}>
                        {[
                            {label: "Low", value: 254, change: "+15%"},
                            {label: "Medium", value: 423, change: "+8%"},
                            {label: "High", value: 812, change: "+48%"},
                            {label: "Critical", value: 203, change: "+12%"}
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card className={styles.card}>
                                    <CardContent>
                                        <Typography variant="h5" className={styles.cardValue}>{item.value}</Typography>
                                        <Typography variant="subtitle1"
                                                    className={styles.cardLabel}>{item.label}</Typography>
                                        <Typography variant="body2" className={styles.cardChange}>{item.change} from
                                            yesterday</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Container 2: Level Visualization */}
                <Box className={styles.container2}>
                    <Typography variant="h6" gutterBottom>
                        Level
                    </Typography>
                    <Box className={styles.histogram}>
                        {histogramData.map((bar, index) => (
                            <Box key={index} className={styles.histogramBar}>
                                <Box
                                    className={styles.primaryBar}
                                    style={{height: bar.primaryHeight}}
                                />
                                <Box
                                    className={styles.secondaryBar}
                                    style={{height: bar.secondaryHeight}}
                                />
                            </Box>
                        ))}
                    </Box>
                    <Box className={styles.legend}>
                        <Box className={styles.legendItem}>
                            <Box className={styles.legendDot} style={{backgroundColor: '#3f51b5'}}/>
                            <Typography variant="body2">Volume</Typography>
                        </Box>
                        <Box className={styles.legendItem}>
                            <Box className={styles.legendDot} style={{backgroundColor: '#e0e0e0'}}/>
                            <Typography variant="body2">Service</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Container 3: Key Issues */}
                <Box className={styles.container3}>
                    <Box className={styles.topProductsHeader}>
                        <Typography variant="h6">Key Issues</Typography>
                    </Box>
                    <TableContainer component={Paper} className={styles.paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Popularity</TableCell>
                                    <TableCell>Score</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {issues.map((issue, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{issue.name}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                <Box width="100%" mr={1}>
                                                    <LinearProgress variant="determinate" value={issue.popularity}/>
                                                </Box>
                                                <Box minWidth={35}>
                                                    <Typography variant="body2"
                                                                color="textSecondary">{`${issue.popularity}%`}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Paper className={styles.scoreContainer} elevation={0}>
                                                <Typography variant="body2">{issue.score}</Typography>
                                            </Paper>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Container 4: Vulnerabilities */}
                <Box className={styles.container4}>
                    <Paper className={styles.paper}>
                        <Box className={styles.earnings}>
                            <Typography variant="h6">Vulnerabilities</Typography>
                            <Typography variant="subtitle2">Total</Typography>
                            <Typography variant="h4">1,692 / 2,115</Typography>
                            <Typography variant="body2" className={styles.vulnerabilityInfo}>
                                Model is 48% More Vulnerable than last Scan
                            </Typography>
                            <Box display="flex" justifyContent="center" mt={2}>
                                <Box className={styles.donut}>
                                    <Typography variant="h5">{`${20}%`}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </Box>

            </Box>
        </Box>
    );
};

export default Dashboard;
