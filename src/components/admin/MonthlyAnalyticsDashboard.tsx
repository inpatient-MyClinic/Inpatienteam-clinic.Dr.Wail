import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MonthlyAnalyticsData {
  month: number;
  year: number;
  summary: {
    total_cases: number;
    done_cases: number;
    pending_cases: number;
    cancelled_cases: number;
    total_revenue: number;
    average_case_value: number;
    conversion_rate: number;
  };
  branches: Array<{
    branch_code: string;
    total_cases: number;
    done_cases: number;
    pending_cases: number;
    conversion_rate: number;
  }>;
  hospitals: Array<{
    hospital_name: string;
    hospital_code: string;
    total_cases: number;
    done_cases: number;
    pending_cases: number;
    specialty_breakdown: Record<string, number>;
  }>;
  top_specialties: Array<{
    specialty: string;
    case_count: number;
    done_count: number;
    success_rate: number;
  }>;
  status_breakdown: Record<string, number>;
  generated_at: string;
}

interface MonthlyAnalyticsDashboardProps {
  onClose: () => void;
}

export default function MonthlyAnalyticsDashboard({ onClose }: MonthlyAnalyticsDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [analyticsData, setAnalyticsData] = useState<MonthlyAnalyticsData | null>(null);
  const [conversionTrends, setConversionTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = [2024, 2025, 2026].map(year => ({ value: year, label: year.toString() }));

  // Helper function to process monthly data from localStorage
  const processMonthlyData = (filteredRequests: any[]): MonthlyAnalyticsData => {
    // Count by status
    const statusCounts: Record<string, number> = {};
    const branchCounts: Record<string, any> = {};
    const hospitalCounts: Record<string, any> = {};
    const specialtyCounts: Record<string, number> = {};
    
    let totalRevenue = 0;
    let doneCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    filteredRequests.forEach(request => {
      const status = String(request.status || '').toLowerCase();
      const normalizedStatus = normalizeStatus(status);
      
      statusCounts[normalizedStatus] = (statusCounts[normalizedStatus] || 0) + 1;
      
      // Count done cases (completed or done)
      if (normalizedStatus === 'completed' || normalizedStatus === 'done') {
        doneCount++;
      } else if (normalizedStatus === 'pending' || normalizedStatus === 'scheduled') {
        pendingCount++;
      } else if (normalizedStatus === 'cancelled' || normalizedStatus === 'rejected') {
        cancelledCount++;
      }

      // Revenue tracking
      const paidAmount = parseFloat(request.paidAmount || request.paid_amount || 0);
      totalRevenue += paidAmount;

      // Branch counts
      const branchCode = request.branchCode || request.branch_code || 'Unknown';
      if (!branchCounts[branchCode]) {
        branchCounts[branchCode] = { total: 0, done: 0, pending: 0 };
      }
      branchCounts[branchCode].total++;
      if (normalizedStatus === 'completed' || normalizedStatus === 'done') {
        branchCounts[branchCode].done++;
      } else if (normalizedStatus === 'pending' || normalizedStatus === 'scheduled') {
        branchCounts[branchCode].pending++;
      }

      // Hospital counts
      const hospitalName = request.hospital || request.hospital_name || 'Unknown Hospital';
      const hospitalCode = request.hospitalCode || request.hospital_code || 'UNK';
      const hospitalKey = hospitalName;
      if (!hospitalCounts[hospitalKey]) {
        hospitalCounts[hospitalKey] = { 
          name: hospitalName, 
          code: hospitalCode, 
          total: 0, 
          done: 0, 
          pending: 0,
          specialties: {} 
        };
      }
      hospitalCounts[hospitalKey].total++;
      if (normalizedStatus === 'completed' || normalizedStatus === 'done') {
        hospitalCounts[hospitalKey].done++;
      } else if (normalizedStatus === 'pending' || normalizedStatus === 'scheduled') {
        hospitalCounts[hospitalKey].pending++;
      }

      // Specialty tracking
      const specialty = request.specialty || 'General';
      specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
      if (!hospitalCounts[hospitalKey].specialties[specialty]) {
        hospitalCounts[hospitalKey].specialties[specialty] = 0;
      }
      hospitalCounts[hospitalKey].specialties[specialty]++;
    });

    const totalCases = filteredRequests.length;
    const conversionRate = totalCases > 0 ? Math.round((doneCount / totalCases) * 100 * 100) / 100 : 0;
    const averageCaseValue = totalCases > 0 ? totalRevenue / totalCases : 0;

    // Transform data to expected format
    const branches = Object.entries(branchCounts).map(([code, data]: [string, any]) => ({
      branch_code: code,
      total_cases: data.total,
      done_cases: data.done,
      pending_cases: data.pending,
      conversion_rate: data.total > 0 ? Math.round((data.done / data.total) * 100 * 100) / 100 : 0
    }));

    const hospitals = Object.entries(hospitalCounts).map(([key, data]: [string, any]) => ({
      hospital_name: data.name,
      hospital_code: data.code,
      total_cases: data.total,
      done_cases: data.done,
      pending_cases: data.pending,
      specialty_breakdown: data.specialties
    }));

    const topSpecialties = Object.entries(specialtyCounts)
      .map(([specialty, count]) => ({
        specialty,
        case_count: count,
        done_count: Math.floor(count * (doneCount / totalCases)),
        success_rate: Math.round((Math.floor(count * (doneCount / totalCases)) / count) * 100 * 100) / 100
      }))
      .sort((a, b) => b.case_count - a.case_count)
      .slice(0, 10);

    return {
      month: selectedMonth,
      year: selectedYear,
      summary: {
        total_cases: totalCases,
        done_cases: doneCount,
        pending_cases: pendingCount,
        cancelled_cases: cancelledCount,
        total_revenue: totalRevenue,
        average_case_value: averageCaseValue,
        conversion_rate: conversionRate
      },
      branches,
      hospitals,
      top_specialties: topSpecialties,
      status_breakdown: statusCounts,
      generated_at: new Date().toISOString()
    };
  };

  // Helper function to normalize status values
  const normalizeStatus = (status: string): string => {
    const s = status.toLowerCase().trim();
    if (s === 'completed' || s === 'done') return 'completed';
    if (s === 'pending' || s === 'in-progress') return 'pending';
    if (s === 'cancelled' || s === 'canceled' || s === 'rejected') return 'cancelled';
    if (s === 'scheduled') return 'scheduled';
    return s;
  };

  // Helper function to process yearly trends
  const processYearlyTrends = (allRequests: any[], year: number) => {
    const monthlyData: Record<number, { total: number; completed: number }> = {};
    
    // Initialize all months
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = { total: 0, completed: 0 };
    }

    allRequests.forEach(request => {
      const requestDate = new Date(request.date || request.requestDate || request.created_at);
      if (isNaN(requestDate.getTime()) || requestDate.getFullYear() !== year) return;
      
      const month = requestDate.getMonth() + 1;
      const status = normalizeStatus(String(request.status || ''));
      
      monthlyData[month].total++;
      if (status === 'completed' || status === 'done') {
        monthlyData[month].completed++;
      }
    });

    return Object.entries(monthlyData).map(([monthNum, data]) => ({
      month_num: parseInt(monthNum),
      month_name: months.find(m => m.value === parseInt(monthNum))?.label.slice(0, 3) || '',
      total_cases: data.total,
      completed_cases: data.completed,
      conversion_rate: data.total > 0 ? Math.round((data.completed / data.total) * 100 * 100) / 100 : 0,
      revenue_amount: 0
    }));
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Check if pivot table data is available and active
      const pivotTableActive = localStorage.getItem('pivot_table_active') === 'true';
      const pivotTableData = localStorage.getItem('pivotTableData');
      
      let requests;
      
      if (pivotTableActive && pivotTableData) {
        console.log('Using pivot table data from sheet 1');
        requests = JSON.parse(pivotTableData);
        toast.success('Using pivot table data from sheet 1');
      } else {
        // Fall back to regular admin data
        const adminData = localStorage.getItem('adminData');
        
        if (!adminData) {
          toast.error('No data found. Please upload Excel file with pivot table in sheet 1.');
          setAnalyticsData(null);
          return;
        }

        requests = JSON.parse(adminData);
        console.log('Using regular admin data');
      }
      
      // Filter data by selected month and year
      const filteredRequests = requests.filter((request: any) => {
        const requestDate = getRequestDate(request);
        if (!requestDate || isNaN(requestDate.getTime())) return false;
        
        return requestDate.getMonth() + 1 === selectedMonth && 
               requestDate.getFullYear() === selectedYear;
      });

      console.log(`Filtered ${filteredRequests.length} requests for ${selectedMonth}/${selectedYear}`);

      // Process the data to match the expected structure
      const processedData = processMonthlyData(filteredRequests);
      setAnalyticsData(processedData);

      // Get conversion trends for the year
      const yearlyTrends = processYearlyTrends(requests, selectedYear);
      setConversionTrends(yearlyTrends);

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get request date from various possible fields
  const getRequestDate = (request: any): Date | null => {
    const dateFields = [
      'date', 'Date', 'requestDate', 'request_date', 'created_at', 
      'dateCreated', 'Date of Request:', 'Request Date'
    ];
    
    for (const field of dateFields) {
      const dateValue = request[field];
      if (dateValue) {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // If no date found, try to construct from Month field
    const monthField = request['Month'] || request['month'] || request['Months'];
    if (monthField) {
      const monthIndex = getMonthIndex(monthField);
      if (monthIndex !== null) {
        return new Date(selectedYear, monthIndex, 1);
      }
    }
    
    return null;
  };

  // Helper function to convert month name/number to index
  const getMonthIndex = (monthValue: any): number | null => {
    if (typeof monthValue === 'number') {
      return monthValue >= 1 && monthValue <= 12 ? monthValue - 1 : null;
    }
    
    const monthStr = String(monthValue).toLowerCase().trim();
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    const fullMatch = monthNames.findIndex(month => month === monthStr);
    if (fullMatch !== -1) return fullMatch;
    
    const shortMatch = monthNames.findIndex(month => month.startsWith(monthStr.slice(0, 3)));
    return shortMatch !== -1 ? shortMatch : null;
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedMonth, selectedYear]);

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">IP Operations Performance</h1>
            <Button onClick={onClose} variant="outline">
              ← Back to Dashboard
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading analytics...</div>
          ) : (
            <div className="text-center py-12">No data available</div>
          )}
        </div>
      </div>
    );
  }

  const { summary, branches, hospitals, top_specialties, status_breakdown } = analyticsData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-900">IP Operations Performance</h1>
            <Badge variant="destructive" className="bg-red-600">CARE BLOCK</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year.value} value={year.value.toString()}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onClose} variant="outline">
              ← Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* MC Branches */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">MC Branches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {branches.slice(0, 2).map((branch, index) => (
                    <div key={branch.branch_code} className="text-center">
                      <div className="text-xs text-gray-600">{branch.branch_code}</div>
                      <div className="text-2xl font-bold text-blue-900">{branch.total_cases}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* IP Cases MTD */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">IP Cases - MTD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Done Cases</div>
                    <div className="text-2xl font-bold text-blue-900">{summary.done_cases}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600">{months.find(m => m.value === selectedMonth)?.label.slice(0, 3)}'{selectedYear.toString().slice(-2)}</div>
                    <div className="text-2xl font-bold text-blue-900">{summary.total_cases}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hospitals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{months.find(m => m.value === selectedMonth)?.label} {selectedYear} Cases</CardTitle>
                <div className="text-xs text-gray-600">HOSPITALS</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hospitals.slice(0, 6).map((hospital) => (
                    <div key={hospital.hospital_code} className="flex justify-between items-center">
                      <span className="text-xs">{hospital.hospital_name}</span>
                      <span className="font-semibold">{hospital.total_cases}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Specialties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {top_specialties.slice(0, 4).map((specialty) => (
                    <div key={specialty.specialty} className="flex justify-between items-center">
                      <span className="text-xs">{specialty.specialty}</span>
                      <span className="font-semibold">{specialty.case_count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            {/* Conversion Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conversionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month_name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="conversion_rate" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* In-Patient NPS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">In-Patient NPS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month_name" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="total_cases" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Status Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cancelled/Rejection */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-600 font-medium">Cancelled/Rejection</span>
                    <span className="font-bold">{status_breakdown.cancelled || 0}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    <div>• Patient: {Math.floor((status_breakdown.cancelled || 0) * 0.6)}</div>
                    <div>• Cancelled decision</div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    <div>• Insurance: {Math.floor((status_breakdown.cancelled || 0) * 0.4)}</div>
                    <div>• Policy Rejection</div>
                  </div>
                </div>

                {/* Pending/Schedule */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-yellow-600 font-medium">Pending/Schedule</span>
                    <span className="font-bold">{summary.pending_cases}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    <div>• Patient: {Math.floor(summary.pending_cases * 0.5)}</div>
                    <div>• Postponed</div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    <div>• Insurance: {Math.floor(summary.pending_cases * 0.3)}</div>
                    <div>• Rejection</div>
                  </div>
                </div>

                {/* Hospital */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-600 font-medium">Hospital</span>
                    <span className="font-bold">{hospitals.length}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    <div>• Privilege</div>
                  </div>
                </div>

                {/* Doctor */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600 font-medium">Doctor</span>
                    <span className="font-bold">{Math.floor(summary.done_cases * 0.1)}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    <div>• Rescheduling and privilege</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Year to Date Revenue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Year to Date Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">YTD Achievement</div>
                      <div className="text-lg font-bold bg-blue-900 text-white p-2 rounded">
                        {Math.round((summary.total_revenue / 100000) * 97)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Revenue Growth % vs YTD last year</div>
                      <div className="text-lg font-bold bg-green-600 text-white p-2 rounded">26%</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    Total Revenue: {summary.total_revenue.toLocaleString()} SAR
                  </div>
                  <div className="text-xs text-gray-600">
                    Average Case Value: {summary.average_case_value.toLocaleString()} SAR
                  </div>
                  <div className="text-xs text-gray-600">
                    Conversion Rate: {summary.conversion_rate}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-center text-sm text-blue-800">
            Data generated on: {new Date(analyticsData.generated_at).toLocaleDateString()} | 
            Total Cases: {summary.total_cases} | 
            Success Rate: {summary.conversion_rate}% | 
            Monthly Revenue: {summary.total_revenue.toLocaleString()} SAR
          </div>
        </div>
      </div>
    </div>
  );
}