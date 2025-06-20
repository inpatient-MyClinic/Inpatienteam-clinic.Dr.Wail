
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
  const underProcessAnalysis = getDelayAnalysis("under process");
  const rejectedCancelledAnalysis = {
    total: getDelayAnalysis("rejected").total + getDelayAnalysis("cancelled").total,
    causes: {
      ...getDelayAnalysis("rejected").causes,
      ...Object.entries(getDelayAnalysis("cancelled").causes).reduce((acc, [key, value]) => {
        acc[key] = (acc[key] || 0) + value;
        return acc;
      }, {} as Record<string, number>)
    }
  };

  const DelayBreakdown = ({ title, analysis }: { title: string; analysis: { total: number; causes: Record<string, number> } }) => (
    <div className="flex-1 p-4 border rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-2 text-center">{title}</h4>
      <p className="text-2xl font-bold text-blue-600 mb-3 text-center">{analysis.total}</p>
      <div className="space-y-2">
        {["doctor", "insurance", "hospital", "patient"].map(cause => {
          const count = analysis.causes[cause] || 0;
          return (
            <div key={cause} className="flex items-center text-sm">
              <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                {count}
              </span>
              <span className="capitalize">{cause}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Loss Tree Analysis</CardTitle>
        <CardDescription>Breakdown of delay causes by status category</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <DelayBreakdown title="Pending" analysis={pendingAnalysis} />
        <DelayBreakdown title="Scheduled" analysis={scheduledAnalysis} />
        <DelayBreakdown title="Under Process" analysis={underProcessAnalysis} />
        <DelayBreakdown title="Rejected/Cancelled" analysis={rejectedCancelledAnalysis} />
      </CardContent>
    </Card>
  );
}
