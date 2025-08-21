import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UnifiedDashboard from "./components/unified/UnifiedDashboard";
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
import ResetRequest from "./pages/ResetRequest";
import ResetPassword from "./pages/ResetPassword";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomePage = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If user is authenticated, redirect to admin
  if (session) {
    return <Navigate to="/admin" replace />;
  }

  // Show login page for non-authenticated users
  return <Login />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/reset-request" element={<ResetRequest />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/doctor-dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/nurse-dashboard" element={<ProtectedRoute><NurseDashboard /></ProtectedRoute>} />
              <Route path="/hospital-dashboard" element={<ProtectedRoute><HospitalDashboard /></ProtectedRoute>} />
              <Route path="/case-coordinator-dashboard" element={<ProtectedRoute><CaseCoordinatorDashboard /></ProtectedRoute>} />
              <Route path="/finance-dashboard" element={<ProtectedRoute><FinanceDashboard /></ProtectedRoute>} />
              <Route path="/customer-care-dashboard" element={<ProtectedRoute><CustomerCareDashboard /></ProtectedRoute>} />
              <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
              <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsDirectory /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsLogs /></ProtectedRoute>} />
              <Route path="/privileges" element={<ProtectedRoute><PrivilegeManagement /></ProtectedRoute>} />
              <Route path="/wireframe" element={<ProtectedRoute><RequestWireframe /></ProtectedRoute>} />
              <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;