
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { getCurrentUserRole } from "./utils/auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CreateRequest from "./pages/CreateRequest";
import MyRequests from "./pages/MyRequests";
import SettingsDirectory from "./pages/SettingsDirectory";
import NotificationsLogs from "./pages/NotificationsLogs";
import RequestWireframe from "./pages/RequestWireframe";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import NurseDashboard from "./pages/NurseDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import CaseCoordinatorDashboard from "./pages/CaseCoordinatorDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import CustomerCareDashboard from "./pages/CustomerCareDashboard";

const queryClient = new QueryClient();

const App = () => {
  const currentUserRole = getCurrentUserRole();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/welcome" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin-only routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']} currentUserRole={currentUserRole}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings-directory" 
              element={
                <ProtectedRoute allowedRoles={['admin']} currentUserRole={currentUserRole}>
                  <SettingsDirectory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications-logs" 
              element={
                <ProtectedRoute allowedRoles={['admin']} currentUserRole={currentUserRole}>
                  <NotificationsLogs />
                </ProtectedRoute>
              } 
            />
            
            {/* Role-specific dashboard routes */}
            <Route 
              path="/doctor-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']} currentUserRole={currentUserRole}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/nurse-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['nurse', 'admin']} currentUserRole={currentUserRole}>
                  <NurseDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hospital-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['hospital', 'admin']} currentUserRole={currentUserRole}>
                  <HospitalDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/case-coordinator-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['case-coordinator', 'admin']} currentUserRole={currentUserRole}>
                  <CaseCoordinatorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/finance-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['finance', 'admin']} currentUserRole={currentUserRole}>
                  <FinanceDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-care-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['customer-care', 'admin']} currentUserRole={currentUserRole}>
                  <CustomerCareDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared routes accessible by multiple roles */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'hospital', 'case-coordinator', 'finance', 'customer-care']} currentUserRole={currentUserRole}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-request" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'hospital', 'case-coordinator']} currentUserRole={currentUserRole}>
                  <CreateRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-requests" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'hospital', 'case-coordinator']} currentUserRole={currentUserRole}>
                  <MyRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/request-wireframe" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'hospital', 'case-coordinator']} currentUserRole={currentUserRole}>
                  <RequestWireframe />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
