
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, MessageSquare, AlertCircle } from "lucide-react";

interface CustomerCareAnalyticsProps {
  monthlyNPS: number;
  ytdNPS: number;
  targetNPS: number;
  complaintsOpen: number;
  complaintsClosed: number;
  averageLeadTime?: number;
  monthlyNPSBreakdown?: { [key: string]: number };
  onComplaintFilter: (status: 'open' | 'closed' | null) => void;
  activeComplaintFilter: 'open' | 'closed' | null;
}

export default function CustomerCareAnalytics({
  monthlyNPS,
  ytdNPS,
  targetNPS,
  complaintsOpen,
  complaintsClosed,
  averageLeadTime,
  monthlyNPSBreakdown,
  onComplaintFilter,
  activeComplaintFilter
}: CustomerCareAnalyticsProps) {
  const isMonthlyAboveTarget = monthlyNPS >= targetNPS;
  const isYTDAboveTarget = ytdNPS >= targetNPS;

  return (
    <div className="space-y-6 mt-6">
      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score (Month)</CardTitle>
            {isMonthlyAboveTarget ? (
              <TrendingUp className="h-4 w-4 text-blue-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isMonthlyAboveTarget ? 'text-blue-600' : 'text-red-600'}`}>
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
              <TrendingUp className="h-4 w-4 text-blue-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isYTDAboveTarget ? 'text-blue-600' : 'text-red-600'}`}>
              {ytdNPS}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {targetNPS}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            activeComplaintFilter === 'closed' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => onComplaintFilter(activeComplaintFilter === 'closed' ? null : 'closed')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complaints Closed</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{complaintsClosed}</div>
            <p className="text-xs text-muted-foreground">
              {averageLeadTime ? `Avg. ${averageLeadTime}h lead time` : 'Successfully resolved'}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            activeComplaintFilter === 'open' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => onComplaintFilter(activeComplaintFilter === 'open' ? null : 'open')}
        >
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

      {/* Monthly NPS Breakdown */}
      {monthlyNPSBreakdown && Object.keys(monthlyNPSBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">NPS Score by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(monthlyNPSBreakdown).map(([month, score]) => (
                <div key={month} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">{month}</div>
                  <div className={`text-xl font-bold ${score >= targetNPS ? 'text-blue-600' : 'text-red-600'}`}>
                    {score}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
