import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import LoginPage from './pages/LoginPage/LoginPage';
import ContactDataPage from './pages/ContactDataPage/ContactDataPage';



function App() {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/contact" element={<ContactDataPage />} />

        <Route path="/tasks" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
