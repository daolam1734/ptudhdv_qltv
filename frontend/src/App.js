import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import BorrowsPage from './pages/BorrowsPage';
import ReadersPage from './pages/ReadersPage';
import StaffPage from './pages/StaffPage';
import ReportsPage from './pages/ReportsPage';
import ReaderHistoryPage from './pages/ReaderHistoryPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute roles={['admin', 'librarian', 'staff', 'reader']}>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/books" element={
            <ProtectedRoute roles={['admin', 'librarian', 'staff', 'reader']}>
              <BooksPage />
            </ProtectedRoute>
          } />

          <Route path="/borrows" element={
            <ProtectedRoute roles={['admin', 'librarian', 'staff']}>
              <BorrowsPage />
            </ProtectedRoute>
          } />

          <Route path="/my-history" element={
            <ProtectedRoute roles={['reader']}>
              <ReaderHistoryPage />
            </ProtectedRoute>
          } />

          <Route path="/readers" element={
            <ProtectedRoute roles={['admin', 'librarian', 'staff']}>
              <ReadersPage />
            </ProtectedRoute>
          } />

          <Route path="/staff" element={
            <ProtectedRoute roles={['admin']}>
              <StaffPage />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute roles={['admin', 'librarian']}>
              <ReportsPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
