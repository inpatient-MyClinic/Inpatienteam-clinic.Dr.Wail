
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin, getCurrentUserEmail } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  currentUserRole: string | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  currentUserRole 
}) => {
  const currentUserEmail = getCurrentUserEmail();
  
  if (!currentUserRole) {
    return <Navigate to="/" replace />;
  }

  // CRITICAL FIX: Force admin redirection for admin emails
  if (currentUserEmail && isAdmin(currentUserEmail) && currentUserRole !== 'admin') {
    console.log("ProtectedRoute: Admin email detected but wrong role, redirecting to admin");
    return <Navigate to="/admin" replace />;
  }

  if (!allowedRoles.includes(currentUserRole)) {
    // Redirect to user's appropriate dashboard based on their role
    switch (currentUserRole) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'doctor':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'nurse':
        return <Navigate to="/nurse-dashboard" replace />;
      case 'hospital':
        return <Navigate to="/hospital-dashboard" replace />;
      case 'case-coordinator':
        return <Navigate to="/case-coordinator-dashboard" replace />;
      case 'finance':
        return <Navigate to="/finance-dashboard" replace />;
      case 'customer-care':
        return <Navigate to="/customer-care-dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
