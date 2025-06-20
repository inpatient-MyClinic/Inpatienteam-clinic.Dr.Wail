
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

interface CaseCoordinatorSidebarProps {
  currentCoordinatorName: string;
  allStats: {
    label: string;
    value: number;
    color: string;
    key: string;
  }[];
  coordinatorStats: {
    label: string;
    value: number;
    color: string;
    key: string;
  }[];
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
    <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
      <Logo size="sm" showText={false} className="mb-4" />
      
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold text-blue-900">Case Coordinator</h1>
        <p className="text-xs text-blue-700">{currentCoordinatorName}</p>
      </div>

      <Button className="w-full mb-8" variant="default" onClick={() => navigate("/create-request")}>
        <Plus className="w-4 h-4 mr-2" />
        Create New Case
      </Button>
      
      {/* All Requests Stats */}
      <div className="flex flex-col gap-2 w-full mb-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">All Requests:</p>
        {allStats.map((stat) => (
          <div
            key={stat.key}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 cursor-pointer transition-opacity ${
              !activeStatusFilter || activeStatusFilter === stat.label 
                ? stat.color 
                : stat.color + ' opacity-50'
            } text-white`}
            onClick={() => onStatusFilterClick(activeStatusFilter === stat.label ? null : stat.label)}
          >
            <span className="text-xs">{stat.label}:</span>
            <span className="font-bold text-lg">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Coordinator Specific Stats */}
      <div className="flex flex-col gap-2 w-full mb-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">My Cases:</p>
        {coordinatorStats.map((stat) => (
          <div
            key={stat.key + '_coordinator'}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 cursor-pointer transition-opacity ${
              !activeStatusFilter || activeStatusFilter === stat.label 
                ? stat.color 
                : stat.color + ' opacity-50'
            } text-white`}
            onClick={() => onStatusFilterClick(activeStatusFilter === stat.label ? null : stat.label)}
          >
            <span className="text-xs">{stat.label}:</span>
            <span className="font-bold text-lg">{stat.value}</span>
          </div>
        ))}
        
        {activeStatusFilter && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onStatusFilterClick(null)}
            className="mt-2"
          >
            Clear Filter
          </Button>
        )}
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
