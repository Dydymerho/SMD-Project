import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LecturerDashboard from './LecturerDashboard';
import StudentDashboard from './StudentDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on role
  if (user?.role === 'LECTURER') {
    return <LecturerDashboard />;
  }

  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  // Default fallback
  return <LecturerDashboard />;
};

export default DashboardPage;
