import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  requireSuperuser?: boolean;
  isSuperuser?: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  requireSuperuser = false,
  isSuperuser = false,
  children,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requireSuperuser && !isSuperuser) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
