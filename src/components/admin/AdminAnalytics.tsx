
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminAnalyticsFilters from "./analytics/AdminAnalyticsFilters";
import AdminMetricsCards from "./analytics/AdminMetricsCards";
import AdminTopCharts from "./analytics/AdminTopCharts";
import AdminLossTreeChart from "./analytics/AdminLossTreeChart";
import AdminStatusDistribution from "./analytics/AdminStatusDistribution";
import AdminOverdueAnalytics from "./analytics/AdminOverdueAnalytics";

interface AdminAnalyticsProps {
  data: any[];
  selectedDates: Date[];
  selectedWeeks: string[];
  selectedMonths: string[];
}

export default function AdminAnalytics({ data, selectedDates, selectedWeeks, selectedMonths }: AdminAnalyticsProps) {
  console.log("AdminAnalytics rendering with data:", data.length, "items");
  
  const [filterBy, setFilterBy] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedHospital, setSelectedHospital] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>("all");

  // Calculate conversion rate (completed requests / total requests)
  const totalRequests = data.length;
  const completedRequests = data.filter(item => item.status === "Completed").length;
  const conversionRate = totalRequests > 0 ? (completedRequests / totalRequests * 100).toFixed(1) : "0";

  // Calculate utilization rate (filtered requests / total requests)
  const filteredData = data.filter(item => {
    const matchesSpecialty = selectedSpecialty === "all" || item.specialty === selectedSpecialty;
    const matchesHospital = selectedHospital === "all" || item.hospital === selectedHospital;
    const matchesDoctor = selectedDoctor === "all" || item.user === selectedDoctor;
    const matchesCoordinator = selectedCoordinator === "all" || item.caseCoordinator === selectedCoordinator;
    
    return matchesSpecialty && matchesHospital && matchesDoctor && matchesCoordinator;
  });
  
  const utilizationRate = totalRequests > 0 ? (filteredData.length / totalRequests * 100).toFixed(1) : "0";

  // Get unique values for filters
  const specialties = [...new Set(data.map(item => item.specialty))];
  const hospitals = [...new Set(data.map(item => item.hospital))];
  const doctors = [...new Set(data.map(item => item.user))];
  const coordinators = [...new Set(data.map(item => item.caseCoordinator))];

  // Calculate Top 5 metrics
  const getTop5 = (field: string) => {
    const counts = data.reduce((acc, item) => {
      const value = item[field];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count: count as number }));
  };

  const top5Specialties = getTop5('specialty');
  const top5Hospitals = getTop5('hospital');
  const top5Doctors = getTop5('user');

  // Loss Tree Analysis Data - updated to match case coordinator style
  const pendingCount = data.filter(item => item.status === "Pending").length;
  const inProgressCount = data.filter(item => item.status === "In Progress").length;
  const cancelledRejectedCount = data.filter(item => 
    item.status === "Cancelled" || item.status === "Rejected"
  ).length;
  
  const lossTreeData = [
    { stage: "Pending", count: pendingCount, percentage: totalRequests > 0 ? Number((pendingCount / totalRequests * 100).toFixed(1)) : 0 },
    { stage: "In Progress", count: inProgressCount, percentage: totalRequests > 0 ? Number((inProgressCount / totalRequests * 100).toFixed(1)) : 0 },
    { stage: "Completed", count: completedRequests, percentage: totalRequests > 0 ? Number((completedRequests / totalRequests * 100).toFixed(1)) : 0 },
    { stage: "Cancelled/Rejected", count: cancelledRejectedCount, percentage: totalRequests > 0 ? Number((cancelledRejectedCount / totalRequests * 100).toFixed(1)) : 0 }
  ];

  // NPS Score calculation (simulated)
  const npsScore = 72;

  // Status data for pie chart - updated to include cancelled/rejected
  const statusData = [
    { name: "Completed", value: completedRequests },
    { name: "In Progress", value: inProgressCount },
    { name: "Pending", value: pendingCount },
    { name: "Cancelled/Rejected", value: cancelledRejectedCount }
  ];

  // Chart colors - updated for 4 categories
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>No admin data found for analytics</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Filters */}
      <AdminAnalyticsFilters
        filterBy={filterBy}
        selectedSpecialty={selectedSpecialty}
        selectedHospital={selectedHospital}
        selectedDoctor={selectedDoctor}
        selectedCoordinator={selectedCoordinator}
        specialties={specialties}
        hospitals={hospitals}
        doctors={doctors}
        coordinators={coordinators}
        onFilterByChange={setFilterBy}
        onSpecialtyChange={setSelectedSpecialty}
        onHospitalChange={setSelectedHospital}
        onDoctorChange={setSelectedDoctor}
        onCoordinatorChange={setSelectedCoordinator}
      />

      {/* Key Metrics */}
      <AdminMetricsCards
        conversionRate={conversionRate}
        completedRequests={completedRequests}
        totalRequests={totalRequests}
        utilizationRate={utilizationRate}
        filteredDataLength={filteredData.length}
        npsScore={npsScore}
      />

      {/* Overdue Requests Analytics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-red-600">Overdue Request Analysis</h3>
        <AdminOverdueAnalytics data={filteredData} />
      </div>

      {/* Top 5 Charts - now as vertical lists */}
      <AdminTopCharts
        top5Specialties={top5Specialties}
        top5Hospitals={top5Hospitals}
        top5Doctors={top5Doctors}
      />

      {/* Loss Tree Analysis - updated style */}
      <AdminLossTreeChart lossTreeData={lossTreeData} />

      {/* Status Distribution - updated with cancelled/rejected */}
      <AdminStatusDistribution statusData={statusData} colors={COLORS} />
    </div>
  );
}
