
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Shield, Trash2, Search, FileSpreadsheet, 
  Save, RefreshCw, Building2, UserPlus 
} from "lucide-react";

const SystemFeatures = () => {
  const features = [
    {
      icon: UserPlus,
      title: "Add Users",
      description: "Add users with email validation and automatic role-based permissions",
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: Shield,
      title: "Field Permissions",
      description: "Granular field-level permissions for each user category",
      color: "bg-green-100 text-green-800"
    },
    {
      icon: Building2,
      title: "Hospital Privileges",
      description: "Assign specific hospital access rights to doctors",
      color: "bg-purple-100 text-purple-800"
    },
    {
      icon: Search,
      title: "Advanced Filtering",
      description: "Filter by category, specialty, status with real-time search",
      color: "bg-orange-100 text-orange-800"
    },
    {
      icon: FileSpreadsheet,
      title: "Excel Integration",
      description: "Import users from Excel and export filtered data to CSV",
      color: "bg-indigo-100 text-indigo-800"
    },
    {
      icon: Save,
      title: "Persistent Storage",
      description: "All data automatically saved to localStorage with backup",
      color: "bg-teal-100 text-teal-800"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Capabilities</CardTitle>
        <CardDescription>
          Complete user management functionality with enterprise-grade features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-md ${feature.color}`}>
                <feature.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{feature.title}</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemFeatures;
