
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";
import { isWithinInterval, parseISO, differenceInHours, isAfter, isBefore, setHours } from 'date-fns';

interface OverdueRequest {
  id: string;
  patientName: string;
  hospital: string;
  specialty: string;
  caseCoordinator: string;
  createdAt: string;
  coordinatorActionTime?: string;
  hoursOverdue: number;
}

interface AdminOverdueAnalyticsProps {
  data: any[];
}

function isOverdue(request: any): { isOverdue: boolean; hoursOverdue: number } {
  const createdAt = parseISO(request.date || request.createdAt);
  const workStart = setHours(createdAt, 10); // 10 AM
  const workEnd = setHours(createdAt, 20); // 8 PM
  
  // Check if request was created during work hours
  if (isAfter(createdAt, workStart) && isBefore(createdAt, workEnd)) {
    const actionTime = request.coordinatorActionTime ? parseISO(request.coordinatorActionTime) : null;
    const hoursFromCreation = differenceInHours(new Date(), createdAt);
    
    if (!actionTime) {
      // No action taken, check if 4 hours have passed
      const isRequestOverdue = hoursFromCreation > 4;
      return { isOverdue: isRequestOverdue, hoursOverdue: Math.max(0, hoursFromCreation - 4) };
    } else {
      // Action taken, check if it was within 4 hours
      const hoursToAction = differenceInHours(actionTime, createdAt);
      const isRequestOverdue = hoursToAction > 4;
      return { isOverdue: isRequestOverdue, hoursOverdue: Math.max(0, hoursToAction - 4) };
    }
  }
  return { isOverdue: false, hoursOverdue: 0 };
}

export default function AdminOverdueAnalytics({ data }: AdminOverdueAnalyticsProps) {
  // Calculate overdue requests
  const overdueRequests: OverdueRequest[] = data
    .map(request => {
      const { isOverdue: requestOverdue, hoursOverdue } = isOverdue(request);
      return {
        id: request.id,
        patientName: request.user || `Patient ${request.id}`,
        hospital: request.hospital,
        specialty: request.specialty,
        caseCoordinator: request.caseCoordinator,
        createdAt: request.date || request.createdAt,
        coordinatorActionTime: request.coordinatorActionTime,
        hoursOverdue,
        isOverdue: requestOverdue
      };
    })
    .filter(request => request.isOverdue);

  // Group by coordinator
  const overdueByCoordinator = overdueRequests.reduce((acc, request) => {
    const coordinator = request.caseCoordinator;
    if (!acc[coordinator]) {
      acc[coordinator] = [];
    }
    acc[coordinator].push(request);
    return acc;
  }, {} as Record<string, OverdueRequest[]>);

  // Group by hospital
  const overdueByHospital = overdueRequests.reduce((acc, request) => {
    const hospital = request.hospital;
    if (!acc[hospital]) {
      acc[hospital] = 0;
    }
    acc[hospital]++;
    return acc;
  }, {} as Record<string, number>);

  const totalOverdue = overdueRequests.length;
  const averageOverdueHours = overdueRequests.length > 0 
    ? (overdueRequests.reduce((sum, req) => sum + req.hoursOverdue, 0) / overdueRequests.length).toFixed(1)
    : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overdue Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Overdue Requests Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium">Total Overdue</span>
              <span className="text-2xl font-bold text-red-600">{totalOverdue}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium">Average Hours Overdue</span>
              <span className="text-xl font-bold text-orange-600">{averageOverdueHours}h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue by Coordinator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Overdue by Coordinator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(overdueByCoordinator).map(([coordinator, requests]) => (
              <div key={coordinator} className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm font-medium">{coordinator}</span>
                <span className="text-lg font-bold text-red-600">{requests.length}</span>
              </div>
            ))}
            {Object.keys(overdueByCoordinator).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No overdue requests</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overdue by Hospital */}
      <Card>
        <CardHeader>
          <CardTitle>Overdue by Hospital</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(overdueByHospital)
              .sort((a, b) => b[1] - a[1])
              .map(([hospital, count]) => (
                <div key={hospital} className="flex justify-between items-center p-2 border rounded">
                  <span className="text-sm font-medium">{hospital}</span>
                  <span className="text-lg font-bold text-red-600">{count}</span>
                </div>
              ))}
            {Object.keys(overdueByHospital).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No overdue requests</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Most Overdue Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Most Overdue Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {overdueRequests
              .sort((a, b) => b.hoursOverdue - a.hoursOverdue)
              .slice(0, 5)
              .map((request) => (
                <div key={request.id} className="p-3 border rounded-lg bg-red-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{request.patientName}</p>
                      <p className="text-xs text-gray-600">{request.hospital}</p>
                      <p className="text-xs text-gray-600">{request.caseCoordinator}</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      {request.hoursOverdue.toFixed(1)}h
                    </span>
                  </div>
                </div>
              ))}
            {overdueRequests.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No overdue requests</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
