import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { getPermissionsFromToken } from '../utils/jwt';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, requiredRole, requiredPermission }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to login page, saving the original location for post-login redirection
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // MasterAdmin bypasses all role and permission restrictions
  if (user.role === 'MasterAdmin') {
    return <>{children}</>;
  }

  // Check role restriction
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission restriction
  if (requiredPermission) {
    const token = localStorage.getItem('token');
    const userPermissions = getPermissionsFromToken(token);
    
    // Check if user has the specific permission (e.g. "Products:View")
    const hasPermission = userPermissions.some(
      (perm) => perm.toLowerCase() === requiredPermission.toLowerCase()
    );

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default RouteGuard;
