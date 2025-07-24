
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, FileText, Settings, BarChart3 } from "lucide-react";
import AdminRequestsUpload from "./AdminRequestsUpload";
import DataBackupManager from "./DataBackupManager";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AdminQuickActionsProps {
  onShowGeneralReport?: () => void;
}

export default function AdminQuickActions({ onShowGeneralReport }: AdminQuickActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRequestsUpload = (data: any[]) => {
    console.log("Processing uploaded historical requests:", data);
    toast({
      title: "Historical Requests Imported",
      description: `${data.length} requests have been successfully imported to the system.`,
    });
  };

  const handleAddTask = () => {
    console.log("Add Task clicked");
    toast({
      title: "Add Task",
      description: "Task creation functionality will be implemented soon.",
    });
  };

  const handleManageUsers = () => {
    console.log("Manage Users clicked - navigating to settings");
    navigate("/settings");
    toast({
      title: "Opening User Management",
      description: "Navigating to user management...",
    });
  };

  const handleGenerateReport = () => {
    console.log("Generate Report clicked - showing general report");
    if (onShowGeneralReport) {
      onShowGeneralReport();
    } else {
      toast({
        title: "General Reports",
        description: "Opening general reports section.",
      });
    }
  };

  const handleSystemSettings = () => {
    console.log("System Settings clicked - navigating to settings");
    navigate("/settings");
  };

  const handleAnalytics = () => {
    console.log("Analytics clicked");
    toast({
      title: "Analytics",
      description: "Analytics dashboard will be opened soon.",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleAddTask}>
            <Plus className="w-5 h-5" />
            <span className="text-xs">Add Task</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleManageUsers}>
            <Users className="w-5 h-5" />
            <span className="text-xs">Manage Users</span>
          </Button>
          
          <AdminRequestsUpload onUpload={handleRequestsUpload} />
          
          <DataBackupManager />
          
          <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleGenerateReport}>
            <FileText className="w-5 h-5" />
            <span className="text-xs">Generate Report</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleSystemSettings}>
            <Settings className="w-5 h-5" />
            <span className="text-xs">System Settings</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleAnalytics}>
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Analytics</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
