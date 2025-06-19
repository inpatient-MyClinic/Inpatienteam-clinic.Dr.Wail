
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DoctorRequest } from "@/hooks/useDoctorRequests";

interface DoctorSidebarProps {
  currentDoctorName: string;
  filteredRequests: DoctorRequest[];
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

  // Calculate stats from filtered requests
  const stats = [
    {
      label: "Pending",
      key: "pending",
      color: "bg-yellow-500",
      count: filteredRequests.filter(req => req.status === "Pending").length
    },
    {
      label: "Under Process", 
      key: "under_process",
      color: "bg-blue-500",
      count: filteredRequests.filter(req => req.status === "Under Process").length
    },
    {
      label: "Done",
      key: "done", 
      color: "bg-green-500",
      count: filteredRequests.filter(req => req.status === "Done").length
    },
    {
      label: "Delayed",
      key: "delayed",
      color: "bg-red-500", 
      count: filteredRequests.filter(req => req.isDelayed).length
    },
    {
      label: "Rejected",
      key: "rejected",
      color: "bg-gray-500",
      count: filteredRequests.filter(req => req.status === "Rejected").length
    }
  ];

  return (
    <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
      <div className="text-center mb-4">
        <img 
          src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
          alt="My Clinic Logo" 
          className="h-8 w-auto mx-auto mb-2"
        />
        <h1 className="text-lg font-bold text-blue-900">Doctor Dashboard</h1>
        <p className="text-xs text-blue-700">{currentDoctorName}</p>
      </div>

      <Button className="w-full mb-8" variant="default" onClick={onCreateNewRequest}>
        <Plus className="w-4 h-4 mr-2" />
        Create New Request
      </Button>
      
      <div className="flex flex-col gap-2 w-full mb-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">Filter by Status:</p>
        {stats.map((stat) => (
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
            <span className="font-bold text-lg">{stat.count}</span>
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
