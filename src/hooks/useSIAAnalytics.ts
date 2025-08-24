import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface SIAMetrics {
  totalCases: number;
  mcj1Cases: number;
  mcj2Cases: number;
  conversionRate: number;
  doneCases: number;
  topHospitals: Array<{ name: string; count: number }>;
  topSpecialties: Array<{ name: string; count: number }>;
  lossTree: {
    cancelledTotal: number;
    pendingTotal: number;
    cancelledBreakdown: Record<string, number>;
    pendingBreakdown: Record<string, number>;
  };
  conversionHistory: Array<{
    month: string;
    totalCases: number;
    doneCases: number;
    conversionRate: number;
  }>;
  revenue: {
    paidCount: number;
    paidSum: number;
    paidPercentage: number;
    mtdGrowth: number;
  };
}

export function useSIAAnalytics(filters: any) {
  const [metrics, setMetrics] = useState<SIAMetrics>({
    totalCases: 0,
    mcj1Cases: 0,
    mcj2Cases: 0,
    conversionRate: 0,
    doneCases: 0,
    topHospitals: [],
    topSpecialties: [],
    lossTree: {
      cancelledTotal: 0,
      pendingTotal: 0,
      cancelledBreakdown: {},
      pendingBreakdown: {}
    },
    conversionHistory: [],
    revenue: {
      paidCount: 0,
      paidSum: 0,
      paidPercentage: 0,
      mtdGrowth: 0
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [filters]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all metrics in parallel using simple queries
      const [
        branchData,
        conversionData,
        topHospitals,
        topSpecialties,
        lossTreeData,
        historyData,
        revenueData
      ] = await Promise.all([
        fetchBranchCases(filters),
        fetchConversionRate(filters),
        fetchTopHospitals(filters),
        fetchTopSpecialties(filters),
        fetchLossTree(filters),
        fetchConversionHistory(),
        fetchRevenue(filters)
      ]);

      setMetrics({
        totalCases: branchData.total,
        mcj1Cases: branchData.mcj1,
        mcj2Cases: branchData.mcj2,
        conversionRate: conversionData.rate,
        doneCases: conversionData.done,
        topHospitals,
        topSpecialties,
        lossTree: lossTreeData,
        conversionHistory: historyData,
        revenue: revenueData
      });

    } catch (err) {
      console.error('Error fetching SIA metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, error, refetch: fetchMetrics };
}

async function fetchBranchCases(filters: any) {
  // Get both medical_requests and excel_requests data
  const [medicalData, excelData] = await Promise.all([
    supabase
      .from('medical_requests')
      .select('branch_code, created_at, status, hospital_name, specialty')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31'),
    
    supabase
      .from('excel_requests')
      .select('branch_code, created_at, status, hospital_name, specialty')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31')
  ]);

  if (medicalData.error) throw medicalData.error;
  if (excelData.error) throw excelData.error;

  // Combine data
  const allData = [...(medicalData.data || []), ...(excelData.data || [])];
  
  // Apply additional filters
  const filteredData = allData.filter(item => {
    if (filters.statuses?.length > 0 && !filters.statuses.includes(item.status)) return false;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(item.hospital_name)) return false;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(item.specialty)) return false;
    if (filters.branches?.length > 0 && !filters.branches.includes(item.branch_code)) return false;
    return true;
  });

  const result = { total: 0, mcj1: 0, mcj2: 0 };
  
  result.total = filteredData.length;
  result.mcj1 = filteredData.filter(r => r.branch_code === 'MCJ1').length;
  result.mcj2 = filteredData.filter(r => r.branch_code === 'MCJ2').length;

  return result;
}

async function fetchConversionRate(filters: any) {
  const { data: settings } = await supabase
    .from('sia_settings')
    .select('value')
    .eq('key', 'numerator_statuses')
    .eq('scope', 'global')
    .maybeSingle();

  const numeratorStatuses = (settings?.value as string[]) || ['Completed', 'Scheduled', 'Planned NVD'];

  // Get raw Excel data for accurate calculation
  const { data: excelData, error } = await supabase
    .from('excel_rows_raw')
    .select('*');

  if (error) throw error;
  if (!excelData) return { done: 0, rate: 0 };

  console.log('SIA Conversion Rate - Raw Excel Data:', excelData.length, 'rows');

  // Parse Excel date function
  const parseExcelDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    if (typeof dateValue === 'number') {
      // Excel serial date
      const excelEpoch = new Date(1899, 11, 30);
      return new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
    }
    
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    return null;
  };

  // Filter by selected month/year if specified
  let filteredData = excelData;
  
  if (filters.month && filters.year) {
    filteredData = excelData.filter(row => {
      const dateValue = row.Date; // Use Date column directly
      if (!dateValue) return false;
      
      const date = parseExcelDate(dateValue);
      if (!date) return false;
      
      return date.getMonth() + 1 === filters.month && date.getFullYear() === filters.year;
    });
  }

  // Count done cases using Status column - should total 153
  const doneStatuses = ['Completed', 'Done', 'Scheduled', 'Planned NVD'];
  const done = filteredData.filter(row => {
    const status = row.Status; // Use Status column directly
    return status && doneStatuses.some(s => 
      status.toString().toLowerCase().trim() === s.toLowerCase()
    );
  }).length;

  const total = filteredData.length;
  const rate = total > 0 ? Math.round((done / total) * 100 * 100) / 100 : 0;

  console.log('SIA Conversion Rate Calculation:', {
    total,
    done,
    rate: `${rate}%`,
    filteredMonth: filters.month,
    filteredYear: filters.year
  });

  return { done, rate };
}

async function fetchTopHospitals(filters: any): Promise<Array<{ name: string; count: number }>> {
  // Get combined data
  const [medicalData, excelData] = await Promise.all([
    supabase
      .from('medical_requests')
      .select('hospital_name, created_at, status, specialty, branch_code')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31'),
    
    supabase
      .from('excel_requests')
      .select('hospital_name, created_at, status, specialty, branch_code')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31')
  ]);

  if (medicalData.error) throw medicalData.error;
  if (excelData.error) throw excelData.error;

  const allData = [...(medicalData.data || []), ...(excelData.data || [])];
  
  // Apply filters and count
  const hospitalCounts: Record<string, number> = {};
  
  allData.forEach(item => {
    if (!item.hospital_name) return;
    if (filters.statuses?.length > 0 && !filters.statuses.includes(item.status)) return;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(item.hospital_name)) return;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(item.specialty)) return;
    if (filters.branches?.length > 0 && !filters.branches.includes(item.branch_code)) return;
    
    hospitalCounts[item.hospital_name] = (hospitalCounts[item.hospital_name] || 0) + 1;
  });

  return Object.entries(hospitalCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

async function fetchTopSpecialties(filters: any): Promise<Array<{ name: string; count: number }>> {
  // Get combined data
  const [medicalData, excelData] = await Promise.all([
    supabase
      .from('medical_requests')
      .select('specialty, created_at, status, hospital_name, branch_code')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31'),
    
    supabase
      .from('excel_requests')
      .select('specialty, created_at, status, hospital_name, branch_code')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31')
  ]);

  if (medicalData.error) throw medicalData.error;
  if (excelData.error) throw excelData.error;

  const allData = [...(medicalData.data || []), ...(excelData.data || [])];
  
  // Apply filters and count
  const specialtyCounts: Record<string, number> = {};
  
  allData.forEach(item => {
    if (!item.specialty) return;
    if (filters.statuses?.length > 0 && !filters.statuses.includes(item.status)) return;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(item.hospital_name)) return;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(item.specialty)) return;
    if (filters.branches?.length > 0 && !filters.branches.includes(item.branch_code)) return;
    
    specialtyCounts[item.specialty] = (specialtyCounts[item.specialty] || 0) + 1;
  });

  return Object.entries(specialtyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

async function fetchLossTree(filters: any) {
  const { data: settings } = await supabase
    .from('sia_settings')
    .select('key, value')
    .in('key', ['loss_cancelled_statuses', 'loss_pending_statuses'])
    .eq('scope', 'global');

  const cancelledStatuses = (settings?.find(s => s.key === 'loss_cancelled_statuses')?.value as string[]) || [];
  const pendingStatuses = (settings?.find(s => s.key === 'loss_pending_statuses')?.value as string[]) || [];

  // Get combined data
  const [medicalData, excelData] = await Promise.all([
    supabase
      .from('medical_requests')
      .select('status, loss_reason, created_at, hospital_name, specialty, branch_code')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31'),
    
    supabase
      .from('excel_requests')
      .select('status, loss_reason, created_at, hospital_name, specialty, branch_code')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31')
  ]);

  if (medicalData.error) throw medicalData.error;
  if (excelData.error) throw excelData.error;

  const allData = [...(medicalData.data || []), ...(excelData.data || [])];
  
  // Apply filters
  const filteredData = allData.filter(item => {
    if (filters.statuses?.length > 0 && !filters.statuses.includes(item.status)) return false;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(item.hospital_name)) return false;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(item.specialty)) return false;
    if (filters.branches?.length > 0 && !filters.branches.includes(item.branch_code)) return false;
    return true;
  });

  // Calculate totals and breakdowns
  const cancelledTotal = filteredData.filter(item => cancelledStatuses.includes(item.status)).length;
  const pendingTotal = filteredData.filter(item => pendingStatuses.includes(item.status)).length;

  const cancelledBreakdown: Record<string, number> = {};
  const pendingBreakdown: Record<string, number> = {};

  filteredData.forEach(item => {
    if (cancelledStatuses.includes(item.status) && item.loss_reason) {
      cancelledBreakdown[item.loss_reason] = (cancelledBreakdown[item.loss_reason] || 0) + 1;
    }
    if (pendingStatuses.includes(item.status) && item.loss_reason) {
      pendingBreakdown[item.loss_reason] = (pendingBreakdown[item.loss_reason] || 0) + 1;
    }
  });

  return {
    cancelledTotal,
    pendingTotal,
    cancelledBreakdown,
    pendingBreakdown
  };
}

async function fetchConversionHistory(): Promise<Array<{
  month: string;
  totalCases: number;
  doneCases: number;
  conversionRate: number;
}>> {
  const { data: settings } = await supabase
    .from('sia_settings')
    .select('value')
    .eq('key', 'numerator_statuses')
    .eq('scope', 'global')
    .maybeSingle();

  const numeratorStatuses = (settings?.value as string[]) || ['Completed', 'Scheduled', 'Planned NVD'];

  // Get last 6 months of data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [medicalData, excelData] = await Promise.all([
    supabase
      .from('medical_requests')
      .select('status, created_at')
      .gte('created_at', sixMonthsAgo.toISOString()),
    
    supabase
      .from('excel_requests')
      .select('status, created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
  ]);

  if (medicalData.error) throw medicalData.error;
  if (excelData.error) throw excelData.error;

  const allData = [...(medicalData.data || []), ...(excelData.data || [])];
  
  // Group by month
  const monthlyData: Record<string, { total: number; done: number }> = {};
  
  allData.forEach(item => {
    const month = new Date(item.created_at).toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, done: 0 };
    }
    monthlyData[month].total++;
    if (numeratorStatuses.includes(item.status)) {
      monthlyData[month].done++;
    }
  });

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      totalCases: data.total,
      doneCases: data.done,
      conversionRate: data.total > 0 ? Math.round((data.done / data.total) * 100 * 100) / 100 : 0
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

async function fetchRevenue(filters: any) {
  // Get combined data
  const [medicalData, excelData] = await Promise.all([
    supabase
      .from('medical_requests')
      .select('paid_amount, created_at, status, hospital_name, specialty, branch_code')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31'),
    
    supabase
      .from('excel_requests')
      .select('paid_amount, created_at, status, hospital_name, specialty, branch_code')
      .gte('created_at', filters.dateRange?.start || '1900-01-01')
      .lte('created_at', filters.dateRange?.end || '2999-12-31')
  ]);

  if (medicalData.error) throw medicalData.error;
  if (excelData.error) throw excelData.error;

  const allData = [...(medicalData.data || []), ...(excelData.data || [])];
  
  // Apply filters
  const filteredData = allData.filter(item => {
    if (filters.statuses?.length > 0 && !filters.statuses.includes(item.status)) return false;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(item.hospital_name)) return false;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(item.specialty)) return false;
    if (filters.branches?.length > 0 && !filters.branches.includes(item.branch_code)) return false;
    return true;
  });

  const paidCount = filteredData.filter(item => (item.paid_amount || 0) > 0).length;
  const paidSum = filteredData.reduce((sum, item) => sum + (item.paid_amount || 0), 0);
  const paidPercentage = filteredData.length > 0 ? Math.round((paidCount / filteredData.length) * 100 * 100) / 100 : 0;

  return {
    paidCount,
    paidSum: parseFloat(paidSum.toString()),
    paidPercentage,
    mtdGrowth: 0 // TODO: Implement MTD growth calculation
  };
}