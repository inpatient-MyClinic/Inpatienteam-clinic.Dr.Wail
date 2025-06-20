
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

interface DoctorSidebarProps {
  currentDoctorName: string;
  filteredRequests: any[];
  onCreateNewRequest: () => void;
  activeStatusFilter: string | null;
  onStatusFilterClick: (status: string | null) => void;
}

export default function DoctorSidebar({ 
  currentDoctorName, 
  filteredRequests, 
  onCreateNewRequest,
  activeStatusFilter,
  onStatusFilterClick
}: DoctorSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear all user data from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('user_') || key.startsWith('password_') || key.startsWith('lastPasswordUpdate_')) {
        localStorage.removeItem(key);
      }
    });

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });

    navigate("/");
  };

  // Calculate status counts
  const statusCounts = {
    pending: filteredRequests.filter(req => req.status === "Pending").length,
    underProcess: filteredRequests.filter(req => req.status === "Under Process").length,
    needJustification: filteredRequests.filter(req => req.status === "Need Justification").length,
    done: filteredRequests.filter(req => req.status === "Done").length,
    rejected: filteredRequests.filter(req => req.status === "Rejected").length,
    delayed: filteredRequests.filter(req => req.isDelayed).length,
  };

  return (
    <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
      <Logo size="sm" showText={false} className="mb-4" />
      
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold text-blue-900">Doctor Dashboard</h1>
        <p className="text-xs text-blue-700">{currentDoctorName}</p>
      </div>

      <Button className="w-full mb-6" variant="default" onClick={onCreateNewRequest}>
        <Plus className="w-4 h-4 mr-2" />
        Create New Request
      </Button>

      {/* Status Stats */}
      <div className="w-full space-y-2 mb-6">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Pending", value: statusCounts.pending, color: "bg-yellow-600", key: "pending" },
            { label: "Under Process", value: statusCounts.underProcess, color: "bg-blue-600", key: "under_process" },
            { label: "Need Justification", value: statusCounts.needJustification, color: "bg-orange-600", key: "need_justification" },
            { label: "Done", value: statusCounts.done, color: "bg-green-600", key: "done" },
            { label: "Rejected", value: statusCounts.rejected, color: "bg-red-600", key: "rejected" },
            { label: "Delayed", value: statusCounts.delayed, color: "bg-gray-600", key: "delayed" },
          ].map((stat) => (
            <div
              key={stat.key}
              className={`${stat.color} text-white p-3 rounded-lg text-center cursor-pointer transition-all duration-200 ${
                activeStatusFilter === stat.key.replace('_', ' ') ? 'ring-2 ring-white ring-offset-2' : 'hover:opacity-80'
              }`}
              onClick={() => onStatusFilterClick(activeStatusFilter === stat.key.replace('_', ' ') ? null : stat.key.replace('_', ' '))}
            >
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-2 w-full">
        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>

        <Button 
          variant="destructive"
          onClick={handleLogout}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
