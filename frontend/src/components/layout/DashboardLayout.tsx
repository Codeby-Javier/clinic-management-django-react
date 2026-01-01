import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
    allowedRoles?: string[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ allowedRoles }) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
        return <Navigate to={`/${user?.role}`} replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />
            <div className="ml-64 transition-all duration-300">
                <Navbar />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
