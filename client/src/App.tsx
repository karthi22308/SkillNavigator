import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Features/auth/Login';
import Register from './Features/auth/Register';
//import Dashboard from './Features/dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root to Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Define routes */}
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        {/* <Route path="/Dashboard" element={<Dashboard />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
