import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import React from 'react';
import { useGlobalStore } from '../../store/store';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'member')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { role, user } = useGlobalStore();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role?.toLowerCase() as 'admin' | 'member')) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

export default ProtectedRoute;
