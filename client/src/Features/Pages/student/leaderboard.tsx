import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, List, ListItem, Paper, Tabs, Tab } from '@mui/material';

interface Trainer {
    trainerid: number;
    course: string;
}

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

interface CourseData {
    course: string;
    batches: Batch[];
}

const LeaderBoard: React.FC = () => {
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [selectedCourseIndex, setSelectedCourseIndex] = useState<number>(0);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                const userId = localStorage.getItem('UserId'); // Get the user ID from local storage
                if (!userId) {
                    throw new Error('User ID not found in local storage');
                }

                // Step 1: Fetch trainers and courses for the student
                const trainersResponse = await fetch('http://localhost:5220/fetchtrainerbystuddent', {
                    method: 'POST',
                    headers: {
                        'accept': 'text/plain',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userId),
                });

                if (!trainersResponse.ok) {
                    throw new Error('Failed to fetch trainers');
                }

                const trainers: Trainer[] = await trainersResponse.json();

                // Step 2: Fetch batch details for each trainer
                const courseData: CourseData[] = [];
                for (const trainer of trainers) {
                    const batchResponse = await fetch('http://localhost:5220/fetchbatchdetails', {
                        method: 'POST',
                        headers: {
                            'accept': 'text/plain',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(trainer.trainerid),
                    });

                    if (!batchResponse.ok) {
                        throw new Error('Failed to fetch batch details');
                    }

                    const students: Student[] = await batchResponse.json();

                    // Transform the data into the desired format
                    const batchMap: { [key: number]: Student[] } = {};
                    students.forEach(student => {
                        if (!batchMap[student.batchno]) {
                            batchMap[student.batchno] = [];
                        }
                        batchMap[student.batchno].push(student);
                    });

                    const batches: Batch[] = Object.keys(batchMap).map(batchno => ({
                        batchno: parseInt(batchno),
                        students: batchMap[parseInt(batchno)],
                    }));

                    courseData.push({
                        course: trainer.course,
                        batches: batches,
                    });
                }

                setCourses(courseData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const selectedCourse = courses[selectedCourseIndex];

    return (
        <Box sx={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Leaderboard
            </Typography>

            {/* Tabs for Courses */}
            <Tabs
                value={selectedCourseIndex}
                onChange={(_, newValue) => setSelectedCourseIndex(newValue)}
                variant="scrollable"
                scrollButtons="auto"
            >
                {courses.map((course, index) => (
                    <Tab key={index} label={course.course} />
                ))}
            </Tabs>

            {/* Leaderboard for the Selected Course */}
            {selectedCourse && (
                <Box sx={{ marginTop: '20px' }}>
                    {selectedCourse.batches.map((batch) => (
                        <Paper key={batch.batchno} elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
                            <Typography variant="h6" gutterBottom>
                                Batch {batch.batchno}
                            </Typography>
                            <List>
                                {batch.students.map((student) => (
                                    <ListItem key={student.studentid}>
                                        <Typography>
                                            {student.name} - {student.score === 0 ? 'Test not taken yet' : `${student.score} points`}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default LeaderBoard;