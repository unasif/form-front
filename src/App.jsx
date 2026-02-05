import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import LoginPage from './pages/LoginPage/LoginPage';
import ContactDataPage from './pages/ContactDataPage/ContactDataPage';
import RequestDetailsPage from './pages/RequestDetailsPage/RequesDetailsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserProfile from './pages/UserProfile/UserProfile';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/contact" element={<ContactDataPage />} />

        <Route path="/tasks" element={<LoginPage />} />
        <Route path="/details" element={<RequestDetailsPage />} />
        <Route 
        path="/admin" 
        element={
          <PrivateRoute>
             <AdminDashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        } 
      />
      </Routes>
    </Router>
  );
}

export default App;
