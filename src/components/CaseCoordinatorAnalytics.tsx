
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseCoordinatorRequest } from "@/hooks/useCaseCoordinatorRequests";

interface CaseCoordinatorAnalyticsProps {
  coordinatorRequests: CaseCoordinatorRequest[];
  allRequests: CaseCoordinatorRequest[];
  overdueRequests: CaseCoordinatorRequest[];
  currentCoordinatorName: string;
}

export default function CaseCoordinatorAnalytics({
  coordinatorRequests,
  allRequests,
  overdueRequests,
  currentCoordinatorName
}: CaseCoordinatorAnalyticsProps) {
  const totalCoordinatorRequests = coordinatorRequests.length;
  const completedRequests = coordinatorRequests.filter(req => req.status === "Done").length;
  const totalAllRequests = allRequests.length;
  const totalCoordinatorHandledRequests = allRequests.filter(req => req.assignedCoordinator).length;
  
  const conversionRate = totalCoordinatorRequests > 0 ? ((completedRequests / totalCoordinatorRequests) * 100).toFixed(1) : "0";
  const utilizationRate = totalCoordinatorHandledRequests > 0 ? ((totalCoordinatorRequests / totalCoordinatorHandledRequests) * 100).toFixed(1) : "0";
  const overdueCount = overdueRequests.length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Case Coordination Analytics</CardTitle>
        <CardDescription>Performance metrics for case coordination activities</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
          <p className="text-4xl font-bold text-green-600">{conversionRate}%</p>
          <p className="text-sm text-gray-500">
            ({completedRequests} done / {totalCoordinatorRequests} coordinator cases)
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Utilization Rate</h3>
          <p className="text-4xl font-bold text-blue-600">{utilizationRate}%</p>
          <p className="text-sm text-gray-500">
            ({totalCoordinatorRequests} handled / {totalCoordinatorHandledRequests} total assigned)
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Overdue Requests</h3>
          <p className="text-4xl font-bold text-red-600">{overdueCount}</p>
          <p className="text-sm text-gray-500">
            Requests not acted upon within 4 hours
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
