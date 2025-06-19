
import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OverdueCounterProps {
  overdueCount: number;
  totalRequests: number;
  className?: string;
}

export default function OverdueCounter({ 
  overdueCount, 
  totalRequests, 
  className = "" 
}: OverdueCounterProps) {
  const overduePercentage = totalRequests > 0 ? ((overdueCount / totalRequests) * 100).toFixed(1) : "0";

  if (overdueCount === 0) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 ${className}`}>
        <Clock className="w-5 h-5 text-green-600" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-green-800">No Overdue Requests</span>
          <span className="text-xs text-green-600">All requests processed on time</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 ${className}`}>
      <AlertTriangle className="w-5 h-5 text-red-600" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-red-800">Overdue Requests</span>
          <Badge variant="destructive" className="text-xs">
            {overdueCount}
          </Badge>
        </div>
        <span className="text-xs text-red-600">
          {overduePercentage}% of total requests ({overdueCount}/{totalRequests})
        </span>
      </div>
    </div>
  );
}
