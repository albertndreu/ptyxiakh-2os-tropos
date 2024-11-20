import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, allowedUsers }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userRole = localStorage.getItem("userRole");
  const username = localStorage.getItem("username");

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  if (allowedUsers && !allowedUsers.includes(username)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute; 