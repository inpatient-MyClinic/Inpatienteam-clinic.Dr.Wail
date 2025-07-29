
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Settings, FileText, BarChart3, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

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

      <Button 
        variant="outline"
        onClick={() => navigate("/role-selection")}
        className="w-full flex items-center gap-2 mt-auto border-blue-300 text-blue-700 hover:bg-blue-100"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Roles
      </Button>
    </aside>
  );
}
