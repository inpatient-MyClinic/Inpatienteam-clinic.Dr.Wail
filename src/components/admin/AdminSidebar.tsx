
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Settings, FileText, BarChart3, ArrowLeft, Plus, LogOut, UserCheck, Stethoscope, Building2, Clipboard, DollarSign, HeartHandshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/auth/LogoutButton";
import ComplaintManager from "@/components/complaints/ComplaintManager";

interface AdminSidebarProps {
  activeFilter: string | null;
  showAnalytics: boolean;
  filteredData: any[];
  onStatusFilter: (status: string | null) => void;
  onToggleAnalytics: () => void;
}

export default function AdminSidebar({ 
  activeFilter, 
  showAnalytics, 
  filteredData,
  onStatusFilter, 
  onToggleAnalytics 
}: AdminSidebarProps) {
  const navigate = useNavigate();

  // Calculate dynamic stats from filtered data
  const adminStats = [
    { 
      label: "Pending", 
      value: filteredData.filter(item => item.status === "Pending").length, 
      color: "bg-yellow-500", 
      key: "pending" 
    },
    { 
      label: "Completed", 
      value: filteredData.filter(item => item.status === "Completed" || item.status === "Done").length, 
      color: "bg-green-600", 
      key: "completed" 
    },
    { 
      label: "In Progress", 
      value: filteredData.filter(item => item.status === "In Progress").length, 
      color: "bg-blue-600", 
      key: "in_progress" 
    },
    { 
      label: "High Priority", 
      value: filteredData.filter(item => item.priority === "High" || item.priority === "High Priority").length, 
      color: "bg-red-600", 
      key: "high_priority" 
    },
  ];

  console.log("AdminSidebar rendering, showAnalytics:", showAnalytics);

  return (
    <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
      <Logo size="sm" showText={false} className="mb-4" />
      
      <div className="text-center mb-8">
        <h1 className="text-lg font-bold text-blue-900">Admin Dashboard</h1>
        <p className="text-xs text-blue-700">System Administration</p>
      </div>

      {/* Create Request Button */}
      <Button 
        className="w-full mb-6" 
        variant="default" 
        onClick={() => navigate("/create-request")}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Request
      </Button>
      
      <div className="flex flex-col gap-2 w-full mb-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">Filter by Status:</p>
        {adminStats.map((stat) => (
          <div
            key={stat.key}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 cursor-pointer transition-opacity ${
              !activeFilter || activeFilter === stat.label 
                ? stat.color 
                : stat.color + ' opacity-50'
            } text-white`}
            onClick={() => onStatusFilter(activeFilter === stat.label ? null : stat.label)}
          >
            <span className="text-xs">{stat.label}:</span>
            <span className="font-bold text-lg">{stat.value}</span>
          </div>
        ))}
        
        {activeFilter && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onStatusFilter(null)}
            className="mt-2"
          >
            Clear Filter
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full mb-4">
        <Button 
          variant={showAnalytics ? "default" : "outline"}
          onClick={() => {
            console.log("Analytics button clicked, current state:", showAnalytics);
            onToggleAnalytics();
          }}
          className="w-full"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {showAnalytics ? "Hide Analytics" : "Show Analytics"}
        </Button>
      </div>

      {/* Admin Dashboard Navigation */}
      <div className="flex flex-col gap-2 w-full mb-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">View Other Dashboards:</p>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/doctor")}
          className="w-full justify-start text-blue-700 hover:bg-blue-100"
        >
          <Stethoscope className="w-4 h-4 mr-2" />
          Doctor Dashboard
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/nurse")}
          className="w-full justify-start text-blue-700 hover:bg-blue-100"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Nurse Dashboard
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/hospital")}
          className="w-full justify-start text-blue-700 hover:bg-blue-100"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Hospital Dashboard
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/case-coordinator")}
          className="w-full justify-start text-blue-700 hover:bg-blue-100"
        >
          <Clipboard className="w-4 h-4 mr-2" />
          Case Coordinator
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/finance")}
          className="w-full justify-start text-blue-700 hover:bg-blue-100"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Finance Dashboard
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/customer-care")}
          className="w-full justify-start text-blue-700 hover:bg-blue-100"
        >
          <HeartHandshake className="w-4 h-4 mr-2" />
          Customer Care
        </Button>
      </div>

      {/* Complaints Management */}
      <div className="w-full mb-4">
        <ComplaintManager 
          currentUserRole="admin" 
          currentUserName="Admin User" 
        />
      </div>

      <div className="mt-auto flex flex-col gap-2 w-full">
        <LogoutButton 
          variant="outline"
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
        />
        
        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </div>
    </aside>
  );
}
