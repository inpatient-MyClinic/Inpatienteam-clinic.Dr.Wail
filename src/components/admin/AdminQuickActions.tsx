
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, FileText, Settings, BarChart3 } from "lucide-react";
import AdminRequestsUpload from "./AdminRequestsUpload";
import { useToast } from "@/hooks/use-toast";

export default function AdminQuickActions() {
  const { toast } = useToast();

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
    console.log("Manage Users clicked");
    toast({
      title: "User Management",
      description: "User management panel will be opened soon.",
    });
  };

  const handleGenerateReport = () => {
    console.log("Generate Report clicked");
    toast({
      title: "Report Generation",
      description: "Report generation functionality will be implemented soon.",
    });
  };

  const handleSystemSettings = () => {
    console.log("System Settings clicked");
    toast({
      title: "System Settings",
      description: "System settings panel will be opened soon.",
    });
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleAddTask}>
            <Plus className="w-5 h-5" />
            <span className="text-xs">Add Task</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleManageUsers}>
            <Users className="w-5 h-5" />
            <span className="text-xs">Manage Users</span>
          </Button>
          
          <AdminRequestsUpload onUpload={handleRequestsUpload} />
          
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
