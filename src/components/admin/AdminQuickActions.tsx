
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, FileText, Upload, Settings, BarChart3 } from "lucide-react";
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button variant="outline" className="flex flex-col h-20 gap-2">
            <Plus className="w-5 h-5" />
            <span className="text-xs">Add Task</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col h-20 gap-2">
            <Users className="w-5 h-5" />
            <span className="text-xs">Manage Users</span>
          </Button>
          
          <AdminRequestsUpload onUpload={handleRequestsUpload} />
          
          <Button variant="outline" className="flex flex-col h-20 gap-2">
            <FileText className="w-5 h-5" />
            <span className="text-xs">Generate Report</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col h-20 gap-2">
            <Settings className="w-5 h-5" />
            <span className="text-xs">System Settings</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col h-20 gap-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Analytics</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
