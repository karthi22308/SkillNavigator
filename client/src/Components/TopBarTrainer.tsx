import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Logout from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

interface UserDetails {
  userId: number;
  username: string;
  email: string;
  role: string;
  degree: string;
  specialization: string;
  phoneNumber: string;
  certifications: string;
  internshipDetails: string;
  college: string;
  linkedInProfileLink: string;
  programmingLanguagesKnown: string;
}

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Retrieve user details from localStorage
  const userDetails = JSON.parse(localStorage.getItem('UserDetails') || 'null') as UserDetails | null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('UserId'); // Clear user session
    localStorage.removeItem('UserDetails'); // Clear user details
    navigate('/login'); // Navigate to login page
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Skill Navigator Application Trainer
        </Typography>
        {userDetails && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
           
            <Typography variant="h6" sx={{ marginLeft: 2 }}>
              {userDetails.username}
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleMenuOpen} color="inherit">
          <Avatar src="/default-user.png" alt="User" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            style: {
              width: '300px',
              padding: '16px',
            },
          }}
        >
          {userDetails && (
            <MenuItem>
              <Box>
                <Typography variant="h6">{userDetails.username}</Typography>
                <Tabs value={selectedTab} onChange={handleTabChange} orientation="vertical">
                  {userDetails.email && (
                    <Tab label={`Email: ${userDetails.email}`} />
                  )}
                  {userDetails.role && (
                    <Tab label={`Role: ${userDetails.role}`} />
                  )}
                  {userDetails.degree && userDetails.specialization && (
                    <Tab label={`Degree: ${userDetails.degree} - ${userDetails.specialization}`} />
                  )}
                  {userDetails.phoneNumber && (
                    <Tab label={`Phone: ${userDetails.phoneNumber}`} />
                  )}
                  {userDetails.certifications && (
                    <Tab label={`Certifications: ${userDetails.certifications}`} />
                  )}
                  {userDetails.internshipDetails && (
                    <Tab label={`Internship: ${userDetails.internshipDetails}`} />
                  )}
                  {userDetails.college && (
                    <Tab label={`College: ${userDetails.college}`} />
                  )}
                  {userDetails.linkedInProfileLink && (
                    <Tab label={`LinkedIn: ${userDetails.linkedInProfileLink}`} />
                  )}
                  {userDetails.programmingLanguagesKnown && (
                    <Tab label={`Languages: ${userDetails.programmingLanguagesKnown}`} />
                  )}
                </Tabs>
              </Box>
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
