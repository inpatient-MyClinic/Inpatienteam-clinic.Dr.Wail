import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/hooks/useAuth";
import Auth from "@/pages/Auth";
import AdminDashboard from "@/pages/AdminDashboard";
import NurseDashboard from "@/pages/NurseDashboard";
import DoctorDashboard from "@/pages/DoctorDashboard";
import HospitalDashboard from "@/pages/HospitalDashboard";
import CaseCoordinatorDashboard from "@/pages/CaseCoordinatorDashboard";
import FinanceDashboard from "@/pages/FinanceDashboard";
import CustomerCareDashboard from "@/pages/CustomerCareDashboard";
import CreateRequest from "@/pages/CreateRequest";
import SettingsDirectory from "@/pages/SettingsDirectory";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[];
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  if (profile.status !== 'active') {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    // Redirect to user's appropriate dashboard
    switch (profile.role) {
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

const App = () => {
  const { user, profile, loading } = useAuth();

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Auth Route */}
              <Route 
                path="/" 
                element={
                  user && profile?.status === 'active' ? (
                    // Redirect authenticated users to their dashboard
                    profile.role === 'admin' ? <Navigate to="/admin" replace /> :
                    profile.role === 'doctor' ? <Navigate to="/doctor-dashboard" replace /> :
                    profile.role === 'nurse' ? <Navigate to="/nurse-dashboard" replace /> :
                    profile.role === 'hospital' ? <Navigate to="/hospital-dashboard" replace /> :
                    profile.role === 'case-coordinator' ? <Navigate to="/case-coordinator-dashboard" replace /> :
                    profile.role === 'finance' ? <Navigate to="/finance-dashboard" replace /> :
                    profile.role === 'customer-care' ? <Navigate to="/customer-care-dashboard" replace /> :
                    <Navigate to="/admin" replace />
                  ) : (
                    <Auth />
                  )
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Settings Route */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SettingsDirectory />
                  </ProtectedRoute>
                } 
              />
              
              {/* Nurse Routes */}
              <Route 
                path="/nurse-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['nurse', 'admin']}>
                    <NurseDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Doctor Routes */}
              <Route 
                path="/doctor-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Hospital Routes */}
              <Route 
                path="/hospital-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['hospital', 'admin']}>
                    <HospitalDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Case Coordinator Routes */}
              <Route 
                path="/case-coordinator-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['case-coordinator', 'admin']}>
                    <CaseCoordinatorDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Finance Routes */}
              <Route 
                path="/finance-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['finance', 'admin']}>
                    <FinanceDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Customer Care Routes */}
              <Route 
                path="/customer-care-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['customer-care', 'admin']}>
                    <CustomerCareDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Common Routes */}
              <Route 
                path="/create-request" 
                element={
                  <ProtectedRoute allowedRoles={['nurse', 'doctor', 'admin']}>
                    <CreateRequest />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;