
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminMetricsCardsProps {
  conversionRate: string;
  doneRequests: number;
  scheduledRequests: number;
  plannedNVDRequests: number;
  totalRequests: number;
  utilizationRate: string;
  filteredDataLength: number;
  npsScore: number;
  includeDone: boolean;
  includeScheduled: boolean;
  includePlannedNVD: boolean;
  onToggleDone: () => void;
  onToggleScheduled: () => void;
  onTogglePlannedNVD: () => void;
}

export default function AdminMetricsCards({
  conversionRate,
  doneRequests,
  scheduledRequests,
  plannedNVDRequests,
  totalRequests,
  utilizationRate,
  filteredDataLength,
  npsScore,
  includeDone,
  includeScheduled,
  includePlannedNVD,
  onToggleDone,
  onToggleScheduled,
  onTogglePlannedNVD
}: AdminMetricsCardsProps) {
  const includedCount = (includeDone ? doneRequests : 0) + 
                       (includeScheduled ? scheduledRequests : 0) + 
                       (includePlannedNVD ? plannedNVDRequests : 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground mb-2">
            {includedCount} of {totalRequests} requests
          </p>
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant={includeDone ? "default" : "outline"} 
              className="cursor-pointer text-xs"
              onClick={onToggleDone}
            >
              Done ({doneRequests})
            </Badge>
            <Badge 
              variant={includeScheduled ? "default" : "outline"} 
              className="cursor-pointer text-xs"
              onClick={onToggleScheduled}
            >
              Scheduled ({scheduledRequests})
            </Badge>
            <Badge 
              variant={includePlannedNVD ? "default" : "outline"} 
              className="cursor-pointer text-xs"
              onClick={onTogglePlannedNVD}
            >
              Planned NVD ({plannedNVDRequests})
            </Badge>
          </div>
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
