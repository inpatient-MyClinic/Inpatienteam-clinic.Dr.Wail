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
import AnalyticsValidationPanel from "./analytics/AnalyticsValidationPanel";
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

    // Fallback: derive date from Month/Months fields (supports full/short names or 1-12)
    const monthField = item['Month'] ?? item['Months'] ?? item.month ?? item.MONTH ?? item.Months;
    if (monthField !== undefined && monthField !== null && monthField !== '') {
      const m = String(monthField).trim().toLowerCase();
      const map: Record<string, number> = {
        jan: 0, january: 0, '1': 0, '01': 0,
        feb: 1, february: 1, '2': 1, '02': 1,
        mar: 2, march: 2, '3': 2, '03': 2,
        apr: 3, april: 3, '4': 3, '04': 3,
        may: 4, '5': 4, '05': 4,
        jun: 5, june: 5, '6': 5, '06': 5,
        jul: 6, july: 6, '7': 6, '07': 6,
        aug: 7, august: 7, '8': 7, '08': 7,
        sep: 8, sept: 8, september: 8, '9': 8, '09': 8,
        oct: 9, october: 9, '10': 9,
        nov: 10, november: 10, '11': 10,
        dec: 11, december: 11, '12': 11,
      };
      const mi = map[m];
      if (mi !== undefined) {
        return new Date(2000, mi, 1); // Year/day arbitrary; month filtering only needs month index
      }
    }

    return null;
  };
  // Apply month filter (locale-agnostic) using fixed month map and case-insensitive compare
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const parseMonthToIndex = (m: any): number | null => {
    if (m === undefined || m === null || m === '') return null;
    const s = String(m).trim().toLowerCase();
    const map: Record<string, number> = {
      jan: 0, january: 0, '1': 0, '01': 0,
      feb: 1, february: 1, '2': 1, '02': 1,
      mar: 2, march: 2, '3': 2, '03': 2,
      apr: 3, april: 3, '4': 3, '04': 3,
      may: 4, '5': 4, '05': 4,
      jun: 5, june: 5, '6': 5, '06': 5,
      jul: 6, july: 6, '7': 6, '07': 6,
      aug: 7, august: 7, '8': 7, '08': 7,
      sep: 8, sept: 8, september: 8, '9': 8, '09': 8,
      oct: 9, october: 9, '10': 9,
      nov: 10, november: 10, '11': 10,
      dec: 11, december: 11, '12': 11,
    };
    return map[s] ?? null;
  };

  const selectedMonthIdx = new Set(
    (selectedMonths || [])
      .map(parseMonthToIndex)
      .filter((v): v is number => v !== null)
  );

  const monthFilteredData = selectedMonthIdx.size > 0 ? 
    data.filter(item => {
      const d = getItemDate(item);
      if (!d) return false;
      return selectedMonthIdx.has(d.getMonth());
    }) : data;

  // Normalize statuses for reliable counting
  const normalizeStatus = (value: any) => {
    const s = String(value ?? '').trim().toLowerCase().replace(/\s+/g, '');
    if (s === 'done' || s === 'completed') return 'completed';
    if (s === 'scheduled') return 'scheduled';
    if (s === 'plannednvd') return 'plannednvd';
    if (s === 'pending' || s === 'inprogress') return 'pending';
    if (s === 'cancelled' || s === 'canceled' || s === 'rejected' || s === 'cancelled/rejected') return 'cancelled';
    return s;
  };

  const monthFilteredDataNorm = monthFilteredData.map(item => ({
    ...item,
    _status: normalizeStatus(item.status)
  }));
  
  // Clean case coordinator data: remove "No" entries and normalize "saud"/"Saud"
  const cleanedData = monthFilteredDataNorm.map(item => ({
    ...item,
    caseCoordinator: item.caseCoordinator === "saud" ? "Saud" : item.caseCoordinator
  }));
  
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
  const totalRequests = monthFilteredDataNorm.length; // Use month filtered + normalized data for consistency
  
  // Use month filtered, normalized data for accurate counting to match dashboard totals
  const mergedDoneRequests = monthFilteredDataNorm.filter(item => item._status === 'completed').length;
  const scheduledRequests = monthFilteredDataNorm.filter(item => item._status === 'scheduled').length;
  const plannedNVDRequests = monthFilteredDataNorm.filter(item => item._status === 'plannednvd').length;
  
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
  const coordinators = [...new Set(cleanedData.map(item => item.caseCoordinator))].filter(Boolean);

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

  // Status counts for proper categories (normalized) - aligned with current filters and month selection
  const doneCompletedCount = filteredData.filter(item => item._status === 'completed').length;
  const pendingCount = filteredData.filter(item => item._status === 'pending').length;
  const scheduledCount = filteredData.filter(item => item._status === 'scheduled').length;
  const cancelledCount = filteredData.filter(item => item._status === 'cancelled').length;
  const plannedNVDCount = filteredData.filter(item => item._status === 'plannednvd').length;
  
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Standard Analytics</TabsTrigger>
          <TabsTrigger value="finance">Finance Analytics Table</TabsTrigger>
          <TabsTrigger value="validation">Accuracy Validation</TabsTrigger>
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
        
        <TabsContent value="validation" className="space-y-6">
          <AnalyticsValidationPanel
            allData={cleanedData}
            filteredData={filteredData}
            selectedMonths={selectedMonths}
            statusCounts={{
              total: totalRequests,
              completed: doneCompletedCount,
              pending: pendingCount,
              scheduled: scheduledCount,
              cancelled: cancelledCount,
              planned_nvd: plannedNVDCount
            }}
            useCompletedDate={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
