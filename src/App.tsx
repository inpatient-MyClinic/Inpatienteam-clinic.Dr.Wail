import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { getCurrentUserRole, getCurrentUserEmail } from "@/utils/auth";
import { AuthProvider } from "@/hooks/useAuth";
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
import ChangePassword from "./pages/ChangePassword";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const currentUserRole = getCurrentUserRole();
  const currentUserEmail = getCurrentUserEmail();
  
  if (!currentUserRole || !currentUserEmail) {
    return <Navigate to="/" replace />;
  }

  // Check if user role is allowed for this route
  if (allowedRoles && !allowedRoles.includes(currentUserRole) && currentUserRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomePage = () => {
  const currentUserRole = getCurrentUserRole();
  const currentUserEmail = getCurrentUserEmail();

  // If user is authenticated, redirect to their dashboard
  if (currentUserRole && currentUserEmail) {
    console.log('HomePage: Redirecting authenticated user to dashboard for role:', currentUserRole);
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
        console.log('HomePage: Unknown role, redirecting to default dashboard');
        return <Navigate to="/dashboard" replace />;
    }
  }

  // Show login page for non-authenticated users
  console.log('HomePage: No user session, showing login page');
  return <Index />;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                  <Route path="/nurse-dashboard" element={<ProtectedRoute allowedRoles={['nurse']}><NurseDashboard /></ProtectedRoute>} />
                  <Route path="/hospital-dashboard" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
                  <Route path="/case-coordinator-dashboard" element={<ProtectedRoute allowedRoles={['case-coordinator']}><CaseCoordinatorDashboard /></ProtectedRoute>} />
                  <Route path="/finance-dashboard" element={<ProtectedRoute allowedRoles={['finance']}><FinanceDashboard /></ProtectedRoute>} />
                  <Route path="/customer-care-dashboard" element={<ProtectedRoute allowedRoles={['customer-care']}><CustomerCareDashboard /></ProtectedRoute>} />
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
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;