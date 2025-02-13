import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5220';

interface Question {
  testid: number;
  trainerId: number;
  topic: string;
  questionId: number;
  question: string;
  options: string; // This is a JSON string
  answer: string;
}

const MyTestsPage: React.FC = () => {
  const [tests, setTests] = useState<{ [key: number]: Question[] }>({});
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      const userId = localStorage.getItem('UserId');
      if (!userId) {
        setError('User ID not found in localStorage.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post<Question[]>(
          `${API_BASE_URL}/fetchquestions`,
          JSON.stringify(userId),
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: '*/*',
            },
          }
        );

        // Group questions by testid
        const groupedTests = response.data.reduce<{ [key: number]: Question[] }>((acc, question) => {
          if (!acc[question.testid]) {
            acc[question.testid] = [];
          }
          acc[question.testid].push(question);
          return acc;
        }, {});

        setTests(groupedTests);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to fetch tests. Please try again.');
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Tests
      </Typography>

      {Object.entries(tests).map(([testid, questions]) => (
        <Accordion key={testid} expanded={selectedTestId === Number(testid)} onChange={() => setSelectedTestId(selectedTestId === Number(testid) ? null : Number(testid))}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Test ID: {testid} - Topic: {questions[0].topic}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {questions.map((question) => {
              const options = JSON.parse(question.options); // Parse the options JSON string
              return (
                <Paper key={question.questionId} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {question.question}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography>Option A: {options.OptionA}</Typography>
                    <Typography>Option B: {options.OptionB}</Typography>
                    <Typography>Option C: {options.OptionC}</Typography>
                    <Typography>Option D: {options.OptionD}</Typography>
                  </Box>
                  <Typography sx={{ mt: 1, color: 'green' }}>
                    Correct Answer: {question.answer}
                  </Typography>
                </Paper>
              );
            })}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default MyTestsPage;