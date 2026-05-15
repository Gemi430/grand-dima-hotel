import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissions = [],
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check permissions if specified
  if (permissions.length > 0 && user) {
    const hasPermission = permissions.some(permission => 
      user.permissions.includes(permission) || user.permissions.includes('*')
    );

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
