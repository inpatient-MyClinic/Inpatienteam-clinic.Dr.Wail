import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import NurseDashboard from "./pages/NurseDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import CaseCoordinatorDashboard from "./pages/CaseCoordinatorDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import CustomerCareDashboard from "./pages/CustomerCareDashboard";
import CreateRequest from "./pages/CreateRequest";
import MyRequests from "./pages/MyRequests";
import SettingsDirectory from "./pages/SettingsDirectory";
import NotFound from "./pages/NotFound";
import NotificationsLogs from "./pages/NotificationsLogs";
import PrivilegeManagement from "./pages/PrivilegeManagement";
import RequestWireframe from "./pages/RequestWireframe";
import RoleSelection from "./pages/RoleSelection";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  if (profile.status !== 'active') {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Home page component that handles authentication routing
const HomePage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is authenticated and active, redirect to their dashboard
  if (user && profile && profile.status === 'active') {
    switch (profile.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'doctor':
        return <Navigate to="/doctor" replace />;
      case 'nurse':
        return <Navigate to="/nurse" replace />;
      case 'hospital':
        return <Navigate to="/hospital" replace />;
      case 'case-coordinator':
        return <Navigate to="/case-coordinator" replace />;
      case 'finance':
        return <Navigate to="/finance" replace />;
      case 'customer-care':
        return <Navigate to="/customer-care" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // Show login page for non-authenticated users
  return <Index />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/nurse" element={<ProtectedRoute allowedRoles={['nurse']}><NurseDashboard /></ProtectedRoute>} />
                <Route path="/hospital" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
                <Route path="/case-coordinator" element={<ProtectedRoute allowedRoles={['case-coordinator']}><CaseCoordinatorDashboard /></ProtectedRoute>} />
                <Route path="/finance" element={<ProtectedRoute allowedRoles={['finance']}><FinanceDashboard /></ProtectedRoute>} />
                <Route path="/customer-care" element={<ProtectedRoute allowedRoles={['customer-care']}><CustomerCareDashboard /></ProtectedRoute>} />
                <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
                <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><SettingsDirectory /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsLogs /></ProtectedRoute>} />
                <Route path="/privileges" element={<ProtectedRoute allowedRoles={['admin', 'nurse']}><PrivilegeManagement /></ProtectedRoute>} />
                <Route path="/wireframe" element={<ProtectedRoute><RequestWireframe /></ProtectedRoute>} />
                <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;