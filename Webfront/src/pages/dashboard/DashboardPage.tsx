import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LecturerDashboard from './LecturerDashboard';
import StudentDashboard from './StudentDashboard';
import HoDDashboard from './HoDDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  console.log('DashboardPage - Current user:', user);
  console.log('DashboardPage - User role:', user?.role);

  // Route to appropriate dashboard based on role
  // Check HEAD_OF_DEPARTMENT first before LECTURER
  if (user?.role === 'HEAD_OF_DEPARTMENT') {
    console.log('Routing to HoD Dashboard');
    return <HoDDashboard />;
  }

  if (user?.role === 'ADMIN') {
    console.log('Routing to Admin Dashboard (HoD)');
    return <HoDDashboard />;
  }

  if (user?.role === 'LECTURER') {
    console.log('Routing to Lecturer Dashboard');
    return <LecturerDashboard />;
  }

  if (user?.role === 'STUDENT') {
    console.log('Routing to Student Dashboard');
    return <StudentDashboard />;
  }

  // Default fallback
  console.log('Routing to default Lecturer Dashboard');
  return <LecturerDashboard />;
};

export default DashboardPage;
