import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    CircularProgress,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

interface UserDetails {
    userId: number;
    username: string;
    email: string;
    role: string;
    degree: string;
    specialization: string;
    phoneNumber: string;
    certifications: string;
    internshipDetails: string;
    college: string;
    linkedInProfileLink: string;
    programmingLanguagesKnown: string;
}

const AIFeedback: React.FC = () => {
    const [feedbackTexts, setFeedbackTexts] = useState<string[]>([]);
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch user details from localStorage
    const userDetails = JSON.parse(localStorage.getItem('UserDetails') || 'null') as UserDetails | null;

    useEffect(() => {
        fetchFeedbackData();
    }, []);

    const fetchFeedbackData = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedback_texts: [
                        "The questions were easy!",
                        "Very disappointed with the tests.",
                        "Nice coaching.",
                        "The website is easy to use, but response times are slow."
                    ]
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setFeedbackTexts(data.topics);
            setApiResponse(data);
        } catch (error) {
            console.error('Error fetching feedback:', error);
            // Fallback to hardcoded response if API fails
            const dummyResponse = {
                "GenAI Suggestions": "Based on the feedback received for the trainer, here are some suggestions for an improvement plan: ### Improvement Plan for Trainer 1. **Enhance Support Services:** - **Action:** Conduct a thorough review of the current support system to identify gaps and areas of improvement. - **Implementation:** - Schedule regular training sessions for support staff to improve their responsiveness and problem-solving skills. - Introduce a feedback loop where participants can report their support experiences immediately after receiving assistance. 2. **Optimize Website Performance:** - **Action:** Investigate the issues causing slow website performance that users have mentioned. - **Implementation:** - Collaborate with IT specialists to conduct a full audit of the website's speed and usability. - Implement necessary updates or changes based on user feedback to enhance user experience. 3. **Improve Communication Channels:** - **Action:** Establish clearer communication channels between trainers and participants regarding support services. - **Implementation:** - Create an FAQ section on the website addressing common concerns and questions related to service and support. - Set up regular check-ins (e.g., weekly or bi-weekly) via email or forums where participants can voice their concerns or suggestions directly. 4. **Solicit Continuous Feedback:** - **Action:** Develop a structured feedback mechanism post-training sessions to gather insights from participants regularly. - **Implementation:** - Use surveys, polls, or focus groups after each training session to collect immediate reactions and suggestions for improvement. 5. **Highlight Positive Experiences:** - **Action:** Share success stories and positive testimonials from satisfied participants more prominently in marketing materials. - **Implementation:** - Create case studies showcasing how effective service has helped past participants achieve their goals, which can also serve as motivation for continuous improvement. 6. **Regular Training & Development for Trainers:** - **Action:** Ensure that trainers themselves are continuously developing their skills in both content delivery and participant engagement strategies. - **Implementation:** - Organize workshops focused on advanced teaching methods, emotional intelligence, and customer service excellence tailored specifically towards training environments. 7. **Address Specific Negative Feedback Directly:** -**Action** Review specific instances where negative feedback was received (e.g., 'Very disappointed with the support'). * Implementation: * Reach out directly to individuals who provided negative feedback to understand their experiences better and discuss potential resolutions or improvements being made. ### Conclusion By focusing on these key areas—support enhancement, website optimization, improved communication, continuous feedback collection, highlighting positives, trainer development, and addressing specific concerns—the trainer can create a more positive experience for all participants while mitigating any negative sentiments expressed in recent reviews.",
                "insights": {
                    "Negative Feedback": 1,
                    "Neutral Feedback": 0,
                    "Positive Feedback": 2,
                    "Top Suggestions": [
                        "Very disappointed with the support."
                    ]
                },
                "sentiments": [
                    "Positive",
                    "Negative",
                    "Positive"
                ],
                "topics": [
                    "Topic 1: service, amazing, support, disappointed, use",
                    "Topic 2: website, use, times, slow, easy",
                    "Topic 3: support, disappointed, amazing, service, use"
                ]
            };
            setFeedbackTexts(dummyResponse.topics);
            setApiResponse(dummyResponse);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!apiResponse) return;
    
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height; // Get the height of the PDF page
        let yPosition = 10; // Initial Y position
    
        // Function to add a new page and reset yPosition
        const addNewPage = () => {
            doc.addPage();
            yPosition = 10; // Reset Y position for the new page
        };
    
        // Add main heading
        doc.setFontSize(18);
        doc.text('Hexaware Trainer Report', 10, yPosition);
        yPosition += 10;
    
        // Add user details
        if (userDetails) {
            doc.setFontSize(12);
            doc.text(`Name: ${userDetails.username}`, 10, yPosition);
            yPosition += 7;
            if (userDetails.email) {
                doc.text(`Email: ${userDetails.email}`, 10, yPosition);
                yPosition += 7;
            }
            if (userDetails.phoneNumber) {
                doc.text(`Phone: ${userDetails.phoneNumber}`, 10, yPosition);
                yPosition += 7;
            }
            yPosition += 5; // Add some space after user details
        }
    
        // Check if content exceeds page height and add a new page if necessary
        if (yPosition > pageHeight - 20) {
            addNewPage();
        }
    
        // **Sentiments**
        doc.setFontSize(14);
        doc.text('Sentiments:', 10, yPosition);
        yPosition += 7;
        apiResponse.sentiments.forEach((sentiment: string, index: number) => {
            if (yPosition > pageHeight - 20) {
                addNewPage();
            }
            doc.text(`${index + 1}. ${sentiment}`, 15, yPosition);
            yPosition += 7;
        });
    
        yPosition += 5;
    
        // Check if content exceeds page height and add a new page if necessary
        if (yPosition > pageHeight - 20) {
            addNewPage();
        }
    
        // **Topics**
        doc.text('Topics:', 10, yPosition);
        yPosition += 7;
        apiResponse.topics.forEach((topic: string, index: number) => {
            const wrappedText = doc.splitTextToSize(`${index + 1}. ${topic}`, 180); // Wrap text to fit the page
            if (yPosition + wrappedText.length * 7 > pageHeight - 20) {
                addNewPage();
            }
            doc.text(wrappedText, 15, yPosition);
            yPosition += wrappedText.length * 7; // Adjust Y position dynamically
        });
    
        yPosition += 5;
    
        // Check if content exceeds page height and add a new page if necessary
        if (yPosition > pageHeight - 20) {
            addNewPage();
        }
    
        // **Insights**
        doc.text('Insights:', 10, yPosition);
        yPosition += 7;
        Object.entries(apiResponse.insights).forEach(([key, value], _) => {
            if (yPosition > pageHeight - 20) {
                addNewPage();
            }
            doc.text(`${key}:`, 10, yPosition);
            yPosition += 7;
    
            if (Array.isArray(value)) {
                value.forEach((item: string) => {
                    const wrappedItem = doc.splitTextToSize(`- ${item}`, 180);
                    if (yPosition + wrappedItem.length * 7 > pageHeight - 20) {
                        addNewPage();
                    }
                    doc.text(wrappedItem, 15, yPosition);
                    yPosition += wrappedItem.length * 7;
                });
            } else {
                const wrappedValue = doc.splitTextToSize(`${value}`, 180);
                if (yPosition + wrappedValue.length * 7 > pageHeight - 20) {
                    addNewPage();
                }
                doc.text(wrappedValue, 15, yPosition);
                yPosition += wrappedValue.length * 7;
            }
        });
    
        yPosition += 5;
    
        // Check if content exceeds page height and add a new page if necessary
        if (yPosition > pageHeight - 20) {
            addNewPage();
        }
    
        // **GenAI Suggestions**
        doc.setFontSize(14);
        doc.text('GenAI Suggestions:', 10, yPosition);
        yPosition += 7;
        const formattedSuggestions = apiResponse['GenAI Suggestions']
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);
        formattedSuggestions.forEach((line: string) => {
            const wrappedLine = doc.splitTextToSize(line, 180);
            if (yPosition + wrappedLine.length * 7 > pageHeight - 20) {
                addNewPage();
            }
            doc.text(wrappedLine, 15, yPosition);
            yPosition += wrappedLine.length * 7;
        });
    
        doc.save('Hexaware_Trainer_Report.pdf');
    };
    const chartData = {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
            {
                label: 'Feedback Sentiments',
                data: apiResponse
                    ? [
                        apiResponse.insights['Positive Feedback'],
                        apiResponse.insights['Negative Feedback'],
                        apiResponse.insights['Neutral Feedback'],
                    ]
                    : [],
                backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
            },
        ],
    };

    return (
        <Box sx={{ padding: '30px', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', marginBottom: '30px' }}>
                AI Feedback Analysis
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper elevation={3} sx={{ padding: '20px', borderRadius: '8px' }}>
                    <Accordion sx={{ marginBottom: '10px' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Feedback Topics</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List sx={{ paddingLeft: '20px' }}>
                                {feedbackTexts.map((text, index) => (
                                    <ListItem key={index} sx={{ padding: '8px 0' }}>
                                        {text}
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    {apiResponse && (
                        <>
                            {/* Sentiment Analysis */}
                            <Accordion sx={{ marginBottom: '10px' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">Sentiments</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body1">
                                        Sentiments: {apiResponse.sentiments.join(', ')}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>

                            {/* Topics */}
                            <Accordion sx={{ marginBottom: '10px' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">Topics</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List sx={{ paddingLeft: '20px' }}>
                                        {apiResponse.topics.map((topic: string, index: number) => (
                                            <ListItem key={index} sx={{ padding: '8px 0' }}>
                                                {topic}
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>

                            {/* Graph Section */}
                            <Box sx={{ marginTop: '20px', maxWidth: '600px', margin: '0 auto' }}>
                                <Bar data={chartData} options={{ responsive: true }} />
                            </Box>

                            {/* Insights */}
                            <Accordion sx={{ marginBottom: '10px' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">Insights</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                                            Positive Feedback: {apiResponse.insights['Positive Feedback']}
                                        </Typography>
                                        <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                                            Negative Feedback: {apiResponse.insights['Negative Feedback']}
                                        </Typography>
                                        <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                                            Neutral Feedback: {apiResponse.insights['Neutral Feedback']}
                                        </Typography>
                                        <Typography variant="body1" sx={{ marginBottom: '10px' }}>
                                            Top Suggestions:
                                        </Typography>
                                        {apiResponse.insights['Top Suggestions'].map((suggestion: string, index: number) => (
                                            <Typography key={index} variant="body2" sx={{ paddingLeft: '20px' }}>
                                                - {suggestion}
                                            </Typography>
                                        ))}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>

                            {/* GenAI Suggestions */}
                            <Accordion sx={{ marginBottom: '10px' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">GenAI Suggestions</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body1" component="div">
                                        {apiResponse['GenAI Suggestions']
                                            .split('\n')
                                            .map((line: string, index: number) => (
                                                <Typography key={index} variant="body2" sx={{ marginBottom: '10px' }}>
                                                    {line}
                                                </Typography>
                                            ))}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>

                            {/* Download PDF Button */}
                            <Grid container spacing={2} sx={{ marginTop: '20px' }}>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleDownloadPDF}
                                        sx={{
                                            width: '100%',
                                            padding: '10px',
                                            fontWeight: 'bold',
                                            borderRadius: '5px',
                                        }}
                                    >
                                        Download PDF
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default AIFeedback;