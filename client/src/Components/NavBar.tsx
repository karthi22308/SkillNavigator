import React from 'react';
import { Box, Button } from '@mui/material';

const NavBar: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, margin: 2 }}>
    <Button variant="contained" color="primary" href="/login">
      Login
    </Button>
    <Button variant="outlined" color="primary" href="/register">
      Register
    </Button>
  </Box>
);

export default NavBar;
