import React from 'react';
import { Box, Typography } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ padding: 4, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        Welcome to the Skill Navigator Dashboard!
      </Typography>
      <Typography>
        This is where you can explore, learn, and navigate your skills. More features are coming soon!
      </Typography>
    </Box>
  );
};

export default Dashboard;
