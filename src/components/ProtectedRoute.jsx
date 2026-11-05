import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    // If Admin tries to access User route, redirect to Admin Dashboard
    if (currentUser.role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // If User tries to access Admin route, redirect to User Dashboard
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
}
