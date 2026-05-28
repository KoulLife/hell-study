import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import CoursePage from '@/pages/CoursePage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import PendingUsersPage from '@/pages/PendingUsersPage';
import EnrollmentManagePage from '@/pages/EnrollmentManagePage';

const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return null;
  if (currentUser?.role !== 'SUPER_ADMIN') return <Navigate to="/course" replace />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return null;
  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'SUPER_ADMIN') return <Navigate to="/course" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route path="/course" element={<CoursePage />} />
      <Route path="/course/:id" element={<CourseDetailPage />} />

      <Route
        path="/admin/users/pending"
        element={
          <SuperAdminRoute>
            <PendingUsersPage />
          </SuperAdminRoute>
        }
      />

      <Route
        path="/admin/courses/:courseId/enrollments"
        element={
          <AdminRoute>
            <EnrollmentManagePage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
