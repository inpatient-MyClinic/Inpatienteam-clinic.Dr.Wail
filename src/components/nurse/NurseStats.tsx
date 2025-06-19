
import React from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NurseRequest, REQUEST_STATUSES } from "@/hooks/useNurseRequests";

interface NurseStatsProps {
  filteredRequests: NurseRequest[];
  activeStatusFilter: string | null;
  onStatusFilterClick: (status: string | null) => void;
}

export default function NurseStats({ 
  filteredRequests, 
  activeStatusFilter, 
  onStatusFilterClick 
}: NurseStatsProps) {
  const getStatusCount = (status: string) => {
    return filteredRequests.filter(req => req.status === status).length;
  };

  const stats = [
    { label: "New Requests", status: REQUEST_STATUSES.PENDING, color: "bg-blue-600" },
    { label: "Under Process", status: REQUEST_STATUSES.UNDER_PROCESS, color: "bg-yellow-500" },
    { label: "Patient Contacted", status: REQUEST_STATUSES.PATIENT_CONTACTED, color: "bg-purple-500" },
    { label: "Submitted to Insurance", status: REQUEST_STATUSES.SUBMITTED_TO_INSURANCE, color: "bg-orange-500" },
    { label: "Approved by Hospital", status: REQUEST_STATUSES.APPROVED_BY_HOSPITAL, color: "bg-cyan-500" },
    { label: "Completed", status: REQUEST_STATUSES.DONE, color: "bg-green-600" },
    { label: "Rejected", status: REQUEST_STATUSES.REJECTED, color: "bg-red-500" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {stats.map((stat) => (
        <Button
          key={stat.status}
          onClick={() => onStatusFilterClick(activeStatusFilter === stat.status ? null : stat.status)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-all ${stat.color} ${
            activeStatusFilter === stat.status ? 'ring-2 ring-white ring-offset-2' : ''
          } hover:opacity-90`}
          variant="ghost"
        >
          <span className="text-xs">{stat.label}:</span>
          <span className="font-bold text-lg">{getStatusCount(stat.status)}</span>
        </Button>
      ))}
      
      {/* Delayed Requests Counter */}
      <Button
        onClick={() => onStatusFilterClick(activeStatusFilter === 'delayed' ? null : 'delayed')}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 bg-red-600 text-white transition-all ${
          activeStatusFilter === 'delayed' ? 'ring-2 ring-white ring-offset-2' : ''
        } hover:opacity-90`}
        variant="ghost"
      >
        <Clock className="w-4 h-4" />
        <span className="text-xs">Delayed:</span>
        <span className="font-bold text-lg">
          {filteredRequests.filter(req => req.isDelayed).length}
        </span>
      </Button>
      
      {/* Incomplete Requests Counter */}
      <Button
        onClick={() => onStatusFilterClick(activeStatusFilter === REQUEST_STATUSES.NOT_COMPLETED ? null : REQUEST_STATUSES.NOT_COMPLETED)}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 bg-orange-600 text-white transition-all ${
          activeStatusFilter === REQUEST_STATUSES.NOT_COMPLETED ? 'ring-2 ring-white ring-offset-2' : ''
        } hover:opacity-90`}
        variant="ghost"
      >
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs">Incomplete:</span>
        <span className="font-bold text-lg">
          {filteredRequests.filter(req => req.status === REQUEST_STATUSES.NOT_COMPLETED).length}
        </span>
      </Button>

      {/* Clear Status Filter */}
      {activeStatusFilter && (
        <Button
          onClick={() => onStatusFilterClick(null)}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 mt-2"
        >
          Clear Status Filter
        </Button>
      )}
    </div>
  );
}
