import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from '../styles/FAQ.module.css';
import Sidebar from "../components/Sidebar";

const faqData = [
    {
        question: "What is an Adversarial Input Attack?",
        answer: "An Adversarial Input Attack is a technique where small, intentionally crafted perturbations are added to input data to fool a machine learning model."
    },
    {
        question: "What models can be tested?",
        answer: "You can test CNN models such as ResNet-50, VGG-16, and Inception."
    },
    {
        question: "How long does a scan take?",
        answer: "A typical scan takes anywhere from a few minutes to an hour, depending on the complexity of the model."
    },
    {
        question: "Can I run multiple tests at once?",
        answer: "Currently, only one test can be run at a time per session."
    },
    {
        question: "Is the test data stored?",
        answer: "No, all test data is processed in-memory and is not stored permanently."
    }
];

const FAQ = ({ className, ...props }: { className: any }) => {
    return (
        <Box className={`${styles.faqPage} ${className}`} {...props}>
            <Sidebar />

            {/* Main Content */}
            <Box className={styles.mainContent}>
                <Typography variant="h4" className={styles.header}>
                    Frequently Asked Questions
                </Typography>

                {faqData.map((faq, index) => (
                    <Accordion key={index} className={styles.accordion}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6" className={styles.question}>
                                {faq.question}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1" className={styles.answer}>
                                {faq.answer}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Box>
    );
};

export default FAQ;
