
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

interface CaseCoordinatorSidebarProps {
  currentCoordinatorName: string;
  allStats: Array<{
    label: string;
    value: number;
    color: string;
    key: string;
  }>;
  coordinatorStats: Array<{
    label: string;
    value: number;
    color: string;
    key: string;
  }>;
  activeStatusFilter: string | null;
  onStatusFilterClick: (status: string | null) => void;
}

export default function CaseCoordinatorSidebar({ 
  currentCoordinatorName, 
  allStats,
  coordinatorStats,
  activeStatusFilter,
  onStatusFilterClick
}: CaseCoordinatorSidebarProps) {
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

  const handleCreateRequest = () => {
    navigate("/create-request");
  };

  return (
    <aside className="w-[19rem] bg-purple-50 flex flex-col items-center p-6 border-r">
      <Logo size="sm" showText={false} className="mb-4" />
      
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold text-purple-900">Case Coordinator</h1>
        <p className="text-xs text-purple-700">{currentCoordinatorName}</p>
      </div>

      {/* Create Request Button */}
      <div className="w-full mb-6">
        <Button 
          onClick={handleCreateRequest}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Request
        </Button>
      </div>

      {/* All Requests Stats */}
      <div className="w-full mb-6">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">All Requests</h3>
        <div className="grid grid-cols-2 gap-2">
          {allStats.map((stat) => (
            <div
              key={stat.key}
              className={`${stat.color} text-white p-2 rounded text-center cursor-pointer transition-all duration-200 ${
                activeStatusFilter === stat.label ? 'ring-2 ring-white ring-offset-1' : 'hover:opacity-80'
              }`}
              onClick={() => onStatusFilterClick(activeStatusFilter === stat.label ? null : stat.label)}
            >
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Coordinator Specific Stats */}
      <div className="w-full mb-6">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">My Assignments</h3>
        <div className="grid grid-cols-2 gap-2">
          {coordinatorStats.map((stat) => (
            <div
              key={stat.key}
              className={`${stat.color} text-white p-2 rounded text-center cursor-pointer transition-all duration-200 ${
                activeStatusFilter === stat.label ? 'ring-2 ring-white ring-offset-1' : 'hover:opacity-80'
              }`}
              onClick={() => onStatusFilterClick(activeStatusFilter === stat.label ? null : stat.label)}
            >
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-2 w-full">
        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-100"
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
