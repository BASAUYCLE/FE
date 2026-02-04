import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * RoleBasedRoute Component
 * Advanced route protection with role-based access control
 * 
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {string|string[]} allowedRoles - Role(s) allowed to access this route
 * @param {string} redirectTo - Path to redirect if unauthorized (default: '/unauthorized')
 */
const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/unauthorized' 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login, save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize allowedRoles to array
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Check if user has required role
  if (rolesArray.length > 0 && user?.role) {
    const hasRequiredRole = rolesArray.some(
      role => user.role.toLowerCase() === role.toLowerCase()
    );

    if (!hasRequiredRole) {
      // User doesn't have required role, redirect
      return <Navigate to={redirectTo} replace />;
    }
  }

  // User is authenticated and has required role
  return children;
};

/**
 * AdminRoute - Shortcut for admin-only routes
 */
export const AdminRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
    {children}
  </RoleBasedRoute>
);

/**
 * StaffRoute - Shortcut for staff routes (including admins)
 */
export const StaffRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['STAFF', 'ADMIN', 'SUPER_ADMIN']}>
    {children}
  </RoleBasedRoute>
);

/**
 * CustomerRoute - Shortcut for customer routes
 */
export const CustomerRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['CUSTOMER', 'USER']}>
    {children}
  </RoleBasedRoute>
);

export default RoleBasedRoute;
