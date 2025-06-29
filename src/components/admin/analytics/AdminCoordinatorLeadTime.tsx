
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AdminCoordinatorLeadTimeProps {
  data: any[];
}

interface CoordinatorStats {
  totalCases: number;
  totalLeadTimeHours: number;
  completedCases: number;
  pendingCases: number;
  leadTimes: number[];
}

interface CoordinatorLeadTimeStats {
  coordinator: string;
  totalCases: number;
  completedCases: number;
  pendingCases: number;
  avgLeadTimeDays: number;
  medianLeadTimeDays: number;
  completionRate: string;
}

export default function AdminCoordinatorLeadTime({ data }: AdminCoordinatorLeadTimeProps) {
  // Calculate lead time for each coordinator
  const coordinatorLeadTimes = data.reduce((acc, item) => {
    const coordinator = item.caseCoordinator;
    if (!coordinator) return acc;

    const requestDate = new Date(item.requestDate || item.date);
    const completionDate = item.completionDate ? new Date(item.completionDate) : new Date();
    const leadTimeHours = Math.abs(completionDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60);
    const leadTimeDays = (leadTimeHours / 24).toFixed(1);

    if (!acc[coordinator]) {
      acc[coordinator] = {
        totalCases: 0,
        totalLeadTimeHours: 0,
        completedCases: 0,
        pendingCases: 0,
        leadTimes: []
      };
    }

    acc[coordinator].totalCases += 1;
    acc[coordinator].totalLeadTimeHours += leadTimeHours;
    acc[coordinator].leadTimes.push(leadTimeHours);

    if (item.status === 'Completed') {
      acc[coordinator].completedCases += 1;
    } else {
      acc[coordinator].pendingCases += 1;
    }

    return acc;
  }, {} as Record<string, CoordinatorStats>);

  // Calculate statistics for each coordinator
  const coordinatorStats: CoordinatorLeadTimeStats[] = Object.entries(coordinatorLeadTimes)
    .map(([coordinator, stats]) => {
      const avgLeadTimeHours = stats.totalLeadTimeHours / stats.totalCases;
      const avgLeadTimeDays = (avgLeadTimeHours / 24).toFixed(1);
      
      // Calculate median lead time
      const sortedLeadTimes = [...stats.leadTimes].sort((a, b) => a - b);
      const median = sortedLeadTimes.length % 2 === 0
        ? (sortedLeadTimes[sortedLeadTimes.length / 2 - 1] + sortedLeadTimes[sortedLeadTimes.length / 2]) / 2
        : sortedLeadTimes[Math.floor(sortedLeadTimes.length / 2)];
      const medianDays = (median / 24).toFixed(1);

      return {
        coordinator,
        totalCases: stats.totalCases,
        completedCases: stats.completedCases,
        pendingCases: stats.pendingCases,
        avgLeadTimeDays: parseFloat(avgLeadTimeDays),
        medianLeadTimeDays: parseFloat(medianDays),
        completionRate: ((stats.completedCases / stats.totalCases) * 100).toFixed(1)
      };
    })
    .sort((a, b) => b.avgLeadTimeDays - a.avgLeadTimeDays); // Sort by highest lead time first

  const getLeadTimeBadge = (days: number) => {
    if (days <= 1) return { variant: "default" as const, color: "green" };
    if (days <= 3) return { variant: "secondary" as const, color: "yellow" };
    return { variant: "destructive" as const, color: "red" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-blue-600">Coordinator Lead Time Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case Coordinator</TableHead>
              <TableHead className="text-center">Total Cases</TableHead>
              <TableHead className="text-center">Completed</TableHead>
              <TableHead className="text-center">Pending</TableHead>
              <TableHead className="text-center">Avg Lead Time</TableHead>
              <TableHead className="text-center">Median Lead Time</TableHead>
              <TableHead className="text-center">Completion Rate</TableHead>
              <TableHead className="text-center">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coordinatorStats.map((coordinator) => {
              const avgBadge = getLeadTimeBadge(coordinator.avgLeadTimeDays);
              const medianBadge = getLeadTimeBadge(coordinator.medianLeadTimeDays);
              
              return (
                <TableRow key={coordinator.coordinator}>
                  <TableCell className="font-medium">{coordinator.coordinator}</TableCell>
                  <TableCell className="text-center">{coordinator.totalCases}</TableCell>
                  <TableCell className="text-center">{coordinator.completedCases}</TableCell>
                  <TableCell className="text-center">{coordinator.pendingCases}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={avgBadge.variant}>
                      {coordinator.avgLeadTimeDays} days
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={medianBadge.variant}>
                      {coordinator.medianLeadTimeDays} days
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={parseFloat(coordinator.completionRate) > 80 ? "default" : "secondary"}>
                      {coordinator.completionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {coordinator.avgLeadTimeDays <= 1 ? (
                      <Badge variant="default" className="bg-green-500">Excellent</Badge>
                    ) : coordinator.avgLeadTimeDays <= 3 ? (
                      <Badge variant="secondary" className="bg-yellow-500">Good</Badge>
                    ) : (
                      <Badge variant="destructive">Needs Improvement</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
