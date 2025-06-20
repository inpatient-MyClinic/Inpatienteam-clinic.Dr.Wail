
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseCoordinatorRequest } from "@/hooks/useCaseCoordinatorRequests";

interface CaseCoordinatorAnalyticsProps {
  filteredRequests: CaseCoordinatorRequest[];
  currentCoordinatorName: string;
}

export default function CaseCoordinatorAnalytics({
  filteredRequests,
  currentCoordinatorName
}: CaseCoordinatorAnalyticsProps) {
  const totalRequests = filteredRequests.length;
  const completedRequests = filteredRequests.filter(req => req.status === "Done").length;
  const rejectedRequests = filteredRequests.filter(req => req.status === "Rejected").length;
  
  const completionRate = totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(1) : "0";
  const approvalRate = totalRequests > 0 ? (((totalRequests - rejectedRequests) / totalRequests) * 100).toFixed(1) : "0";
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : "0";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Case Coordination Analytics</CardTitle>
        <CardDescription>Performance metrics for case coordination activities</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
          <p className="text-4xl font-bold text-green-600">{completionRate}%</p>
          <p className="text-sm text-gray-500">
            ({completedRequests} completed / {totalRequests} total cases)
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Approval Rate</h3>
          <p className="text-4xl font-bold text-blue-600">{approvalRate}%</p>
          <p className="text-sm text-gray-500">
            ({totalRequests - rejectedRequests} approved / {totalRequests} total cases)
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Rejection Rate</h3>
          <p className="text-4xl font-bold text-red-600">{rejectionRate}%</p>
          <p className="text-sm text-gray-500">
            ({rejectedRequests} rejected / {totalRequests} total cases)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
