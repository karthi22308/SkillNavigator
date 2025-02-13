import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, IconButton, Tooltip, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TopBarTrainer from '../../Components/TopBarTrainer';
import MyBatchestab from '../../Features/Pages/trainer/Mybatches';
import FeedbackTab from '../../Features/Pages/trainer/Feedback';
import Leadertab from '../../Features/Pages/leaderboard';
import CreateTest from '../../Features/Pages/trainer/createtest';
 import MyTests from '../../Features/Pages/trainer/mytests';

const TrainerPage: React.FC = () => {
    useEffect(() => {
        document.body.classList.add('body-admin');
        return () => {
            document.body.classList.remove('body-admin');
        };
    }, []);

    const [value, setValue] = useState(0);
    const [navExpanded, setNavExpanded] = useState(false);

    const navItems = [
        { label: "My Batches", icon: <PeopleIcon />, component: <MyBatchestab /> },
        { label: "Create Test", icon: <AssessmentIcon />, component: <CreateTest /> },
         { label: "My Tests", icon: <AssessmentIcon />, component: <MyTests /> },
        { label: "Leader Board", icon: <SportsKabaddiIcon />, component: <Leadertab /> },
        { label: "Feedback", icon: <AssessmentIcon />, component: <FeedbackTab /> }
    ];

    return (
        <div>
            <TopBarTrainer />
            <Box sx={{ display: 'flex' }}>
                {/* Sidebar */}
                <Paper
                    elevation={3}
                    sx={{
                        minWidth: navExpanded ? '200px' : '80px', // Reduced minWidth when minimized
                        width: navExpanded ? '200px' : '80px', // Reduced width when minimized
                        transition: 'width 0.3s',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        height: '100vh', // Full height
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        position: 'fixed', // Fixed position to ensure it stays visible
                        zIndex: 1, // Ensure it's above the main content
                    }}
                >
                    {/* Menu Button */}
                    <IconButton
                        onClick={() => setNavExpanded(!navExpanded)}
                        sx={{
                            alignSelf: 'flex-end',
                            display: 'flex',
                            alignItems: 'center',
                            mt: 1, // Add margin for spacing
                            mr: 1, // Add margin for spacing
                        }}
                    >
                        <MenuIcon />
                        {!navExpanded && <Typography variant="caption" sx={{ ml: 1 }}>Menu</Typography>}
                    </IconButton>

                    {/* Navigation Items */}
                    {navItems.map((item, index) => (
                        <Tooltip title={navExpanded ? '' : item.label} key={item.label}>
                            <Button
                                variant={value === index ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => setValue(index)}
                                sx={{
                                    justifyContent: 'center',
                                    width: '90%', // Slightly reduced width for better spacing
                                    flexDirection: 'column',
                                    my: 1, // Add vertical margin for spacing
                                    p: 1, // Add padding for better click area
                                }}
                                startIcon={item.icon}
                            >
                                {!navExpanded && <Typography variant="caption">{item.label}</Typography>}
                                {navExpanded && item.label}
                            </Button>
                        </Tooltip>
                    ))}
                </Paper>

                {/* Main Content */}
                <Box
                    sx={{
                        flexGrow: 1,
                        ml: navExpanded ? '200px' : '80px', // Adjust margin to match sidebar width
                        transition: 'margin 0.3s',
                        p: 3, // Add padding to the main content
                    }}
                >
                    {navItems[value].component}
                </Box>
            </Box>
        </div>
    );
};

export default TrainerPage;