
import React from "react";
import { NurseRequest, REQUEST_STATUSES } from "@/hooks/useNurseRequests";

interface NurseAnalyticsProps {
  filteredRequests: NurseRequest[];
  currentNurseName: string;
}

export default function NurseAnalytics({ filteredRequests, currentNurseName }: NurseAnalyticsProps) {
  // Only count requests created by this nurse
  const nurseRequests = filteredRequests.filter(req => req.createdBy === currentNurseName);
  
  const totalRequests = nurseRequests.length;
  const needJustificationRequests = nurseRequests.filter(req => 
    req.status === REQUEST_STATUSES.NEED_JUSTIFICATION
  ).length;

  return (
    <div className="w-full mt-6">
      <h3 className="text-sm font-semibold text-blue-900 mb-3">Analytics</h3>
      <div className="space-y-3">
        {/* Total Requests Created */}
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
          <span className="text-xs text-gray-800">Total Requests Created</span>
          <span className="font-bold text-gray-900">{totalRequests}</span>
        </div>

        {/* Need Justification */}
        <div className="flex items-center justify-between p-3 bg-pink-100 rounded-lg">
          <span className="text-xs text-pink-800">Need More Data/Justification</span>
          <span className="font-bold text-pink-900">{needJustificationRequests}</span>
        </div>
      </div>
    </div>
  );
}
