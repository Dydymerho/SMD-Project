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
import EditSyllabusPage from './pages/EditSyllabusPage';
import CompareVersionsPage from './pages/CompareVersionsPage';
import SyllabusReviewPage from './pages/SyllabusReviewPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import HoDDashboard from './pages/dashboard/HoDDashboard';
import HoDSyllabusReviewPage from './pages/hod/SyllabusReviewPage';
import SyllabusReviewDetailPage from './pages/hod/SyllabusReviewDetailPage';
import CollaborativeReviewPage from './pages/hod/CollaborativeReviewPage';
import CollaborativeReviewDetailPage from './pages/hod/CollaborativeReviewDetailPage';
import SyllabusAnalysisPage from './pages/hod/SyllabusAnalysisPage';
import AADashboard from './pages/dashboard/AADashboard';
import AASyllabusApprovalPage from './pages/aa/SyllabusApprovalPage';
import AASyllabusApprovalDetailPage from './pages/aa/SyllabusApprovalDetailPage';
import ProgramManagementPage from './pages/aa/ProgramManagementPage';
import AASyllabusAnalysisPage from './pages/aa/SyllabusAnalysisPage';
import PrincipalDashboard from './pages/dashboard/PrincipalDashboard';
import FinalApprovalPage from './pages/principal/FinalApprovalPage';
import FinalApprovalDetailPage from './pages/principal/FinalApprovalDetailPage';
import SystemOversightPage from './pages/principal/SystemOversightPage';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
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

            {/* Dashboard - Routes to appropriate dashboard based on role */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            {/* Lecturer Dashboard */}
            <Route
              path="/lecturer/dashboard"
              element={
                <PrivateRoute allowedRoles={['LECTURER']}>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            {/* Lecturer Routes */}
            <Route
              path="/syllabus/create"
              element={
                <PrivateRoute allowedRoles={['LECTURER']}>
                  <CreateSyllabusPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/syllabus/edit/:id"
              element={
                <PrivateRoute allowedRoles={['LECTURER']}>
                  <EditSyllabusPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/syllabus/compare/:id"
              element={
                <PrivateRoute allowedRoles={['LECTURER']}>
                  <CompareVersionsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/syllabus/review/:id"
              element={
                <PrivateRoute allowedRoles={['LECTURER']}>
                  <SyllabusReviewPage />
                </PrivateRoute>
              }
            />

            {/* HoD Routes */}
            <Route
              path="/hod/dashboard"
              element={
                <PrivateRoute allowedRoles={['HEAD_OF_DEPARTMENT', 'ADMIN']}>
                  <HoDDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hod/syllabus-review"
              element={
                <PrivateRoute allowedRoles={['HEAD_OF_DEPARTMENT', 'ADMIN']}>
                  <HoDSyllabusReviewPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/hod/syllabus-review/:id"
              element={
                <PrivateRoute allowedRoles={['HEAD_OF_DEPARTMENT', 'ADMIN']}>
                  <SyllabusReviewDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/hod/collaborative-review"
              element={
                <PrivateRoute allowedRoles={['HEAD_OF_DEPARTMENT', 'ADMIN']}>
                  <CollaborativeReviewPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/hod/collaborative-review/:id"
              element={
                <PrivateRoute allowedRoles={['HEAD_OF_DEPARTMENT', 'ADMIN']}>
                  <CollaborativeReviewDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/hod/syllabus-analysis"
              element={
                <PrivateRoute allowedRoles={['HEAD_OF_DEPARTMENT', 'ADMIN']}>
                  <SyllabusAnalysisPage />
                </PrivateRoute>
              }
            />
            
            {/* Academic Affairs Routes */}
            <Route
              path="/aa/dashboard"
              element={
                <PrivateRoute allowedRoles={['ACADEMIC_AFFAIRS', 'ADMIN']}>
                  <AADashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/aa/syllabus-approval"
              element={
                <PrivateRoute allowedRoles={['ACADEMIC_AFFAIRS', 'ADMIN']}>
                  <AASyllabusApprovalPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/aa/syllabus-approval/:id"
              element={
                <PrivateRoute allowedRoles={['ACADEMIC_AFFAIRS', 'ADMIN']}>
                  <AASyllabusApprovalDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/aa/program-management"
              element={
                <PrivateRoute allowedRoles={['ACADEMIC_AFFAIRS', 'ADMIN']}>
                  <ProgramManagementPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/aa/syllabus-analysis"
              element={
                <PrivateRoute allowedRoles={['ACADEMIC_AFFAIRS', 'ADMIN']}>
                  <AASyllabusAnalysisPage />
                </PrivateRoute>
              }
            />
            
            {/* Principal Routes */}
            <Route
              path="/principal/dashboard"
              element={
                <PrivateRoute allowedRoles={['PRINCIPAL', 'ADMIN']}>
                  <PrincipalDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/principal/final-approval"
              element={
                <PrivateRoute allowedRoles={['PRINCIPAL', 'ADMIN']}>
                  <FinalApprovalPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/principal/final-approval/:id"
              element={
                <PrivateRoute allowedRoles={['PRINCIPAL', 'ADMIN']}>
                  <FinalApprovalDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/principal/system-oversight"
              element={
                <PrivateRoute allowedRoles={['PRINCIPAL', 'ADMIN']}>
                  <SystemOversightPage />
                </PrivateRoute>
              }
            />
            
            {/* Student Dashboard */}
            <Route
              path="/student/dashboard"
              element={
                <PrivateRoute>
                  <StudentDashboard />
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
              path="/subject/:syllabusId"
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
