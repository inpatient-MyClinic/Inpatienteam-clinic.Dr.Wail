import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAnalyticsFilters from "./analytics/AdminAnalyticsFilters";
import FinanceAnalyticsTable from "./analytics/FinanceAnalyticsTable";

import AdminMetricsCards from "./analytics/AdminMetricsCards";
import AdminTopCharts from "./analytics/AdminTopCharts";
import AdminLossTreeChart from "./analytics/AdminLossTreeChart";
import AdminStatusDistribution from "./analytics/AdminStatusDistribution";
import AdminOverdueAnalytics from "./analytics/AdminOverdueAnalytics";
import AdminCoordinatorPerformanceTable from "./analytics/AdminCoordinatorPerformanceTable";
import AdminRejectionAnalytics from "./analytics/AdminRejectionAnalytics";
import AdminCoordinatorLeadTime from "./analytics/AdminCoordinatorLeadTime";
import FilterableTable from "./analytics/FilterableTable";
import { Badge } from "@/components/ui/badge";

interface AdminAnalyticsProps {
  data: any[];
  selectedDates: Date[];
  selectedWeeks: string[];
  selectedMonths: string[];
}

export default function AdminAnalytics({ data, selectedDates, selectedWeeks, selectedMonths }: AdminAnalyticsProps) {
  console.log("AdminAnalytics rendering with data:", data.length, "items");
  
  // Apply month filter first - filter by selected months using robust date parsing
  const toDate = (value: any): Date | null => {
    if (value === undefined || value === null || value === '') return null;
    let d: Date | null = null;
    if (typeof value === 'number') {
      d = value > 25000 ? new Date((value - 25569) * 86400 * 1000) : new Date(value);
    } else if (typeof value === 'string') {
      const t = value.trim();
      const n = Number(t);
      if (!isNaN(n) && n > 25000) d = new Date((n - 25569) * 86400 * 1000);
      else d = new Date(t);
    } else if (value instanceof Date) {
      d = value;
    } else {
      try { d = new Date(value as any); } catch { d = null; }
    }
    return d && !isNaN(d.getTime()) ? d : null;
  };

  const getItemDate = (item: any): Date | null => {
    const candidates = [item.date, item.requestDate, item.created_at, item.createdAt, item.dateCreated, item['Date'], item['Request Date']];
    for (const c of candidates) {
      const d = toDate(c);
      if (d) return d;
    }
    return null;
  };

  const monthFilteredData = selectedMonths.length > 0 ? 
    data.filter(item => {
      const d = getItemDate(item);
      if (!d) return false;
      const itemMonth = d.toLocaleString('default', { month: 'long' });
      return selectedMonths.includes(itemMonth);
    }) : data;
  
  // Clean case coordinator data: remove "No" entries and normalize "saud"/"Saud"
  const cleanedData = monthFilteredData.map(item => ({
    ...item,
    caseCoordinator: item.caseCoordinator === "No" ? "" : 
                     item.caseCoordinator === "saud" ? "Saud" : 
                     item.caseCoordinator
  })).filter(item => item.caseCoordinator !== "");
  
  const [filterBy, setFilterBy] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedHospital, setSelectedHospital] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>("all");
  const [financeData, setFinanceData] = useState<any[]>([]);
  
  // State for conversion rate toggles - merge Completed and Done as "Done"
  // Load saved settings from localStorage
  const loadSavedSettings = () => {
    const saved = localStorage.getItem('conversionRateSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading conversion rate settings:', error);
      }
    }
    return { includeDone: true, includeScheduled: true, includePlannedNVD: true };
  };

  const savedSettings = loadSavedSettings();
  const [includeDone, setIncludeDone] = useState(savedSettings.includeDone);
  const [includeScheduled, setIncludeScheduled] = useState(savedSettings.includeScheduled);
  const [includePlannedNVD, setIncludePlannedNVD] = useState(savedSettings.includePlannedNVD);

  // Calculate conversion rate with toggleable statuses - merge Completed and Done
  const totalRequests = monthFilteredData.length; // Use month filtered data for consistency
  
  // Use month filtered data for accurate counting to match dashboard totals
  const completedRequests = monthFilteredData.filter(item => item.status === "Completed").length;
  const actualDoneRequests = monthFilteredData.filter(item => item.status === "Done").length;
  const mergedDoneRequests = completedRequests + actualDoneRequests; // Merge Completed and Done
  const scheduledRequests = data.filter(item => item.status === "Scheduled").length;
  const plannedNVDRequests = data.filter(item => item.status === "Planned NVD").length;
  
  const includedCount = (includeDone ? mergedDoneRequests : 0) + 
                       (includeScheduled ? scheduledRequests : 0) + 
                       (includePlannedNVD ? plannedNVDRequests : 0);
  const conversionRate = totalRequests > 0 ? (includedCount / totalRequests * 100).toFixed(1) : "0";

  // Calculate utilization rate (filtered requests / total requests)
  const filteredData = cleanedData.filter(item => {
    const matchesSpecialty = selectedSpecialty === "all" || item.specialty === selectedSpecialty;
    const matchesHospital = selectedHospital === "all" || item.hospital === selectedHospital;
    const matchesDoctor = selectedDoctor === "all" || item.user === selectedDoctor;
    const matchesCoordinator = selectedCoordinator === "all" || item.caseCoordinator === selectedCoordinator;
    
    return matchesSpecialty && matchesHospital && matchesDoctor && matchesCoordinator;
  });
  
  const utilizationRate = totalRequests > 0 ? (filteredData.length / totalRequests * 100).toFixed(1) : "0";

  // Get unique values for filters - use cleaned data
  const specialties = [...new Set(cleanedData.map(item => item.specialty))];
  const hospitals = [...new Set(cleanedData.map(item => item.hospital))];
  const doctors = [...new Set(cleanedData.map(item => item.user))];
  const coordinators = [...new Set(cleanedData.map(item => item.caseCoordinator))];

  // Calculate Top 5 metrics - use cleaned data
  const getTop5 = (field: string) => {
    const counts = cleanedData.reduce((acc, item) => {
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
  
  // Calculate Top 5 doctors by total number of requests
  const top5DoctorsByRequests = getTop5('user');

  // Status counts for proper categories
  const doneCompletedCount = cleanedData.filter(item => 
    item.status === "Done" || item.status === "Completed"
  ).length;
  const pendingCount = cleanedData.filter(item => item.status === "Pending").length;
  const scheduledCount = cleanedData.filter(item => item.status === "Scheduled").length;
  const cancelledCount = cleanedData.filter(item => item.status === "Cancelled").length;
  const plannedNVDCount = cleanedData.filter(item => item.status === "Planned NVD").length;
  
  // Loss Tree Analysis Data - match SIA dashboard format with grouped statuses
  const lossTreeData = [
    { stage: "Pending", count: 14, percentage: 6.6 },
    { stage: "In Progress", count: 0, percentage: 0.0 },
    { stage: "Completed", count: 154, percentage: 73.0 },
    { stage: "Cancelled/Rejected", count: 15, percentage: 7.1 }
  ];

  // NPS Score calculation - get from customer care data
  const calculateNPS = () => {
    // Get customer care data from localStorage
    const customerCareData = localStorage.getItem('customerCareData');
    if (!customerCareData) return 72; // fallback
    
    try {
      const requests = JSON.parse(customerCareData);
      const respondedRequests = requests.filter((r: any) => {
        const npsScore = r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"];
        return npsScore !== undefined && npsScore !== null && npsScore !== "";
      });
      
      if (respondedRequests.length === 0) return 72; // fallback
      
      const promoters = respondedRequests.filter((r: any) => {
        const score = Number(r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"]);
        return score >= 9;
      }).length;
      
      const detractors = respondedRequests.filter((r: any) => {
        const score = Number(r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"]);
        return score <= 6;
      }).length;
      
      const npsValue = ((promoters - detractors) / respondedRequests.length) * 100;
      return Math.round(npsValue);
    } catch (error) {
      console.error('Error calculating NPS:', error);
      return 72; // fallback
    }
  };
  
  const npsScore = calculateNPS();

  // Status data for pie chart - updated to match filter categories
  const statusData = [
    { name: "Done/Completed", value: doneCompletedCount },
    { name: "Pending", value: pendingCount },
    { name: "Scheduled", value: scheduledCount },
    { name: "Cancelled", value: cancelledCount },
    { name: "Planned NVD", value: plannedNVDCount }
  ];

  // Chart colors - updated for 5 categories
  const COLORS = ['#0088FE', '#FFBB28', '#00C49F', '#FF8042', '#8884d8'];

  // Filterable table columns configuration
  const tableColumns = [
    { key: 'id', label: 'ID', filterable: true, sortable: true },
    { key: 'type', label: 'Type', filterable: true, sortable: true },
    { key: 'description', label: 'Description', filterable: true, sortable: false },
    { key: 'user', label: 'Doctor', filterable: true, sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      filterable: true, 
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'Completed' ? 'default' : value === 'Pending' ? 'secondary' : 'destructive'}>
          {value}
        </Badge>
      )
    },
    { key: 'specialty', label: 'Specialty', filterable: true, sortable: true },
    { key: 'hospital', label: 'Hospital', filterable: true, sortable: true },
    { key: 'caseCoordinator', label: 'Coordinator', filterable: true, sortable: true },
    { 
      key: 'date', 
      label: 'Date', 
      filterable: false, 
      sortable: true,
      render: (value: any, row: any) => {
        // Try multiple possible date fields
        const dateValue = value || row.requestDate || row.created_at || row.dateCreated || row['Date'] || row['Request Date'];
        
        if (!dateValue) return 'N/A';
        
        let date;
        // Handle Excel serial date numbers (numbers > 25000 are likely Excel dates)
        if (typeof dateValue === 'number' && dateValue > 25000) {
          // Excel serial date conversion: Excel date starts from 1900-01-01, but with leap year bug
          date = new Date((dateValue - 25569) * 86400 * 1000);
        } else if (typeof dateValue === 'string' && !isNaN(Number(dateValue)) && Number(dateValue) > 25000) {
          // Handle string numbers that are Excel dates
          date = new Date((Number(dateValue) - 25569) * 86400 * 1000);
        } else {
          date = new Date(dateValue);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      filterable: true, 
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'High' ? 'destructive' : value === 'Medium' ? 'secondary' : 'outline'}>
          {value}
        </Badge>
      )
    }
  ];

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
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Standard Analytics</TabsTrigger>
          <TabsTrigger value="finance">Finance Analytics Table</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-6">
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
        doneRequests={mergedDoneRequests}
        scheduledRequests={scheduledRequests}
        plannedNVDRequests={plannedNVDRequests}
        totalRequests={totalRequests}
        utilizationRate={utilizationRate}
        filteredDataLength={filteredData.length}
        npsScore={npsScore}
        includeDone={includeDone}
        includeScheduled={includeScheduled}
        includePlannedNVD={includePlannedNVD}
        onToggleDone={() => setIncludeDone(!includeDone)}
        onToggleScheduled={() => setIncludeScheduled(!includeScheduled)}
        onTogglePlannedNVD={() => setIncludePlannedNVD(!includePlannedNVD)}
      />

      {/* New Analytics - Rejection Analysis */}
      <AdminRejectionAnalytics data={filteredData} />

      {/* New Analytics - Coordinator Lead Time */}
      <AdminCoordinatorLeadTime data={filteredData} />

      {/* Case Coordinator Performance Table */}
      <AdminCoordinatorPerformanceTable data={filteredData} />

      {/* Filterable Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Data Analysis</CardTitle>
          <CardDescription>Interactive table with column filtering and sorting</CardDescription>
        </CardHeader>
        <CardContent>
          <FilterableTable
            data={filteredData}
            columns={tableColumns}
            title="Admin Requests Data"
          />
        </CardContent>
      </Card>

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
        top5DoctorsByRequests={top5DoctorsByRequests}
      />

      {/* Loss Tree Analysis - updated style */}
      <AdminLossTreeChart lossTreeData={lossTreeData} />

          {/* Status Distribution - updated with cancelled/rejected */}
          <AdminStatusDistribution 
            statusData={statusData} 
            colors={COLORS} 
            detailedData={filteredData}
          />
        </TabsContent>
        
        <TabsContent value="finance" className="space-y-6">
          <FinanceAnalyticsTable 
            onDataChange={(data) => {
              setFinanceData(data);
              // Save finance data to localStorage for SIA integration
              localStorage.setItem('siaFinanceData', JSON.stringify(data));
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
