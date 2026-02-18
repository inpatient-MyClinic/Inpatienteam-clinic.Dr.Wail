
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorManagement from "@/components/DoctorManagement";
import ServicePricingTable from "@/components/ServicePricingTable";
import CustomFieldsManager from "@/components/CustomFieldsManager";
import PrivilegeManagement from "./PrivilegeManagement";
import EnhancedUserManagement from "@/components/settings/EnhancedUserManagement";
import SystemSettings from "@/components/settings/SystemSettings";
import AuditTrail from "@/components/settings/AuditTrail";
import Footer from "@/components/Footer";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminFieldConfiguration from "@/components/settings/AdminFieldConfiguration";
import UserTracker from "@/components/settings/UserTracker";
import HospitalCodes from "@/components/settings/HospitalCodes";
import SettingsDataManager from "@/components/settings/SettingsDataManager";
import PreApprovedEmails from "@/components/settings/PreApprovedEmails";
import CoordinatorHospitalMatrix from "@/components/settings/CoordinatorHospitalMatrix";
import NotificationTemplates from "@/components/settings/NotificationTemplates";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const SettingsDirectory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const exportMasterSheet = () => {
    // Get all data from localStorage
    const users = JSON.parse(localStorage.getItem('enhancedUserManagementUsers') || '[]');
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    const auditTrail = JSON.parse(localStorage.getItem('audit_trail') || '[]');
    const hospitalCodes = JSON.parse(localStorage.getItem('hospital_codes') || '[]');
    const servicePricing = JSON.parse(localStorage.getItem('service_pricing') || '[]');
    
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    // Users sheet
    const usersSheet = XLSX.utils.json_to_sheet(users.map(user => ({
      'Email': user.email,
      'Category': user.category,
      'Specialty': user.specialty || '',
      'Status': user.status,
      'Created Date': user.createdAt,
      'Field Permissions': JSON.stringify(user.fieldPermissions)
    })));
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');
    
    // Requests sheet
    const requestsSheet = XLSX.utils.json_to_sheet(requests.map(req => ({
      'ID': req.id,
      'Patient Name': req.patientName,
      'MRN': req.hospitalMRN,
      'Service': req.serviceDescription,
      'Hospital': req.hospitalName,
      'Status': req.status,
      'Created By': req.createdBy,
      'Created Date': req.dateCreated,
      'Expected Surgery Date': req.expectedSurgeryDate,
      'Payment Status': req.paymentStatus || 'Not Paid'
    })));
    XLSX.utils.book_append_sheet(workbook, requestsSheet, 'Requests');
    
    // Audit Trail sheet
    const auditSheet = XLSX.utils.json_to_sheet(auditTrail.map(entry => ({
      'Request ID': entry.requestId,
      'Action': entry.action,
      'User': entry.userName,
      'Email': entry.userEmail,
      'Date': entry.date,
      'Time': entry.time,
      'Details': JSON.stringify(entry.details)
    })));
    XLSX.utils.book_append_sheet(workbook, auditSheet, 'Audit Trail');
    
    // Hospital Codes sheet
    const codesSheet = XLSX.utils.json_to_sheet(hospitalCodes);
    XLSX.utils.book_append_sheet(workbook, codesSheet, 'Hospital Codes');
    
    // Service Pricing sheet
    const pricingSheet = XLSX.utils.json_to_sheet(servicePricing);
    XLSX.utils.book_append_sheet(workbook, pricingSheet, 'Service Pricing');
    
    // Export file
    const filename = `master_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Master Sheet Exported",
      description: `Complete system data exported to ${filename}`,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-blue-900">Settings & Directory</h1>
          <p className="text-gray-600">Manage users, roles, doctors, pricing, privileges, and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={exportMasterSheet}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Master Sheet
          </Button>
          <MessagingIcons currentUserRole="admin" />
          <Button 
            variant="outline"
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <div className="space-y-4">
          {/* User & Access Management */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">👥 User & Access Management</h3>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="pre-approved">Pre-Approved Emails</TabsTrigger>
              <TabsTrigger value="coordinator-matrix">Coordinator Matrix</TabsTrigger>
              <TabsTrigger value="privileges">Privilege Management</TabsTrigger>
            </TabsList>
          </div>

          {/* System Configuration */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">⚙️ System Configuration</h3>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="system">System Settings</TabsTrigger>
              <TabsTrigger value="admin-fields">Admin Fields</TabsTrigger>
              <TabsTrigger value="fields">Custom Fields</TabsTrigger>
            </TabsList>
          </div>

          {/* Medical & Business Setup */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">🏥 Medical & Business Setup</h3>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="doctors">Doctor Management</TabsTrigger>
              <TabsTrigger value="pricing">Service Pricing</TabsTrigger>
              <TabsTrigger value="hospital-codes">Hospital Codes</TabsTrigger>
            </TabsList>
          </div>

          {/* Data & Monitoring */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">📊 Data & Monitoring</h3>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="notifications">SMS / WhatsApp</TabsTrigger>
              <TabsTrigger value="data">Data Manager</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              <TabsTrigger value="tracker">User Tracker</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationTemplates />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <SettingsDataManager />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <EnhancedUserManagement />
        </TabsContent>

        <TabsContent value="coordinator-matrix" className="space-y-6">
          <CoordinatorHospitalMatrix />
        </TabsContent>

        <TabsContent value="pre-approved" className="space-y-6">
          <PreApprovedEmails />
        </TabsContent>

        <TabsContent value="doctors" className="space-y-6">
          <DoctorManagement />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <ServicePricingTable />
        </TabsContent>

        <TabsContent value="privileges" className="space-y-6">
          <PrivilegeManagement />
        </TabsContent>

        <TabsContent value="fields" className="space-y-6">
          <CustomFieldsManager />
        </TabsContent>

        <TabsContent value="admin-fields" className="space-y-6">
          <AdminFieldConfiguration />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditTrail />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="tracker" className="space-y-6">
          <UserTracker />
        </TabsContent>

        <TabsContent value="hospital-codes" className="space-y-6">
          <HospitalCodes />
        </TabsContent>
      </Tabs>
      
      <Footer />
    </div>
  );
};

export default SettingsDirectory;
