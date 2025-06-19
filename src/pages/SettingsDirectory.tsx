
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DoctorManagement from "@/components/DoctorManagement";
import ServicePricingTable from "@/components/ServicePricingTable";
import CustomFieldsManager from "@/components/CustomFieldsManager";
import PrivilegeManagement from "./PrivilegeManagement";
import UserManagement from "@/components/settings/UserManagement";
import SystemSettings from "@/components/settings/SystemSettings";

const SettingsDirectory = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-900">Settings & Directory</h1>
        <p className="text-gray-600">Manage users, roles, doctors, pricing, privileges, and system settings</p>
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
          <UserManagement />
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
    </div>
  );
};

export default SettingsDirectory;
