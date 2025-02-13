import React, { useState, useEffect } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Button,
    Box,
    List,
    ListItem,
    Modal,
    Radio,
    RadioGroup,
    FormControlLabel,
    TextField,
    LinearProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5220';

interface Question {
    testid: number;
    trainerId: number;
    topic: string;
    questionId: number;
    question: string;
    options: string;
    answer: string;
}

interface Score {
    scoreid: number;
    studneid: number;
    testid: number;
    score: number;
}

interface Topic {
    testid: number;
    topic: string;
    questions: Question[];
    completed: boolean;
    score?: number;
}

interface Trainer {
    trainerId: number;
    name: string;
    email: string;
    phoneNumber: string;
    specialization: string;
    tests: Topic[];
    review?: string;
}

const StudentAssignments: React.FC = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [_, setScores] = useState<Score[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [review, setReview] = useState<string>('');
    const studentId = localStorage.getItem('UserId');

    useEffect(() => {
        if (studentId) {
            fetchDataSequentially();
        }
    }, [studentId]);

    // Fetch data sequentially
    const fetchDataSequentially = async () => {
        try {
            // Step 1: Fetch tests
            console.log('Fetching tests...');
            const testsResponse = await axios.post<{ tests: any[] }>(
                `${API_BASE_URL}/fetchtests`,
                JSON.stringify(studentId),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'text/plain',
                    },
                }
            );
            const tests = testsResponse.data.tests;
            console.log('Tests fetched:', tests);

            // Step 2: Fetch scores
            console.log('Fetching scores...');
            const scoresResponse = await axios.post<Score[]>(
                `${API_BASE_URL}/fetchscores`,
                JSON.stringify(studentId),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'text/plain',
                    },
                }
            );
            setScores(scoresResponse.data);
            console.log('Scores fetched:', scoresResponse.data);

            // Step 3: Fetch questions for all trainers
            const trainersMap: { [key: number]: Trainer } = {};

            // Initialize trainersMap with data from tests
            tests.forEach((test) => {
                const trainerId = test.trainerid;
                if (!trainersMap[trainerId]) {
                    trainersMap[trainerId] = {
                        trainerId: trainerId,
                        name: '',
                        email: '',
                        phoneNumber: '',
                        specialization: '',
                        tests: [],
                        review: test.review || undefined,
                    };
                }
            });

            // Fetch trainer details for each trainer
            for (const trainerId of Object.keys(trainersMap)) {
                console.log(`Fetching trainer details for trainer: ${trainerId}`);
                const trainerDetailsResponse = await axios.post<Trainer>(
                    `${API_BASE_URL}/fetchtrainerdetails`,
                    JSON.stringify(trainerId),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'text/plain',
                        },
                    }
                );
                const trainerDetails = trainerDetailsResponse.data;
                trainersMap[parseInt(trainerId, 10)] = {
                    ...trainersMap[parseInt(trainerId, 10)],
                    ...trainerDetails,
                };
            }

            // Fetch questions for each trainer
            for (const trainerId of Object.keys(trainersMap)) {
                console.log(`Fetching questions for trainer: ${trainerId}`);
                const questionsResponse = await axios.post<Question[]>(
                    `${API_BASE_URL}/fetchquestions`,
                    JSON.stringify(trainerId), // Fetch questions for the current trainer
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'text/plain',
                        },
                    }
                );
                const questions = questionsResponse.data;
                console.log(`Questions fetched for trainer ${trainerId}:`, questions);

                // Organize questions into topics
                const topicsMap: { [key: string]: Topic } = {};
                questions.forEach((question) => {
                    const key = `${question.testid}-${question.topic}`;
                    if (!topicsMap[key]) {
                        topicsMap[key] = {
                            testid: question.testid,
                            topic: question.topic,
                            questions: [],
                            completed: false,
                        };
                    }
                    topicsMap[key].questions.push(question);
                });

                // Mark completed topics based on scores
                const topicsList = Object.values(topicsMap).map((topic) => {
                    const score = scoresResponse.data.find((s) => s.testid === topic.testid);
                    return {
                        ...topic,
                        completed: !!score,
                        score: score?.score,
                    };
                });

                // Add topics to the respective trainer
                trainersMap[parseInt(trainerId, 10)].tests = topicsList;
            }

            // Convert trainersMap to an array and update state
            setTrainers(Object.values(trainersMap));
            console.log('Trainers organized:', trainersMap);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Handle taking a test for a specific topic
    const handleTakeTest = (topic: Topic) => {
        setSelectedTopic(topic);
        setIsModalOpen(true);
    };

    // Handle answer selection
    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: answer,
        }));
    };

    // Submit assessment and update score
    const submitAssessment = async () => {
        if (!selectedTopic) return;

        // Evaluate answers
        let correctAnswers = 0;
        selectedTopic.questions.forEach((question) => {
            if (answers[question.questionId] === question.answer) {
                correctAnswers++;
            }
        });

        const score = (correctAnswers / selectedTopic.questions.length) * 100;

        try {
            console.log('Updating score...');
            const response = await axios.post<{ message: string }>(
                `${API_BASE_URL}/updatescore`,
                {
                    studentid: studentId,
                    testid: selectedTopic.testid.toString(),
                    score: score,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'text/plain',
                    },
                }
            );
            console.log('Score updated:', response.data.message);
            fetchDataSequentially(); // Refresh data after updating score
        } catch (error) {
            console.error('Error updating score:', error);
        }

        setIsModalOpen(false);
        setAnswers({});
    };

    // Handle review submission
    const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReview(e.target.value);
    };

    const submitReview = async (trainerId: number) => {
        try {
            console.log(trainerId+'YHSTFDHJAGF')
            const response = await axios.post<{ message: string }>(
                `${API_BASE_URL}/Updatereview`,
                {
                    studentid: studentId,
                    review: review,
                    trainerid: trainerId,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: '*/*',
                    },
                }
            );
            console.log('Review submitted:', response.data.message);
            alert('Review submitted successfully!');
            setReview('');
            fetchDataSequentially(); // Refresh data after submitting review
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    // Calculate progress for a trainer's tests
    const calculateProgress = (tests: Topic[]) => {
        const completedTests = tests.filter((test) => test.completed).length;
        return (completedTests / tests.length) * 100;
    };

    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Student Assignments
            </Typography>
            {trainers.map((trainer) => (
                <Accordion key={trainer.trainerId} sx={{ marginBottom: '10px' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">
                            {trainer.specialization} - Instructor: {trainer.name}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={calculateProgress(trainer.tests)}
                                sx={{ height: 10, borderRadius: 5 }}
                            />
                        </Box>
                        <List>
                            {trainer.tests.map((topic) => (
                                <Accordion key={`${topic.testid}-${topic.topic}`} sx={{ marginBottom: '10px' }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="h6">
                                            {topic.topic} {topic.completed && `- Score: ${topic.score}`}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ marginTop: '20px' }}>
                                            {topic.completed ? (
                                                <Typography variant="body2">
                                                    You have already completed this test.
                                                </Typography>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleTakeTest(topic)}
                                                >
                                                    Take Test
                                                </Button>
                                            )}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </List>
                        {trainer.review ? (
                            <Typography variant="body2">
                                Review: {trainer.review}
                            </Typography>
                        ) : (
                            <Box sx={{ marginTop: '20px' }}>
                                
                                {trainer.tests.every((test) => test.completed) ? (
                                    <>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            placeholder="Provide your review here..."
                                            value={review}
                                            onChange={handleReviewChange}
                                            sx={{ marginBottom: '10px' }}
                                        />
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => submitReview(trainer.trainerId)}
                                            disabled={!review}
                                        >
                                            Submit Review
                                        </Button>
                                    </>
                                ) : (
                                    <Typography variant="body2">
                                        You can submit a review only after completing all tests.
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}

            {/* Modal for Taking Test */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        maxHeight: '80vh', // Set a maximum height for the modal
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Test: {selectedTopic?.topic}
                    </Typography>
                    <Box
                        sx={{
                            overflowY: 'auto', // Enable vertical scrolling
                            flexGrow: 1, // Allow the questions to take up available space
                            mb: 2, // Add margin at the bottom
                        }}
                    >
                        <List>
                            {selectedTopic?.questions.map((question) => (
                                <ListItem key={question.questionId}>
                                    <Box>
                                        <Typography>{question.question}</Typography>
                                        <RadioGroup
                                            value={answers[question.questionId] || ''}
                                            onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                                        >
                                            {Object.entries(JSON.parse(question.options)).map(([key, value]) => (
                                                <FormControlLabel
                                                    key={key}
                                                    value={key}
                                                    control={<Radio />}
                                                    label={`${key}: ${value}`}
                                                />
                                            ))}
                                        </RadioGroup>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Button variant="contained" color="primary" onClick={submitAssessment}>
                            Submit Test
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default StudentAssignments;