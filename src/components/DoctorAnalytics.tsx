
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorRequest } from "@/hooks/useDoctorRequests";

interface DoctorAnalyticsProps {
  filteredRequests: DoctorRequest[];
  currentDoctorName: string;
}

export default function DoctorAnalytics({
  filteredRequests,
  currentDoctorName
}: DoctorAnalyticsProps) {
  const totalRequests = filteredRequests.length;
  const doneRequests = filteredRequests.filter(req => req.status === "Done").length;
  const rejectedRequests = filteredRequests.filter(req => req.status === "Rejected").length;
  
  const conversionRate = totalRequests > 0 ? ((doneRequests / totalRequests) * 100).toFixed(1) : "0";
  const approvalRate = totalRequests > 0 ? (((totalRequests - rejectedRequests) / totalRequests) * 100).toFixed(1) : "0";
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>Performance metrics for your requests</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
          <p className="text-4xl font-bold text-green-600">{conversionRate}%</p>
          <p className="text-sm text-gray-500">
            ({doneRequests} done / {totalRequests} total requests)
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Approval Rate</h3>
          <p className="text-4xl font-bold text-blue-600">{approvalRate}%</p>
          <p className="text-sm text-gray-500">
            ({totalRequests - rejectedRequests} approved / {totalRequests} total requests)
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Rejection Rate</h3>
          <p className="text-4xl font-bold text-red-600">{rejectionRate}%</p>
          <p className="text-sm text-gray-500">
            ({rejectedRequests} rejected / {totalRequests} total requests)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
