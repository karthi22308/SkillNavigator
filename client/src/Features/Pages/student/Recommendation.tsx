import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, List, ListItem, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import jsPDF from 'jspdf';

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

const AIRecommendations = () => {
    const [scores, setScores] = useState({ technical_score: 0, soft_skill_score: 0 });
    const [strengthAreas, setStrengthAreas] = useState<string[]>([]);
    const [weakAreas, setWeakAreas] = useState<string[]>([]);
    const [recommendedCourses, setRecommendedCourses] = useState<string[]>([]);
    const [genAiSuggestion, setGenAiSuggestion] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Fetch user details from localStorage
    const userDetails = JSON.parse(localStorage.getItem('UserDetails') || 'null') as UserDetails | null;

    // Simulate API call on component mount
    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://127.0.0.1:8001/recommend', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        technical_score: 75,
                        soft_skill_score: 80,
                        strength_areas: ["Java", "Python"],
                        weak_areas: ["SQL"]
                    }),
                });
                const data = await response.json();
                setScores({
                    technical_score: 75,
                    soft_skill_score: 80,
                });
                setStrengthAreas(["Java", "Python"]);
                setWeakAreas(["SQL"]);
                setRecommendedCourses(data.recommended_courses);
                setGenAiSuggestion(data.gen_ai_suggestion);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height; // Get the page height
        const margin = 20; // Top and bottom margins
        const lineHeight = 10; // Height of each line
        let cursorY = margin;

        // Function to add text and handle page breaks
        const addWrappedText = (text: string, x: number, wrapWidth: number) => {
            const lines = doc.splitTextToSize(text, wrapWidth); // Wrap text to fit within the width
            lines.forEach((line: string) => { // Explicitly type `line` as string
                if (cursorY + lineHeight > pageHeight - margin) {
                    doc.addPage(); // Add a new page if the text overflows
                    cursorY = margin;
                }
                doc.text(line, x, cursorY);
                cursorY += lineHeight;
            });
        };

        // Add title
        doc.setFontSize(16);
        doc.text('Hexaware AI Recommendations Report', margin, cursorY);
        cursorY += 20;

        // Add user details if available
        if (userDetails) {
            doc.setFontSize(12);
            addWrappedText(`User ID: ${userDetails.userId}`, margin, 180);
            addWrappedText(`Username: ${userDetails.username}`, margin, 180);
            addWrappedText(`Email: ${userDetails.email}`, margin, 180);
            addWrappedText(`Role: ${userDetails.role}`, margin, 180);
            addWrappedText(`Degree: ${userDetails.degree}`, margin, 180);
            addWrappedText(`Specialization: ${userDetails.specialization}`, margin, 180);
            addWrappedText(`Phone Number: ${userDetails.phoneNumber}`, margin, 180);
            addWrappedText(`Certifications: ${userDetails.certifications}`, margin, 180);
            addWrappedText(`Internship Details: ${userDetails.internshipDetails}`, margin, 180);
            addWrappedText(`College: ${userDetails.college}`, margin, 180);
            addWrappedText(`LinkedIn Profile: ${userDetails.linkedInProfileLink}`, margin, 180);
            addWrappedText(`Programming Languages Known: ${userDetails.programmingLanguagesKnown}`, margin, 180);
            cursorY += 20;
        }

        // Add scores
        doc.setFontSize(12);
        addWrappedText(`Technical Score: ${scores.technical_score}`, margin, 180);
        addWrappedText(`Soft Skill Score: ${scores.soft_skill_score}`, margin, 180);

        // Add strength areas
        addWrappedText('Strength Areas:', margin, 180);
        strengthAreas.forEach((area) => {
            addWrappedText(`- ${area}`, margin + 10, 180);
        });

        // Add weak areas
        addWrappedText('Weak Areas:', margin, 180);
        weakAreas.forEach((area) => {
            addWrappedText(`- ${area}`, margin + 10, 180);
        });

        // Add recommended courses
        addWrappedText('Recommended Courses:', margin, 180);
        recommendedCourses.forEach((course) => {
            addWrappedText(`- ${course}`, margin + 10, 180);
        });

        // Add AI suggestion
        addWrappedText('AI Suggestion:', margin, 180);
        addWrappedText(genAiSuggestion, margin + 10, 180);

        // Save the PDF
        doc.save('Hexaware_AI_Recommendations_Report.pdf');
    };

    return (
        <Box sx={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ marginBottom: '30px' }}>
                AI Recommendations
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    {/* Technical and Soft Skill Scores */}
                    <Accordion sx={{ marginBottom: '10px' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Scores</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>Technical Score: {scores.technical_score}</Typography>
                            <Typography>Soft Skill Score: {scores.soft_skill_score}</Typography>
                        </AccordionDetails>
                    </Accordion>

                    {/* Strength Areas */}
                    <Accordion sx={{ marginBottom: '10px' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Strength Areas</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {strengthAreas.map((area, index) => (
                                    <ListItem key={index}>{area}</ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    {/* Weak Areas */}
                    <Accordion sx={{ marginBottom: '10px' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Weak Areas</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {weakAreas.map((area, index) => (
                                    <ListItem key={index}>{area}</ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    {/* Recommended Courses */}
                    <Accordion sx={{ marginBottom: '10px' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Recommended suggestions</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {recommendedCourses.map((course, index) => (
                                    <ListItem key={index}>{course}</ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    {/* AI Suggestion */}
                    <Accordion sx={{ marginBottom: '10px' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">AI Suggestion</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>{genAiSuggestion}</Typography>
                        </AccordionDetails>
                    </Accordion>

                    {/* Download PDF Button */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Button variant="contained" color="secondary" onClick={generatePDF} sx={{ marginTop: '20px' }}>
                            Download PDF
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default AIRecommendations;