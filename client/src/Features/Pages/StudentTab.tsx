import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Avatar, Tooltip, MenuItem, Select, FormControl, Button, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5220';

const fetchstudents = async () => {
    console.log(`${API_BASE_URL}/fetchstudents'`)
    const response = await axios.post(`${API_BASE_URL}/fetchstudents`);
    return response.data;
};

const checkbatch = async () => {
    console.log(`${API_BASE_URL}/checkbatch'`)
    const response = await axios.post(`${API_BASE_URL}/checkbatch`);
    return response.data;
};

const allotbatches = async () => {
    const response = await axios.post(`${API_BASE_URL}/allotbatches`);
    return response.data;
};

interface Student {
    userId: number;
    username: string;
    email: string;
    degree: string | null;
    specialization: string | null;
    certifications: string | null;
    phoneNumber: string | null;
    internshipDetails: string | null;
    college: string | null;
    linkedInProfileLink: string | null;
    programmingLanguagesKnown: string | null;
}

const StudentTab: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [colleges, setColleges] = useState<string[]>([]);
    const [selectedCollege, setSelectedCollege] = useState<string>('All');
    const [batchAllocated, setBatchAllocated] = useState<boolean | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    useEffect(() => {
        fetchstudents()
            .then((data: Student[]) => {
                console.log("API Response:", data);
                setStudents(data);
                setFilteredStudents(data);

                const uniqueColleges = Array.from(new Set(data.map(student => student.college || 'Unknown')));
                console.log("Unique Colleges:", colleges);
                setColleges(['All', ...uniqueColleges]);
            })
            .catch(error => console.error('Error fetching students:', error));

        checkbatch()
            .then((data: number) => {
                setBatchAllocated(data === 1);
            })
            .catch(error => console.error('Error checking batch status:', error));
    }, []);

    useEffect(() => {
        const filtered = selectedCollege === 'All'
            ? students
            : students.filter(student => student.college === selectedCollege);
        setFilteredStudents(filtered);
    }, [selectedCollege, students]);

    const handleAllotBatches = async () => {
        try {
            const result = await allotbatches();
            if (result === 1) {
                setBatchAllocated(true);
                setSnackbarMessage('Batches created successfully!');
                setSnackbarSeverity('success');
            } else {
                setSnackbarMessage('Failed to create batches.');
                setSnackbarSeverity('error');
            }
        } catch (error) {
            setSnackbarMessage('Error creating batches.');
            setSnackbarSeverity('error');
        } finally {
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom, #1E90FF, #FFFFFF)',
                padding: '20px',
                flex: 1,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h4" sx={{ color: '#FFFFFF' }}>
                    Student List
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {batchAllocated !== null && (
                        <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                            {batchAllocated ? 'Batches created successfully!' : 'Batches not allocated.'}
                        </Typography>
                    )}
                    {batchAllocated === false && (
                        <Button variant="contained" color="primary" onClick={handleAllotBatches}>
                            Allot Batches
                        </Button>
                    )}

                    <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                        Filter by College:
                    </Typography>
                    <FormControl size="small" variant="outlined" sx={{ minWidth: 200 }}>
                        <Select
                            value={selectedCollege}
                            onChange={(e) => setSelectedCollege(e.target.value)}
                            sx={{
                                bgcolor: '#FFFFFF',
                                color: '#1E90FF',
                            }}
                        >
                            {colleges.map(college => (
                                <MenuItem key={college} value={college}>
                                    {college}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                        Total Students: {filteredStudents.length}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} justifyContent="center">
                {filteredStudents.map((student) => (
                    <Grid item xs={12} sm={6} md={4} key={student.userId}>
                        <Tooltip
                            title={
                                <>
                                    <Typography variant="body2"><strong>Phone:</strong> {student.phoneNumber || 'N/A'}</Typography>
                                    <Typography variant="body2"><strong>Internship:</strong> {student.internshipDetails || 'N/A'}</Typography>
                                    <Typography variant="body2"><strong>College:</strong> {student.college || 'N/A'}</Typography>
                                    <Typography variant="body2"><strong>LinkedIn:</strong> {student.linkedInProfileLink || 'N/A'}</Typography>
                                    <Typography variant="body2"><strong>Languages:</strong> {student.programmingLanguagesKnown || 'N/A'}</Typography>
                                </>
                            }
                            arrow
                        >
                            <Card
                                sx={{
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                                    backgroundColor: '#FFFFFF',
                                    padding: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Avatar sx={{ width: 60, height: 60, marginRight: '15px' }} />
                                <CardContent sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ color: '#1E90FF' }}>
                                        {student.username}
                                    </Typography>
                                    <Typography variant="body1" sx={{ margin: '10px 0' }}>
                                        <strong>Email:</strong> {student.email}
                                    </Typography>
                                    <Typography variant="body2" sx={{ marginBottom: '5px' }}>
                                        <strong>Degree:</strong> {student.degree || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ marginBottom: '5px' }}>
                                        <strong>Specialization:</strong> {student.specialization || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Certifications:</strong> {student.certifications || 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentTab;