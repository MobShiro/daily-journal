import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import your components with the correct path
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyOTP from './components/auth/VerifyOTP';
import ResetPassword from './components/auth/ResetPassword';
import NotFound from './components/NotFound';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Email verification required route
const EmailVerifiedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Check if user is logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if email is verified (from your Firestore user document)
  // You'll need to fetch this information or store it in context
  const isEmailVerified = false; // Replace with actual check
  
  if (!isEmailVerified) {
    return <Navigate to="/verify-otp" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route 
            path="/verify-otp" 
            element={
              <ProtectedRoute>
                <VerifyOTP />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <EmailVerifiedRoute>
                <Dashboard />
              </EmailVerifiedRoute>
            } 
          />
          
          {/* Home route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;