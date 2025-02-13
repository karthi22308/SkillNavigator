import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Card, CardContent, CircularProgress, Tabs, Tab, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

interface ReportData {
    [key: string]: any;
}

interface DummyData {
    "individual-candidate": Array<{ name: string; score: number; status: string }>;
    "trainers-feedback": Array<{ trainer: string; feedback: string }>;
    "batch-score": Array<{ batch: string; averageScore: number }>;
    "college-score": Array<{ college: string; highestScore: number }>;
    "topper-list": Array<{ name: string; score: number }>;
    "batch-comparison": Array<{ batch: string; averageScore: number }>;
}

const ReportsTab: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [reportData, setReportData] = useState<ReportData[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('java'); // Filter for Batch Comparison

    const reportTypes = [
        { label: "Candidate Report", type: "individual-candidate" },
        { label: "Trainers' Feedback", type: "trainers-feedback" },
        { label: "Batch Score", type: "batch-score" },
        { label: "College Score", type: "college-score" },
        { label: "Topper List", type: "topper-list" },
        { label: "Batch Comparison", type: "batch-comparison" }
    ];

    const dummyData: DummyData = {
        "individual-candidate": [
            { name: "Aarav Sharma", score: 85, status: "Passed" },
            { name: "Riya Patel", score: 78, status: "Passed" },
            { name: "Vikram Singh", score: 62, status: "Failed" },
            { name: "Ananya Iyer", score: 91, status: "Passed" },
            { name: "Kunal Mehta", score: 55, status: "Failed" },
            { name: "Pooja Verma", score: 88, status: "Passed" },
            { name: "Rohan Das", score: 73, status: "Passed" },
            { name: "Neha Kapoor", score: 95, status: "Passed" },
            { name: "Amit Saxena", score: 67, status: "Failed" },
            { name: "Priya Nair", score: 80, status: "Passed" }
        ],
        "trainers-feedback": [
            { trainer: "Suresh Kumar", feedback: "Excellent" },
            { trainer: "Meena Reddy", feedback: "Very Good" },
            { trainer: "Rajiv Das", feedback: "Good" },
            { trainer: "Alok Mishra", feedback: "Average" },
            { trainer: "Ramesh Gupta", feedback: "Needs Improvement" },
            { trainer: "Sunita Menon", feedback: "Great improvement!" },
            { trainer: "Akhil Sharma", feedback: "Very Good" },
            { trainer: "Kavita Joshi", feedback: "Excellent" },
            { trainer: "Harsh Jain", feedback: "Satisfactory" },
            { trainer: "Deepika Rao", feedback: "Good Effort" }
        ],
        "batch-score": Array.from({ length: 10 }, (_, i) => ({ batch: `Batch ${i + 1}`, averageScore: Math.floor(Math.random() * 100) })),
        "college-score": [
            { college: "IIT Delhi", highestScore: 98 },
            { college: "BITS Pilani", highestScore: 95 },
            { college: "NIT Trichy", highestScore: 90 },
            { college: "Delhi University", highestScore: 85 },
            { college: "Anna University", highestScore: 88 },
            { college: "Jadavpur University", highestScore: 92 },
            { college: "VIT Vellore", highestScore: 89 },
            { college: "SRM University", highestScore: 87 },
            { college: "Amity University", highestScore: 80 },
            { college: "Manipal University", highestScore: 86 }
        ],
        "topper-list": [
            { name: "Rahul Khanna", score: 98 },
            { name: "Sneha Ghosh", score: 95 },
            { name: "Manoj Pillai", score: 92 },
            { name: "Swati Singh", score: 91 },
            { name: "Ajay Bhatia", score: 90 },
            { name: "Preeti Yadav", score: 89 },
            { name: "Sandeep Reddy", score: 88 },
            { name: "Jyoti Saxena", score: 87 },
            { name: "Vishal Nair", score: 86 },
            { name: "Tanisha Kapoor", score: 85 }
        ],
        "batch-comparison": Array.from({ length: 5 }, (_, i) => ({ batch: `Batch ${i + 1}`, averageScore: Math.floor(Math.random() * 100) }))
    };

    const fetchReportData = (type: keyof DummyData) => {
        setLoading(true);
        setError(null);
        setTimeout(() => {
            setReportData(dummyData[type]);
            setLoading(false);
        }, 500);
    };

    // Fetch data when the component mounts or the selected tab changes
    useEffect(() => {
        fetchReportData(reportTypes[selectedTab].type as keyof DummyData);
    }, [selectedTab]); // Add selectedTab as a dependency

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const handleFilterChange = (event: any) => {
        setFilter(event.target.value);
        // Simulate data reload based on filter
        fetchReportData(reportTypes[selectedTab].type as keyof DummyData);
    };

    const exportToExcel = () => {
        if (reportData) {
            const worksheet = XLSX.utils.json_to_sheet(reportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
            XLSX.writeFile(workbook, `${reportTypes[selectedTab].label}.xlsx`);
        }
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Reports Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box p={3}>
                <Tabs value={selectedTab} onChange={handleTabChange} centered>
                    {reportTypes.map((report, index) => (
                        <Tab key={index} label={report.label} />
                    ))}
                </Tabs>
                <Box mt={3}>
                    {loading ? <CircularProgress /> : error ? <Typography color="error">{error}</Typography> : (
                        selectedTab === 5 ? (
                            <>
                                <FormControl fullWidth>
                                    <InputLabel>Filter</InputLabel>
                                    <Select value={filter} onChange={handleFilterChange} label="Filter">
                                        <MenuItem value="dotnet">.NET</MenuItem>
                                        <MenuItem value="cloud">Cloud</MenuItem>
                                        <MenuItem value="java">Java</MenuItem>
                                    </Select>
                                </FormControl>
                                <Box mt={2}>
                                    <Bar
                                        data={{
                                            labels: dummyData["batch-comparison"].map((b: any) => b.batch),
                                            datasets: [{
                                                label: "Average Score",
                                                data: dummyData["batch-comparison"].map((b: any) => b.averageScore),
                                                backgroundColor: [
                                                    'rgba(255, 99, 132, 0.6)',
                                                    'rgba(54, 162, 235, 0.6)',
                                                    'rgba(255, 206, 86, 0.6)',
                                                    'rgba(75, 192, 192, 0.6)',
                                                    'rgba(153, 102, 255, 0.6)'
                                                ]
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true
                                                }
                                            }
                                        }}
                                        height={300} // Adjust height to fit the screen
                                    />
                                </Box>
                            </>
                        ) : (
                            reportData && (
                                <>
                                    <Grid container spacing={2}>
                                        {reportData.map((item: any, index: number) => (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <Card>
                                                    <CardContent>
                                                        {Object.entries(item).map(([key, value]) => (
                                                            <Typography key={key}><strong>{key}:</strong> {value as React.ReactNode}</Typography>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Box display="flex" justifyContent="center" mt={3}>
                                        <Button variant="contained" color="primary" onClick={exportToExcel}>
                                            Export to Excel
                                        </Button>
                                    </Box>
                                </>
                            )
                        )
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ReportsTab;