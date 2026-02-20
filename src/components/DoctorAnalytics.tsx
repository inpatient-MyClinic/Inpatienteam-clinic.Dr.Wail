
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorRequest } from "@/hooks/useDoctorRequests";

interface DoctorAnalyticsProps {
  filteredRequests: DoctorRequest[];
  currentDoctorName: string;
}

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function DoctorAnalytics({
  filteredRequests,
  currentDoctorName
}: DoctorAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");
  const [selectedHospital, setSelectedHospital] = useState("all");

  // Only show the current doctor's own requests
  const doctorRequests = useMemo(() => {
    return filteredRequests.filter(req => {
      const matchesDoctor = !currentDoctorName || currentDoctorName === "Doctor" || 
        req.assignedDoctor?.toLowerCase() === currentDoctorName.toLowerCase() ||
        req.assignedDoctorValue?.toLowerCase() === currentDoctorName.toLowerCase();
      return matchesDoctor;
    });
  }, [filteredRequests, currentDoctorName]);

  const hospitals = useMemo(() => [...new Set(doctorRequests.map(r => r.hospital).filter(Boolean))].sort(), [doctorRequests]);

  const filtered = useMemo(() => {
    let data = doctorRequests;
    if (selectedHospital !== "all") data = data.filter(r => r.hospital === selectedHospital);
    if (selectedPeriod !== "ytd") {
      const monthIdx = months.indexOf(selectedPeriod);
      if (monthIdx >= 0) {
        data = data.filter(r => {
          const d = new Date(r.createdAt);
          return d.getMonth() === monthIdx;
        });
      }
    }
    return data;
  }, [doctorRequests, selectedHospital, selectedPeriod]);

  const totalRequests = filtered.length;
  const doneRequests = filtered.filter(req => req.status === "Done").length;
  const rejectedRequests = filtered.filter(req => req.status === "Rejected").length;
  
  const conversionRate = totalRequests > 0 ? ((doneRequests / totalRequests) * 100).toFixed(1) : "0";
  const approvalRate = totalRequests > 0 ? (((totalRequests - rejectedRequests) / totalRequests) * 100).toFixed(1) : "0";
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
        <CardDescription>Your performance metrics — {currentDoctorName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-6">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">Year to Date</SelectItem>
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hospitals</SelectItem>
              {hospitals.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
            <p className="text-4xl font-bold text-green-600">{conversionRate}%</p>
            <p className="text-sm text-muted-foreground">
              ({doneRequests} done / {totalRequests} total requests)
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Approval Rate</h3>
            <p className="text-4xl font-bold text-blue-600">{approvalRate}%</p>
            <p className="text-sm text-muted-foreground">
              ({totalRequests - rejectedRequests} approved / {totalRequests} total)
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Rejection Rate</h3>
            <p className="text-4xl font-bold text-red-600">{rejectionRate}%</p>
            <p className="text-sm text-muted-foreground">
              ({rejectedRequests} rejected / {totalRequests} total)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
