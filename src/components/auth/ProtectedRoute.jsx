import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const dashboardPathForRole = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'client') return '/client';
  return '/freelancer';
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading your account…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={dashboardPathForRole(user?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
