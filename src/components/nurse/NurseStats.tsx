
import React from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { NurseRequest, REQUEST_STATUSES } from "@/hooks/useNurseRequests";

interface NurseStatsProps {
  filteredRequests: NurseRequest[];
}

export default function NurseStats({ filteredRequests }: NurseStatsProps) {
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
        <div
          key={stat.status}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 ${stat.color} text-white`}
        >
          <span className="text-xs">{stat.label}:</span>
          <span className="font-bold text-lg">{getStatusCount(stat.status)}</span>
        </div>
      ))}
      
      {/* Delayed Requests Counter */}
      <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-red-600 text-white">
        <Clock className="w-4 h-4" />
        <span className="text-xs">Delayed:</span>
        <span className="font-bold text-lg">
          {filteredRequests.filter(req => req.isDelayed).length}
        </span>
      </div>
      
      {/* Incomplete Requests Counter */}
      <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-orange-600 text-white">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs">Incomplete:</span>
        <span className="font-bold text-lg">
          {filteredRequests.filter(req => req.status === REQUEST_STATUSES.NOT_COMPLETED).length}
        </span>
      </div>
    </div>
  );
}
