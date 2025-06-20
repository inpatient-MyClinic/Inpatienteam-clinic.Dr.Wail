
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorManagement from "@/components/DoctorManagement";
import ServicePricingTable from "@/components/ServicePricingTable";
import CustomFieldsManager from "@/components/CustomFieldsManager";
import PrivilegeManagement from "./PrivilegeManagement";
import EnhancedUserManagement from "@/components/settings/EnhancedUserManagement";
import SystemSettings from "@/components/settings/SystemSettings";
import Footer from "@/components/Footer";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsDirectory = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-blue-900">Settings & Directory</h1>
          <p className="text-gray-600">Manage users, roles, doctors, pricing, privileges, and system settings</p>
        </div>
        <div className="flex gap-2">
          <MessagingIcons currentUserRole="admin" />
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="doctors">Doctor Management</TabsTrigger>
          <TabsTrigger value="pricing">Service Pricing</TabsTrigger>
          <TabsTrigger value="privileges">Privilege Management</TabsTrigger>
          <TabsTrigger value="fields">Custom Fields</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <EnhancedUserManagement />
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

        <TabsContent value="system" className="space-y-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
      
      <Footer />
    </div>
  );
};

export default SettingsDirectory;
