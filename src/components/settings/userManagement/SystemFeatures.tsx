
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Trash2, Search, FileSpreadsheet, Save, RefreshCw } from "lucide-react";

const SystemFeatures = () => {
  const features = [
    {
      icon: Users,
      title: "Add Users",
      description: "Add users with email validation and category assignment",
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: Shield,
      title: "Edit Permissions",
      description: "Edit field-level permissions for each user",
      color: "bg-green-100 text-green-800"
    },
    {
      icon: Trash2,
      title: "Delete Users",
      description: "Remove users from the system",
      color: "bg-red-100 text-red-800"
    },
    {
      icon: Search,
      title: "Search & Filter",
      description: "Filter by category, specialty, and status",
      color: "bg-purple-100 text-purple-800"
    },
    {
      icon: FileSpreadsheet,
      title: "Excel Import/Export",
      description: "Import users from Excel and export filtered data",
      color: "bg-orange-100 text-orange-800"
    },
    {
      icon: Save,
      title: "Persistent Storage",
      description: "All data is saved to localStorage automatically",
      color: "bg-indigo-100 text-indigo-800"
    },
    {
      icon: RefreshCw,
      title: "Real-time Updates",
      description: "Changes are reflected immediately in the UI",
      color: "bg-teal-100 text-teal-800"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Features</CardTitle>
        <CardDescription>Available functionality in the User Management system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-md ${feature.color}`}>
                <feature.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{feature.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemFeatures;
