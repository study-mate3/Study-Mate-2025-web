// src/routes/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, roleRequired }) => {
  const { currentUser, role } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (role !== roleRequired) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
