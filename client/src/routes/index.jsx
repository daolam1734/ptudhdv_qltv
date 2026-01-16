import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import StaffLayout from "../layouts/StaffLayout";
import ReaderLayout from "../layouts/ReaderLayout";
import AuthLayout from "../layouts/AuthLayout";
import PublicLayout from "../layouts/PublicLayout";

// Pages
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/HomePage";
import ReaderBooksPage from "../pages/reader/ReaderBooksPage";
import BookDetailPage from "../pages/reader/BookDetailPage";
import ReaderHistoryPage from "../pages/reader/ReaderHistoryPage";
import FavoritesPage from "../pages/reader/FavoritesPage";
import BasketPage from "../pages/reader/BasketPage";
import DashboardPage from "../pages/admin/DashboardPage";
import ReadersPage from "../pages/admin/ReadersPage";
import StaffPage from "../pages/admin/StaffPage";
import ReportsPage from "../pages/admin/ReportsPage";
import StaffReportsPage from "../pages/staff/StaffReportsPage";
import BooksPage from "../pages/staff/BooksPage";
import BorrowsPage from "../pages/staff/BorrowsPage";
import ViolationsPage from "../pages/staff/ViolationsPage";
import CategoriesPage from "../pages/staff/CategoriesPage";
import StaffDashboardPage from "../pages/staff/StaffDashboardPage";
import ProfilePage from "../pages/common/ProfilePage";

import { useAuth } from "../context/AuthContext";

const AppRoutes = () => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public/Reader Shared Routes */}
            <Route path="/" element={<ReaderLayout><HomePage /></ReaderLayout>} />
            <Route 
                path="/books" 
                element={
                    isAuthenticated && (user?.role === "admin" || user?.role === "librarian") ? (
                        user?.role === "admin" ? <AdminLayout><BooksPage /></AdminLayout> : <StaffLayout><BooksPage /></StaffLayout>
                    ) : (
                         <ReaderLayout><ReaderBooksPage /></ReaderLayout>
                    )
                } 
            />

            <Route 
                path="/books/:id" 
                element={<ReaderLayout><BookDetailPage /></ReaderLayout>} 
            />

            <Route 
                path="/reader/books" 
                element={<Navigate to="/books" replace />} 
            />
            
            <Route 
                path="/login" 
                element={
                    isAuthenticated ? <Navigate to="/dashboard" /> : <AuthLayout><LoginPage /></AuthLayout>
                } 
            />

            <Route 
                path="/register" 
                element={
                    isAuthenticated ? <Navigate to="/dashboard" /> : <AuthLayout><RegisterPage /></AuthLayout>
                } 
            />

            {/* Authenticated Dashboard Redirects */}
            <Route 
                path="/dashboard" 
                element={
                    <PrivateRoute>
                        {user?.role === "admin" ? (
                            <Navigate to="/dashboard/admin" replace />
                        ) : user?.role === "reader" ? (
                            <Navigate to="/" replace />
                        ) : (
                            <Navigate to="/dashboard/staff" replace />
                        )}
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/profile" 
                element={
                    <PrivateRoute>
                        {user?.role === "admin" ? (
                            <AdminLayout><ProfilePage /></AdminLayout>
                        ) : user?.role === "reader" ? (
                            <ReaderLayout><ProfilePage /></ReaderLayout>
                        ) : (
                            <StaffLayout><ProfilePage /></StaffLayout>
                        )}
                    </PrivateRoute>
                } 
            />

            {/* Role Specific Dashboards */}
            <Route 
                path="/dashboard/admin" 
                element={
                    <PrivateRoute roles={["admin"]}>
                        <AdminLayout><DashboardPage /></AdminLayout>
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/dashboard/staff" 
                element={
                    <PrivateRoute roles={["librarian"]}>
                        <StaffLayout><StaffDashboardPage /></StaffLayout>
                    </PrivateRoute>
                } 
            />

            {/* Reader Routes Mapping */}
            <Route 
                path="/reader/dashboard" 
                element={<Navigate to="/" replace />} 
            />

            <Route 
                path="/reader/history" 
                element={
                    <PrivateRoute roles={["reader"]}>
                        <ReaderLayout><ReaderHistoryPage /></ReaderLayout>
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/reader/favorites" 
                element={
                    <PrivateRoute roles={["reader"]}>
                        <ReaderLayout><FavoritesPage /></ReaderLayout>
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/reader/basket" 
                element={
                    <PrivateRoute roles={["reader"]}>
                        <ReaderLayout><BasketPage /></ReaderLayout>
                    </PrivateRoute>
                } 
            />

            {/* Admin Only */}
            <Route 
                path="/staff" 
                element={
                    <PrivateRoute roles={["admin"]}>
                        <AdminLayout><StaffPage /></AdminLayout>
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/readers" 
                element={
                    <PrivateRoute roles={["admin", "librarian"]}>
                        {user?.role === "admin" ? <AdminLayout><ReadersPage /></AdminLayout> : <StaffLayout><ReadersPage /></StaffLayout>}
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/reports" 
                element={
                    <PrivateRoute roles={["admin", "librarian"]}>
                        {user?.role === "admin" ? <AdminLayout><ReportsPage /></AdminLayout> : <StaffLayout><ReportsPage /></StaffLayout>}
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/staff/reports" 
                element={
                    <PrivateRoute roles={["librarian"]}>
                        <StaffLayout><StaffReportsPage /></StaffLayout>
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/borrows" 
                element={
                    <PrivateRoute roles={["admin", "librarian"]}>
                         {user?.role === "admin" ? <AdminLayout><BorrowsPage /></AdminLayout> : <StaffLayout><BorrowsPage /></StaffLayout>}
                    </PrivateRoute>
                } 
            />
            
            <Route 
                path="/violations" 
                element={
                    <PrivateRoute roles={["admin", "librarian"]}>
                         {user?.role === "admin" ? <AdminLayout><ViolationsPage /></AdminLayout> : <StaffLayout><ViolationsPage /></StaffLayout>}
                    </PrivateRoute>
                } 
            />

            <Route 
                path="/categories" 
                element={
                    <PrivateRoute roles={["admin", "librarian"]}>
                         {user?.role === "admin" ? <AdminLayout><CategoriesPage /></AdminLayout> : <StaffLayout><CategoriesPage /></StaffLayout>}
                    </PrivateRoute>
                } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;

