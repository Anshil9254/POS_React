import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user = null;

    try {
        if (userStr) user = JSON.parse(userStr);
    } catch (e) {
        console.error("Failed to parse user from localStorage");
    }

    // If there is no token or user data, redirect to login page
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // If route requires specific roles, check if the user has that role
    if (allowedRoles && allowedRoles.length > 0) {
        if (!user.role || !allowedRoles.includes(user.role)) {
            // Role not authorized, redirect to dashboard
            return <Navigate to="/dashboard" replace />;
        }
    }

    // Otherwise, render the child routes (e.g. Layout)
    return <Outlet />;
};

export default PrivateRoute;
