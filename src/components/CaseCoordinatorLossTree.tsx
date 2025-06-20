
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseCoordinatorRequest } from "@/hooks/useCaseCoordinatorRequests";

interface CaseCoordinatorLossTreeProps {
  filteredRequests: CaseCoordinatorRequest[];
}

export default function CaseCoordinatorLossTree({
  filteredRequests
}: CaseCoordinatorLossTreeProps) {
  const getDelayAnalysis = (status: string) => {
    const statusRequests = filteredRequests.filter(req => 
      req.status.toLowerCase() === status.toLowerCase()
    );
    
    const causes = statusRequests.reduce((acc, req) => {
      if (req.delayCause) {
        acc[req.delayCause] = (acc[req.delayCause] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total: statusRequests.length, causes };
  };

  const pendingAnalysis = getDelayAnalysis("pending");
  const scheduledAnalysis = getDelayAnalysis("scheduled");
  const postponedAnalysis = getDelayAnalysis("postponed");
  const rejectedAnalysis = getDelayAnalysis("rejected");
  const cancelledAnalysis = getDelayAnalysis("cancelled");

  const DelayBreakdown = ({ title, analysis }: { title: string; analysis: { total: number; causes: Record<string, number> } }) => (
    <div className="p-4 border rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-2xl font-bold text-blue-600 mb-2">{analysis.total}</p>
      <div className="space-y-1">
        {Object.entries(analysis.causes).map(([cause, count]) => (
          <div key={cause} className="flex justify-between text-sm">
            <span className="capitalize">{cause}:</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Loss Tree Analysis</CardTitle>
        <CardDescription>Breakdown of delay causes by status category</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DelayBreakdown title="Pending" analysis={pendingAnalysis} />
        <DelayBreakdown title="Scheduled" analysis={scheduledAnalysis} />
        <DelayBreakdown title="Postponed" analysis={postponedAnalysis} />
        <DelayBreakdown title="Rejected" analysis={rejectedAnalysis} />
        <DelayBreakdown title="Cancelled" analysis={cancelledAnalysis} />
        <div className="p-4 border rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Delay Causes Legend</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Doctor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Hospital</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Insurance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Patient</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
