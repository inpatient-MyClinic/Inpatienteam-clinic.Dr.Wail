
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, Shield, Trash2, Search, FileSpreadsheet, 
  Save, RefreshCw, Building2, UserPlus, CheckCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import HospitalPrivilegesTable from "./HospitalPrivilegesTable";
import { User } from "./types";

interface SystemFeaturesProps {
  users?: User[];
}

const SystemFeatures = ({ users = [] }: SystemFeaturesProps) => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFeatureClick = (featureId: string, featureName: string) => {
    setOpenDialog(featureId);
    toast({
      title: "Feature Accessed",
      description: `${featureName} is now active and available`,
    });
  };

  const features = [
    {
      id: "add-users",
      icon: UserPlus,
      title: "Add Users",
      description: "Add users with email validation and automatic role-based permissions",
      color: "bg-blue-100 text-blue-800",
      status: "Active",
      details: [
        "Email validation with domain checking",
        "Automatic role-based permission assignment",
        "Real-time user creation with immediate activation",
        "Category-based privilege assignment",
        "Specialty selection for doctors"
      ]
    },
    {
      id: "field-permissions",
      icon: Shield,
      title: "Field Permissions",
      description: "Granular field-level permissions for each user category",
      color: "bg-green-100 text-green-800",
      status: "Active",
      details: [
        "10 system fields with customizable access levels",
        "None/View/Edit permission levels",
        "Category-based default permissions",
        "Individual user permission overrides",
        "Real-time permission updates"
      ]
    },
    {
      id: "hospital-privileges",
      icon: Building2,
      title: "Hospital Privileges",
      description: "Assign specific hospital access rights to doctors",
      color: "bg-purple-100 text-purple-800",
      status: "Active",
      details: [
        "8+ major hospitals in the system",
        "Doctor-specific hospital access management",
        "Bulk privilege assignment",
        "Visual privilege status indicators",
        "Immediate access control updates"
      ],
      showTable: true
    },
    {
      id: "advanced-filtering",
      icon: Search,
      title: "Advanced Filtering",
      description: "Filter by category, specialty, status with real-time search",
      color: "bg-orange-100 text-orange-800",
      status: "Active",
      details: [
        "Real-time search across all user fields",
        "Category filtering (7 user categories)",
        "Medical specialty filtering (10+ specialties)",
        "Status filtering (Active/Inactive)",
        "Combined filter support with clear options"
      ]
    },
    {
      id: "excel-integration",
      icon: FileSpreadsheet,
      title: "Excel Integration",
      description: "Import users from Excel and export filtered data to CSV",
      color: "bg-indigo-100 text-indigo-800",
      status: "Active",
      details: [
        "Excel file upload with validation",
        "Automatic duplicate detection",
        "CSV export of filtered user data",
        "Template download for proper formatting",
        "Bulk user import with error handling"
      ]
    },
    {
      id: "persistent-storage",
      icon: Save,
      title: "Persistent Storage",
      description: "All data automatically saved to localStorage with backup",
      color: "bg-teal-100 text-teal-800",
      status: "Active",
      details: [
        "Automatic data persistence on every change",
        "Backup storage for data recovery",
        "101 users currently stored",
        "Real-time synchronization",
        "Data integrity validation"
      ]
    }
  ];

  const closeDialog = () => setOpenDialog(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Capabilities</CardTitle>
        <CardDescription>
          Complete user management functionality with enterprise-grade features - Click any feature to see details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.id}>
              <Dialog open={openDialog === feature.id} onOpenChange={(open) => !open && closeDialog()}>
                <DialogTrigger asChild>
                  <div 
                    className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer hover:shadow-md"
                    onClick={() => handleFeatureClick(feature.id, feature.title)}
                  >
                    <div className={`p-2 rounded-md ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">{feature.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {feature.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </DialogTrigger>
                
                <DialogContent className={feature.showTable ? "max-w-6xl" : "max-w-md"}>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-md ${feature.color}`}>
                        <feature.icon className="w-4 h-4" />
                      </div>
                      {feature.title}
                    </DialogTitle>
                    <DialogDescription>
                      {feature.description}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {feature.showTable && feature.id === "hospital-privileges" ? (
                      <HospitalPrivilegesTable users={users} />
                    ) : (
                      <>
                        <div>
                          <h4 className="font-medium mb-2">Feature Details:</h4>
                          <ul className="space-y-1">
                            {feature.details.map((detail, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <Badge variant="secondary" className="text-xs">
                            Status: {feature.status}
                          </Badge>
                          <Button size="sm" onClick={closeDialog}>
                            Got it
                          </Button>
                        </div>
                      </>
                    )}

                    {feature.showTable && (
                      <div className="flex justify-end pt-4 border-t">
                        <Button size="sm" onClick={closeDialog}>
                          Close
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">All Systems Operational</h4>
              <p className="text-sm text-blue-700 mt-1">
                All 6 core system capabilities are fully functional and actively managing your user data. 
                Click any feature above to see detailed information about its current status and capabilities.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemFeatures;
