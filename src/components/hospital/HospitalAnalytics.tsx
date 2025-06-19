
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckCircle, XCircle } from "lucide-react";

interface HospitalAnalyticsProps {
  conversionRate: string;
  approvalRate: string;
  rejectionRate: string;
  doneRequests: number;
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export default function HospitalAnalytics({
  conversionRate,
  approvalRate,
  rejectionRate,
  doneRequests,
  totalRequests,
  approvedRequests,
  rejectedRequests
}: HospitalAnalyticsProps) {
  return (
    <>
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {doneRequests} of {totalRequests} requests completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {approvedRequests} of {totalRequests} requests approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {rejectedRequests} of {totalRequests} requests rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hospital Lead Time Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Hospital Lead Time Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">8.5</div>
                <div className="text-sm text-gray-600">Average Lead Time (days)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-sm text-gray-600">On-Time Performance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">15%</div>
                <div className="text-sm text-gray-600">Delayed Requests</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
