import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5220';

// Define the structure of a question
interface Question {
  desc: string;
  options: {
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
  };
  correctAnswer: string;
}

const CreateTestPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [_, setMessage] = useState<string | null>(null);

  // Handle generating questions from the API
  const handleGenerateQuestions = async () => {
    if (!selectedTopic.trim()) {
      setMessage('Please enter a topic!');
      return;
    }

    try {
      const response = await axios.post<Question[]>(
        `${API_BASE_URL}/createtest`,
        JSON.stringify(selectedTopic),
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        }
      );

      if (response.data) {
        setQuestions(response.data);
        setMessage('Questions generated successfully!');
      } else {
        setMessage('Failed to generate questions. Please try again.');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setMessage('An error occurred while generating questions. Please try again.');
    }
  };

  // Handle changes to the question description
  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const updatedQuestions = [...questions];
  
    // Handle changes to the `desc` or `correctAnswer` fields
    if (field === 'desc' || field === 'correctAnswer') {
      updatedQuestions[index][field] = value;
    }
  
    setQuestions(updatedQuestions);
  };
  
  const handleOptionChange = (questionIndex: number, option: keyof Question['options'], value: string) => {
    const updatedQuestions = [...questions];
  
    // Handle changes to the `options` field
    updatedQuestions[questionIndex].options[option] = value;
  
    setQuestions(updatedQuestions);
  };

  // Handle submitting the test to the API
  const handleSubmitTest = async () => {
    const userId = localStorage.getItem('UserId');
    const testData = {
      topic: selectedTopic,
      trainerid: userId,
      mod: questions,
    };

    try {
      const response = await axios.post<{ message: string }>(
        `${API_BASE_URL}/storetest`,
        testData,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
          },
        }
      );

      if (response.data?.message === 'test creation successful!') {
        setMessage('Test submitted successfully!');
      } else {
        setMessage('Failed to submit test. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setMessage('An error occurred while submitting the test. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #1E90FF, #FFFFFF)',
        padding: '20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h4" sx={{ color: '#FFFFFF', mb: 2, textAlign: 'center' }}>
        Create a Test
      </Typography>
      <Typography variant="subtitle1" sx={{ color: '#FFFFFF', mb: 5, textAlign: 'center' }}>
        Powered by Hexavarsity SecureAPI
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '800px',
          gap: 3,
        }}
      >
        {/* Topic Input */}
        <TextField
          label="Enter a Topic"
          variant="outlined"
          fullWidth
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '5px',
            width: '100%',
            maxWidth: '800px',
          }}
        />

        {/* Generate Questions Button */}
        <Button
          variant="contained"
          color="primary"
          sx={{ width: '100%' }}
          onClick={handleGenerateQuestions}
        >
          Generate Questions
        </Button>

        {/* Display and Edit Questions */}
        {questions.map((question, index) => (
          <Box
            key={index}
            sx={{
              width: '100%',
              bgcolor: '#FFFFFF',
              p: 2,
              borderRadius: '5px',
              mt: 2,
            }}
          >
            <TextField
              label="Question"
              variant="outlined"
              fullWidth
              value={question.desc}
              onChange={(e) => handleQuestionChange(index, 'desc', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Option A"
              variant="outlined"
              fullWidth
              value={question.options.optionA}
              onChange={(e) => handleOptionChange(index, 'optionA', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Option B"
              variant="outlined"
              fullWidth
              value={question.options.optionB}
              onChange={(e) => handleOptionChange(index, 'optionB', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Option C"
              variant="outlined"
              fullWidth
              value={question.options.optionC}
              onChange={(e) => handleOptionChange(index, 'optionC', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Option D"
              variant="outlined"
              fullWidth
              value={question.options.optionD}
              onChange={(e) => handleOptionChange(index, 'optionD', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Correct Answer"
              variant="outlined"
              fullWidth
              value={question.correctAnswer}
              onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
            />
          </Box>
        ))}

        {/* Submit Test Button */}
        {questions.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            sx={{ width: '100%', mt: 3 }}
            onClick={handleSubmitTest}
          >
            Submit Test
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CreateTestPage;
