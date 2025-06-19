
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
  const doneRequests = nurseRequests.filter(req => req.status === REQUEST_STATUSES.DONE).length;
  const rejectedRequests = nurseRequests.filter(req => req.status === REQUEST_STATUSES.REJECTED).length;
  const approvedRequests = nurseRequests.filter(req => 
    req.status === REQUEST_STATUSES.APPROVED_BY_HOSPITAL || 
    req.status === REQUEST_STATUSES.DONE
  ).length;
  const needJustificationRequests = nurseRequests.filter(req => 
    req.status === REQUEST_STATUSES.NEED_JUSTIFICATION
  ).length;

  const conversionRate = totalRequests > 0 ? ((doneRequests / totalRequests) * 100).toFixed(1) : "0";
  const approvalRate = totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(1) : "0";
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : "0";

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
        
        {/* Conversion Rate */}
        <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
          <span className="text-xs text-green-800">Conversion Rate</span>
          <span className="font-bold text-green-900">{conversionRate}%</span>
        </div>
        
        {/* Approval Rate */}
        <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
          <span className="text-xs text-blue-800">Approval Rate</span>
          <span className="font-bold text-blue-900">{approvalRate}%</span>
        </div>
        
        {/* Rejection Rate */}
        <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
          <span className="text-xs text-red-800">Rejection Rate</span>
          <span className="font-bold text-red-900">{rejectionRate}%</span>
        </div>
      </div>
    </div>
  );
}
