
import React from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { NurseRequest, REQUEST_STATUSES } from "@/hooks/useNurseRequests";

const stats = [
  { label: "New Requests", key: "new", color: "bg-blue-600", count: 2 },
  { label: "Pending", key: "pending", color: "bg-yellow-500", count: 5 },
  { label: "Scheduled", key: "scheduled", color: "bg-purple-500", count: 1 },
  { label: "Completed", key: "completed", color: "bg-green-600", count: 3 },
  { label: "Rejected", key: "rejected", color: "bg-red-500", count: 0 },
];

interface NurseStatsProps {
  filteredRequests: NurseRequest[];
}

export default function NurseStats({ filteredRequests }: NurseStatsProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 ${stat.color} text-white`}
        >
          <span className="text-xs">{stat.label}:</span>
          <span className="font-bold text-lg">{stat.count}</span>
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
