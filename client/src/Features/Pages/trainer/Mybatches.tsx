import React, { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Student {
    trainerid: number;
    studentid: number;
    batchno: number;
    name: string;
}

interface Batch {
    batchno: number;
    students: Student[];
}

const TrainerBatches: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);

    useEffect(() => {
        const fetchBatches = async (): Promise<void> => {
            try {
                const response = await fetch('http://localhost:5220/fetchbatchdetails', {
                    method: 'POST',
                    headers: {
                        'accept': 'text/plain',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(localStorage.getItem('UserId')), // Replace with the actual trainer ID if needed
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
            } catch (error) {
                console.error('Error fetching batches:', error);
            }
        };

        fetchBatches();
    }, []);

    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>Trainer Batches</Typography>
            {batches.length === 0 ? (
                <Typography variant="h6" color="error">No batches available at the moment. Please contact the Hexaware admin.</Typography>
            ) : (
                batches.map(batch => (
                    <Accordion key={batch.batchno} sx={{ marginBottom: '10px' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Batch {batch.batchno}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {batch.students.length === 0 ? (
                                <Typography variant="body2" color="textSecondary">
                                    This batch is not allotted yet. Please contact the Hexaware admin.
                                </Typography>
                            ) : (
                                <List>
                                    {batch.students.map(student => (
                                        <ListItem key={student.studentid}>
                                            <Typography>{student.name}</Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </Box>
    );
};

export default TrainerBatches;
