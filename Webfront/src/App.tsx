import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import ProfilePage from './pages/ProfilePage';
import SystemManagementPage from './pages/admin/SystemManagementPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateSyllabusPage from './pages/CreateSyllabusPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/system-management"
              element={
                <PrivateRoute allowedRoles={['ADMIN']}>
                  <SystemManagementPage />
                </PrivateRoute>
              }
            />

            {/* Teacher/Student Dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={['TEACHER', 'STUDENT']}>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/syllabus/create"
              element={
                <PrivateRoute allowedRoles={['TEACHER']}>
                  <CreateSyllabusPage />
                </PrivateRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <SearchPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/subject/:id"
              element={
                <PrivateRoute>
                  <SubjectDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
