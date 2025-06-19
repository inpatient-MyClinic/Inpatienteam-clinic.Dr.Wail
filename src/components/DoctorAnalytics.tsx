
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DoctorAnalyticsProps {
  totalRequests: number;
  doneRequests: number;
  rejectedRequests: number;
  conversionRate: string;
  approvalRate: string;
  rejectionRate: string;
}

export default function DoctorAnalytics({
  totalRequests,
  doneRequests,
  rejectedRequests,
  conversionRate,
  approvalRate,
  rejectionRate
}: DoctorAnalyticsProps) {
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
