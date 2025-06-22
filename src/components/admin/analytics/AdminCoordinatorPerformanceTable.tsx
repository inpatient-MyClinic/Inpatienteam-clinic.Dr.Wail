
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminCoordinatorPerformanceTableProps {
  data: any[];
}

export default function AdminCoordinatorPerformanceTable({ data }: AdminCoordinatorPerformanceTableProps) {
  // Get unique coordinators from the data
  const coordinators = [...new Set(data.map(item => item.caseCoordinator).filter(Boolean))];
  
  // Calculate metrics for each coordinator
  const coordinatorMetrics = coordinators.map((coordinator, index) => {
    const coordinatorRequests = data.filter(item => item.caseCoordinator === coordinator);
    const completedRequests = coordinatorRequests.filter(item => item.status === "Completed");
    
    const receivedCases = coordinatorRequests.length;
    const completedCases = completedRequests.length;
    const conversionRate = receivedCases > 0 ? ((completedCases / receivedCases) * 100).toFixed(1) : "0";
    
    // Calculate utilization rate (coordinator's cases / total assigned cases)
    const totalAssignedCases = data.filter(item => item.caseCoordinator).length;
    const utilizationRate = totalAssignedCases > 0 ? ((receivedCases / totalAssignedCases) * 100).toFixed(1) : "0";
    
    return {
      no: index + 1,
      name: coordinator,
      utilizationRate: parseFloat(utilizationRate),
      conversionRate: parseFloat(conversionRate),
      receivedCases,
      completedCases
    };
  });

  // Calculate totals
  const totals = {
    utilizationRate: coordinatorMetrics.reduce((sum, coord) => sum + coord.utilizationRate, 0),
    conversionRate: coordinatorMetrics.length > 0 ? 
      (coordinatorMetrics.reduce((sum, coord) => sum + coord.conversionRate, 0) / coordinatorMetrics.length).toFixed(1) : "0",
    receivedCases: coordinatorMetrics.reduce((sum, coord) => sum + coord.receivedCases, 0),
    completedCases: coordinatorMetrics.reduce((sum, coord) => sum + coord.completedCases, 0)
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Coordinator Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No.</TableHead>
              <TableHead>Case Coordinator</TableHead>
              <TableHead className="text-center">Utilization Rate (%)</TableHead>
              <TableHead className="text-center">Conversion Rate (%)</TableHead>
              <TableHead className="text-center">Cases Received</TableHead>
              <TableHead className="text-center">Cases Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coordinatorMetrics.map((coordinator) => (
              <TableRow key={coordinator.name}>
                <TableCell className="font-medium">{coordinator.no}</TableCell>
                <TableCell>{coordinator.name}</TableCell>
                <TableCell className="text-center">{coordinator.utilizationRate}%</TableCell>
                <TableCell className="text-center">{coordinator.conversionRate}%</TableCell>
                <TableCell className="text-center">{coordinator.receivedCases}</TableCell>
                <TableCell className="text-center">{coordinator.completedCases}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-50 font-semibold">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-center">{totals.utilizationRate.toFixed(1)}%</TableCell>
              <TableCell className="text-center">{totals.conversionRate}%</TableCell>
              <TableCell className="text-center">{totals.receivedCases}</TableCell>
              <TableCell className="text-center">{totals.completedCases}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
