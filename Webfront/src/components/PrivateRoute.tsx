import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactElement;
  allowedRoles?: Array<'ADMIN' | 'LECTURER' | 'STUDENT' | 'HEAD_OF_DEPARTMENT' | 'ACADEMIC_AFFAIRS' | 'PRINCIPAL'>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate page based on role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/system-management" replace />;
    } else if (user.role === 'HEAD_OF_DEPARTMENT') {
      return <Navigate to="/hod/dashboard" replace />;
    } else if (user.role === 'ACADEMIC_AFFAIRS') {
      return <Navigate to="/aa/dashboard" replace />;
    } else if (user.role === 'PRINCIPAL') {
      return <Navigate to="/principal/dashboard" replace />;
    } else if (user.role === 'LECTURER') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/search" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
