
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminMetricsCardsProps {
  conversionRate: string;
  completedRequests: number;
  totalRequests: number;
  utilizationRate: string;
  filteredDataLength: number;
  npsScore: number;
}

export default function AdminMetricsCards({
  conversionRate,
  completedRequests,
  totalRequests,
  utilizationRate,
  filteredDataLength,
  npsScore
}: AdminMetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {completedRequests} of {totalRequests} requests completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{utilizationRate}%</div>
          <p className="text-xs text-muted-foreground">
            {filteredDataLength} of {totalRequests} requests match filters
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{npsScore}</div>
          <p className="text-xs text-muted-foreground">
            Net Promoter Score
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{totalRequests}</div>
          <p className="text-xs text-muted-foreground">
            All time requests
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
