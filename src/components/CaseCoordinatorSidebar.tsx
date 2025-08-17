
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import UserProfileHeader from "@/components/UserProfileHeader";
import ComplaintManager from "@/components/complaints/ComplaintManager";

interface Stat {
  label: string;
  value: number;
  color: string;
  key: string;
}

interface CaseCoordinatorSidebarProps {
  currentCoordinatorName: string;
  allStats: Stat[];
  coordinatorStats: Stat[];
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

  return (
    <aside className="w-[22rem] bg-blue-50 flex flex-col p-6 border-r overflow-y-auto">
      <UserProfileHeader className="mb-6" />
      
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-blue-900">Case Coordinator</h1>
        <p className="text-sm text-blue-700">Dashboard</p>
      </div>

      {/* Filter by Status */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Filter by Status:</h3>
        <div className="space-y-2">
          {allStats.map((stat) => (
            <button
              key={stat.key}
              onClick={() => {
                if (activeStatusFilter === stat.label) {
                  onStatusFilterClick(null);
                } else {
                  onStatusFilterClick(stat.label);
                }
              }}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-white transition-all hover:opacity-90 ${
                activeStatusFilter === stat.label ? 'ring-2 ring-blue-400 ring-offset-1' : ''
              } ${stat.color}`}
            >
              <span className="text-xs">{stat.label}</span>
              <span className="font-bold text-sm">{stat.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* My Assignments Stats */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">My Assignments</h3>
        <div className="space-y-2">
          {coordinatorStats.map((stat) => (
            <div
              key={stat.key}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-white ${stat.color}`}
            >
              <span className="text-xs">{stat.label}</span>
              <span className="font-bold text-sm">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Complaints Management */}
      <div className="mb-6">
        <ComplaintManager 
          currentUserRole="case-coordinator" 
          currentUserName={currentCoordinatorName} 
        />
      </div>

      {/* Navigation Buttons */}
      <div className="mt-auto space-y-2">
        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 bg-white text-blue-600 border-white hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </div>
    </aside>
  );
}
