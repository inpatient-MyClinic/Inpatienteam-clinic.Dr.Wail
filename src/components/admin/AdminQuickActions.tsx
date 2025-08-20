
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, FileText, Settings, BarChart3, Calculator, Mail, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminRequestsUpload from "./AdminRequestsUpload";
import DataBackupManager from "./DataBackupManager";
import TaskCreationDialog from "./TaskCreationDialog";
import { EmailTestDialog } from "./EmailTestDialog";
import { EmailHealthCheck } from "./EmailHealthCheck";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AdminQuickActionsProps {
  onShowGeneralReport?: () => void;
  onShowFinanceAnalytics?: () => void;
}

export default function AdminQuickActions({ onShowGeneralReport, onShowFinanceAnalytics }: AdminQuickActionsProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showEmailTestDialog, setShowEmailTestDialog] = useState(false);

  const handleRequestsUpload = (data: any[]) => {
    console.log("Processing uploaded historical requests:", data);
    toast({
      title: "Historical Requests Imported",
      description: `${data.length} requests have been successfully imported to the system.`,
    });
  };

  const handleAddTask = () => {
    console.log("Add Task clicked - opening task creation dialog");
    setShowTaskDialog(true);
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

  const handleFinanceAnalytics = () => {
    console.log("Finance Analytics clicked");
    if (onShowFinanceAnalytics) {
      onShowFinanceAnalytics();
    } else {
      toast({
        title: "Finance Analytics",
        description: "Opening finance analytics table.",
      });
    }
  };

  const handleHealthCheck = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('health-check');
      
      if (error) {
        toast({
          title: "Health Check Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Health Check Successful",
        description: `Site URL: ${data.siteUrl}`,
      });
    } catch (error: any) {
      toast({
        title: "Health Check Error",
        description: error.message || "Failed to perform health check",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-4">
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
            
            <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleFinanceAnalytics}>
              <Calculator className="w-5 h-5" />
              <span className="text-xs">Finance Analytics</span>
            </Button>
            
            <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleSystemSettings}>
              <Settings className="w-5 h-5" />
              <span className="text-xs">System Settings</span>
            </Button>
            
            <EmailHealthCheck />
            
            <Button variant="outline" className="flex flex-col h-20 gap-2" onClick={handleHealthCheck}>
              <Activity className="w-5 h-5" />
              <span className="text-xs">Health</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <TaskCreationDialog 
        open={showTaskDialog} 
        onClose={() => setShowTaskDialog(false)} 
      />
      
      <EmailTestDialog
        open={showEmailTestDialog}
        onOpenChange={setShowEmailTestDialog}
      />
    </>
  );
}
