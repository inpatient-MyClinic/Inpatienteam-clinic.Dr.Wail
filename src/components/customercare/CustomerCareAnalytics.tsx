
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, MessageSquare, AlertCircle } from "lucide-react";

interface CustomerCareAnalyticsProps {
  monthlyNPS: number;
  ytdNPS: number;
  targetNPS: number;
  complaintsOpen: number;
  complaintsClosed: number;
}

export default function CustomerCareAnalytics({
  monthlyNPS,
  ytdNPS,
  targetNPS,
  complaintsOpen,
  complaintsClosed
}: CustomerCareAnalyticsProps) {
  const isMonthlyAboveTarget = monthlyNPS >= targetNPS;
  const isYTDAboveTarget = ytdNPS >= targetNPS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">NPS Score (Month)</CardTitle>
          {isMonthlyAboveTarget ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isMonthlyAboveTarget ? 'text-green-600' : 'text-red-600'}`}>
            {monthlyNPS}
          </div>
          <p className="text-xs text-muted-foreground">
            Target: {targetNPS}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">NPS Score (YTD)</CardTitle>
          {isYTDAboveTarget ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isYTDAboveTarget ? 'text-green-600' : 'text-red-600'}`}>
            {ytdNPS}
          </div>
          <p className="text-xs text-muted-foreground">
            Target: {targetNPS}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Complaints Closed</CardTitle>
          <MessageSquare className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{complaintsClosed}</div>
          <p className="text-xs text-muted-foreground">
            Successfully resolved
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Complaints Open</CardTitle>
          <AlertCircle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{complaintsOpen}</div>
          <p className="text-xs text-muted-foreground">
            Pending resolution
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
