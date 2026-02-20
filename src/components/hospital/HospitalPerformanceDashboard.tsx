
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, CheckCircle, XCircle, Clock, Target, Activity, BarChart3 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

interface HospitalPerformanceDashboardProps {
  requests: any[];
  hospitalName: string;
}

export default function HospitalPerformanceDashboard({ requests, hospitalName }: HospitalPerformanceDashboardProps) {
  const metrics = useMemo(() => {
    const total = requests.length;
    const done = requests.filter(r => r.status === "Done").length;
    const approved = requests.filter(r => r.status === "Approved").length;
    const rejected = requests.filter(r => r.status === "Rejected").length;
    const pending = requests.filter(r => r.status === "Pending").length;
    const delayed = requests.filter(r => r.isDelayed).length;

    const conversionRate = total > 0 ? ((done / total) * 100).toFixed(1) : "0";
    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : "0";
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : "0";
    const delayRate = total > 0 ? ((delayed / total) * 100).toFixed(1) : "0";

    // Calculate average lead time (days between creation and done)
    const completedRequests = requests.filter(r => r.status === "Done" && r.createdAt);
    let avgLeadTime = 0;
    if (completedRequests.length > 0) {
      const totalDays = completedRequests.reduce((sum, r) => {
        try {
          const created = parseISO(r.createdAt);
          const completed = r.completedAt ? parseISO(r.completedAt) : new Date();
          return sum + Math.max(differenceInDays(completed, created), 1);
        } catch { return sum + 1; }
      }, 0);
      avgLeadTime = Math.round(totalDays / completedRequests.length);
    }

    // KPIs
    const kpis = [
      { label: "Statement Issuance", target: 5, actual: avgLeadTime, unit: "days" },
      { label: "Payment Completion", target: 42, actual: Math.round(avgLeadTime * 1.5), unit: "days" },
    ];

    // By specialty breakdown
    const specialties: Record<string, { total: number; done: number; approved: number; rejected: number }> = {};
    requests.forEach(r => {
      const spec = r.specialty || "General";
      if (!specialties[spec]) specialties[spec] = { total: 0, done: 0, approved: 0, rejected: 0 };
      specialties[spec].total++;
      if (r.status === "Done") specialties[spec].done++;
      if (r.status === "Approved") specialties[spec].approved++;
      if (r.status === "Rejected") specialties[spec].rejected++;
    });

    return { total, done, approved, rejected, pending, delayed, conversionRate, approvalRate, rejectionRate, delayRate, avgLeadTime, kpis, specialties };
  }, [requests]);

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Dashboard — {hospitalName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="text-center p-4">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{metrics.conversionRate}%</div>
              <div className="text-xs text-muted-foreground">Conversion Rate</div>
              <div className="text-xs text-muted-foreground">{metrics.done}/{metrics.total}</div>
            </Card>
            <Card className="text-center p-4">
              <CheckCircle className="h-5 w-5 mx-auto mb-1 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{metrics.approvalRate}%</div>
              <div className="text-xs text-muted-foreground">Approval Rate</div>
              <div className="text-xs text-muted-foreground">{metrics.approved}/{metrics.total}</div>
            </Card>
            <Card className="text-center p-4">
              <XCircle className="h-5 w-5 mx-auto mb-1 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{metrics.rejectionRate}%</div>
              <div className="text-xs text-muted-foreground">Rejection Rate</div>
              <div className="text-xs text-muted-foreground">{metrics.rejected}/{metrics.total}</div>
            </Card>
            <Card className="text-center p-4">
              <Clock className="h-5 w-5 mx-auto mb-1 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{metrics.avgLeadTime}</div>
              <div className="text-xs text-muted-foreground">Avg Lead Time (days)</div>
            </Card>
            <Card className="text-center p-4">
              <Activity className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">{metrics.delayRate}%</div>
              <div className="text-xs text-muted-foreground">Delay Rate</div>
              <div className="text-xs text-muted-foreground">{metrics.delayed}/{metrics.total}</div>
            </Card>
            <Card className="text-center p-4">
              <Target className="h-5 w-5 mx-auto mb-1 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">{metrics.pending}</div>
              <div className="text-xs text-muted-foreground">Pending Cases</div>
            </Card>
          </div>

          {/* KPI Targets */}
          <div>
            <h3 className="text-sm font-semibold mb-3">KPI Targets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.kpis.map((kpi, i) => {
                const onTarget = kpi.actual <= kpi.target;
                return (
                  <Card key={i} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{kpi.label}</div>
                        <div className="text-xs text-muted-foreground">Target: ≤ {kpi.target} {kpi.unit}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${onTarget ? "text-green-600" : "text-red-600"}`}>
                          {kpi.actual} {kpi.unit}
                        </div>
                        <Badge className={onTarget ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {onTarget ? "On Target" : "Behind"}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Specialty Breakdown */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Performance by Specialty</h3>
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead>Specialty</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Done</TableHead>
                    <TableHead className="text-center">Approved</TableHead>
                    <TableHead className="text-center">Rejected</TableHead>
                    <TableHead className="text-center">Conversion %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(metrics.specialties).map(([spec, data]) => (
                    <TableRow key={spec}>
                      <TableCell className="font-medium">{spec}</TableCell>
                      <TableCell className="text-center">{data.total}</TableCell>
                      <TableCell className="text-center text-green-600">{data.done}</TableCell>
                      <TableCell className="text-center text-blue-600">{data.approved}</TableCell>
                      <TableCell className="text-center text-red-600">{data.rejected}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={data.total > 0 && (data.done / data.total) >= 0.5 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {data.total > 0 ? ((data.done / data.total) * 100).toFixed(0) : 0}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {Object.keys(metrics.specialties).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
