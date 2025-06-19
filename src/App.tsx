
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-request" element={<CreateRequest />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/settings-directory" element={<SettingsDirectory />} />
          <Route path="/notifications-logs" element={<NotificationsLogs />} />
          <Route path="/request-wireframe" element={<RequestWireframe />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/nurse-dashboard" element={<NurseDashboard />} />
          <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
          <Route path="/case-coordinator-dashboard" element={<CaseCoordinatorDashboard />} />
          <Route path="/finance-dashboard" element={<FinanceDashboard />} />
          <Route path="/customer-care-dashboard" element={<CustomerCareDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
