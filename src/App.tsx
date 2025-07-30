
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { getCurrentUserRole } from "@/utils/auth";
import { SystemInitializationService } from "@/services/systemInitializationService";
import { requestStorage } from "@/services/requestStorage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
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

const App = () => {
  const currentUserRole = getCurrentUserRole();

  useEffect(() => {
    // Initialize the medical request system
    SystemInitializationService.initialize();
    requestStorage.initializeSampleData();
    
    // Cleanup on unmount
    return () => {
      SystemInitializationService.cleanup();
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']} currentUserRole={currentUserRole}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Settings Route */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']} currentUserRole={currentUserRole}>
                  <SettingsDirectory />
                </ProtectedRoute>
              } 
            />
            
            {/* Nurse Routes */}
            <Route 
              path="/nurse-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['nurse', 'admin']} currentUserRole={currentUserRole}>
                  <NurseDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Doctor Routes */}
            <Route 
              path="/doctor-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['doctor', 'admin']} currentUserRole={currentUserRole}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Hospital Routes */}
            <Route 
              path="/hospital-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['hospital', 'admin']} currentUserRole={currentUserRole}>
                  <HospitalDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Case Coordinator Routes */}
            <Route 
              path="/case-coordinator-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['case-coordinator', 'admin']} currentUserRole={currentUserRole}>
                  <CaseCoordinatorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Finance Routes */}
            <Route 
              path="/finance-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['finance', 'admin']} currentUserRole={currentUserRole}>
                  <FinanceDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Customer Care Routes */}
            <Route 
              path="/customer-care-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['customer-care', 'admin']} currentUserRole={currentUserRole}>
                  <CustomerCareDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Common Routes */}
            <Route 
              path="/create-request" 
              element={
                <ProtectedRoute allowedRoles={['nurse', 'doctor', 'admin']} currentUserRole={currentUserRole}>
                  <CreateRequest />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
