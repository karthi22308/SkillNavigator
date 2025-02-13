import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, List, ListItem, Paper } from '@mui/material';

interface Student {
    trainerid: number;
    studentid: number;
    batchno: number;
    name: string;
    score: number;
}

interface Batch {
    batchno: number;
    students: Student[];
}

const LeaderBoard: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatchNo, setSelectedBatchNo] = useState<number | null>(null);

    useEffect(() => {
        const fetchBatches = async (): Promise<void> => {
            try {
                const userId = localStorage.getItem('UserId'); // Get the user ID from local storage
                if (!userId) {
                    throw new Error('User ID not found in local storage');
                }

                const response = await fetch('http://localhost:5220/fetchbatchdetails', {
                    method: 'POST',
                    headers: {
                        'accept': 'text/plain',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userId), // Pass the user ID in the request body
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data: Student[] = await response.json();

                // Transform the data into the desired format
                const batchMap: { [key: number]: Student[] } = {};
                data.forEach(student => {
                    if (!batchMap[student.batchno]) {
                        batchMap[student.batchno] = [];
                    }
                    batchMap[student.batchno].push(student);
                });

                const formattedBatches: Batch[] = Object.keys(batchMap).map(batchno => ({
                    batchno: parseInt(batchno),
                    students: batchMap[parseInt(batchno)],
                }));

                setBatches(formattedBatches);
                if (formattedBatches.length > 0) {
                    setSelectedBatchNo(formattedBatches[0].batchno); // Set the first batch as the default selection
                }
            } catch (error) {
                console.error('Error fetching batches:', error);
            }
        };

        fetchBatches();
    }, []);

    const selectedBatch = batches.find((batch) => batch.batchno === selectedBatchNo);

    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Leaderboard
            </Typography>

            {/* Horizontal Nav Bar for Batches */}
            <Box sx={{ display: 'flex', gap: 2, marginBottom: '20px', overflowX: 'auto' }}>
                {batches.map((batch) => (
                    <Button
                        key={batch.batchno}
                        variant={batch.batchno === selectedBatchNo ? 'contained' : 'outlined'}
                        onClick={() => setSelectedBatchNo(batch.batchno)}
                    >
                        Batch {batch.batchno}
                    </Button>
                ))}
            </Box>

            {/* Leaderboard for the Selected Batch */}
            <Paper elevation={3} sx={{ padding: '20px' }}>
                <Typography variant="h6" gutterBottom>
                    {selectedBatch ? `Batch ${selectedBatch.batchno}` : 'Select a Batch'}
                </Typography>
                {selectedBatch && (
                    <List>
                        {selectedBatch.students.map((student) => (
                            <ListItem key={student.studentid}>
                                <Typography>
                                    {student.name} - {student.score === 0 ? 'Test not taken yet' : `${student.score} points`}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
};

export default LeaderBoard;