import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Container, Paper, Menu, MenuItem } from "@mui/material";
import styles from "../styles/Home.module.css";

const Home = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null>(null);

    const handleMenuOpen = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className={styles.root}>
            {/* Navigation Bar */}
            <AppBar position="static" className={styles.navbar}>
                <Toolbar className={styles.toolbar}>
                    <Typography variant="h6" className={styles.logo} onClick={() => navigate("/")}>
                        AI Scanner
                    </Typography>
                    <div>
                        <Button className={styles.authButton} onClick={handleMenuOpen}>
                            Account ▾
                        </Button>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={() => navigate("/login")}>Login</MenuItem>
                            <MenuItem onClick={() => navigate("/register")}>Register</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>

            {/* Hero Section */}
            <div className={styles.hero}>
                <Container className={styles.container}>
                    <Typography variant="h2">AI Vulnerability Scanner</Typography>
                    <Typography variant="subtitle1">Protecting AI Models from Query-Based Attacks</Typography>
                    <Button className={styles.ctaButton} onClick={() => navigate("/get-started")}>
                        Get Started
                    </Button>
                </Container>
            </div>

            {/* Features Section */}
            <section className={styles.features}>
                <Typography variant="h4">Key Features</Typography>
                <div className={styles.grid}>
                    {[
                        { title: "Query-Based Attack Detection", desc: "Prevents boundary-based and score-based attacks on AI models." },
                        { title: "Real-time Alerts", desc: "Get instant notifications when suspicious activity is detected." },
                        { title: "GDPR & HIPAA Compliance", desc: "Ensuring AI deployment meets privacy regulations." }
                    ].map((feature, index) => (
                        <Paper key={index} className={styles.card}>
                            <Typography variant="h6">{feature.title}</Typography>
                            <Typography variant="body2">{feature.desc}</Typography>
                        </Paper>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className={styles.howItWorks}>
                <Typography variant="h4">How It Works</Typography>
                <ol>
                    <li>AI model is monitored for incoming queries.</li>
                    <li>Scanner detects potential inversion attacks.</li>
                    <li>Mitigation strategies are applied in real-time.</li>
                </ol>
            </section>

            {/* Testimonials */}
            <section className={styles.testimonials}>
                <Typography variant="h4">Who Benefits?</Typography>
                <Typography variant="body1">AI companies, financial institutions, and healthcare providers.</Typography>
            </section>

            {/* Call to Action */}
            <section className={styles.cta}>
                <Typography variant="h4">Ready to Secure Your AI Models?</Typography>
                <Button className={styles.ctaButton} onClick={() => navigate("/get-started")}>
                    Get Started Now
                </Button>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <Typography variant="body1">AI Vulnerability Scanner</Typography>
                    <Typography variant="body2">TeamOne</Typography>
                </div>
                <div className={styles.copyright}>
                    &copy; {new Date().getFullYear()} AI Scanner. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
