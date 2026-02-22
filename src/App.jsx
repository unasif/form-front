import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

import LoginPage from './pages/LoginPage/LoginPage';
import ContactDataPage from './pages/ContactDataPage/ContactDataPage';
import RequestDetailsPage from './pages/RequestDetailsPage/RequesDetailsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserProfile from './pages/UserProfile/UserProfile';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/profile" replace />;
  }
  return children;
};

function App() {
  return (
    <Router basename="/tasks">
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/contact" element={<ContactDataPage />} />
        <Route path="/details" element={<RequestDetailsPage />} />
        <Route path="/tasks" element={<LoginPage />} />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute requireAdmin={true}>
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;