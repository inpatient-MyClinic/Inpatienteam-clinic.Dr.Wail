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
  // Get raw Excel data for accurate calculation
  const { data: excelData, error } = await supabase
    .from('excel_rows_raw')
    .select('*');

  if (error) throw error;
  if (!excelData) return { total: 0, mcj1: 0, mcj2: 0 };

  // Parse Excel date function
  const parseExcelDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    if (typeof dateValue === 'number') {
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
      const dateValue = row.Date;
      if (!dateValue) return false;
      
      const date = parseExcelDate(dateValue);
      if (!date) return false;
      
      return date.getMonth() + 1 === filters.month && date.getFullYear() === filters.year;
    });
  }

  // Apply additional filters
  const finalFilteredData = filteredData.filter(row => {
    if (filters.statuses?.length > 0 && !filters.statuses.includes(row.Status)) return false;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(row["Hospital Name"])) return false;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(row.Specialty)) return false;
    if (filters.branches?.length > 0 && !filters.branches.includes(row.Branch)) return false;
    return true;
  });

  const result = { total: 0, mcj1: 0, mcj2: 0 };
  
  result.total = finalFilteredData.length;
  result.mcj1 = finalFilteredData.filter(r => r.Branch === 'MCJ1').length;
  result.mcj2 = finalFilteredData.filter(r => r.Branch === 'MCJ2').length;

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
  // Get raw Excel data for accurate calculation
  const { data: excelData, error } = await supabase
    .from('excel_rows_raw')
    .select('*');

  if (error) throw error;
  if (!excelData) return [];

  // Parse Excel date function
  const parseExcelDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    if (typeof dateValue === 'number') {
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
      const dateValue = row.Date;
      if (!dateValue) return false;
      
      const date = parseExcelDate(dateValue);
      if (!date) return false;
      
      return date.getMonth() + 1 === filters.month && date.getFullYear() === filters.year;
    });
  }

  // Apply additional filters and count hospitals
  const hospitalCounts: Record<string, number> = {};
  
  filteredData.forEach(row => {
    const hospitalName = row["Hospital Name"];
    if (!hospitalName) return;
    
    // Apply status filter if specified
    if (filters.statuses?.length > 0 && !filters.statuses.includes(row.Status)) return;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(hospitalName)) return;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(row.Specialty)) return;
    if (filters.branches?.length > 0 && !filters.branches.includes(row.Branch)) return;
    
    hospitalCounts[hospitalName] = (hospitalCounts[hospitalName] || 0) + 1;
  });

  return Object.entries(hospitalCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

async function fetchTopSpecialties(filters: any): Promise<Array<{ name: string; count: number }>> {
  // Get raw Excel data for accurate calculation
  const { data: excelData, error } = await supabase
    .from('excel_rows_raw')
    .select('*');

  if (error) throw error;
  if (!excelData) return [];

  // Parse Excel date function
  const parseExcelDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    if (typeof dateValue === 'number') {
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
      const dateValue = row.Date;
      if (!dateValue) return false;
      
      const date = parseExcelDate(dateValue);
      if (!date) return false;
      
      return date.getMonth() + 1 === filters.month && date.getFullYear() === filters.year;
    });
  }

  // Apply additional filters and count specialties
  const specialtyCounts: Record<string, number> = {};
  
  filteredData.forEach(row => {
    const specialty = row.Specialty;
    if (!specialty) return;
    
    // Apply filters
    if (filters.statuses?.length > 0 && !filters.statuses.includes(row.Status)) return;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(row["Hospital Name"])) return;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(specialty)) return;
    if (filters.branches?.length > 0 && !filters.branches.includes(row.Branch)) return;
    
    specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
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

  const cancelledStatuses = (settings?.find(s => s.key === 'loss_cancelled_statuses')?.value as string[]) || ['Cancelled', 'Case Canceled'];
  const pendingStatuses = (settings?.find(s => s.key === 'loss_pending_statuses')?.value as string[]) || ['Pending', 'Under Process'];

  // Get raw Excel data for accurate calculation
  const { data: excelData, error } = await supabase
    .from('excel_rows_raw')
    .select('*');

  if (error) throw error;
  if (!excelData) return {
    cancelledTotal: 0,
    pendingTotal: 0,
    cancelledBreakdown: {},
    pendingBreakdown: {}
  };

  // Parse Excel date function
  const parseExcelDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    if (typeof dateValue === 'number') {
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
      const dateValue = row.Date;
      if (!dateValue) return false;
      
      const date = parseExcelDate(dateValue);
      if (!date) return false;
      
      return date.getMonth() + 1 === filters.month && date.getFullYear() === filters.year;
    });
  }

  // Apply additional filters
  const finalFilteredData = filteredData.filter(row => {
    if (filters.statuses?.length > 0 && !filters.statuses.includes(row.Status)) return false;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(row["Hospital Name"])) return false;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(row.Specialty)) return false;
    if (filters.branches?.length > 0 && !filters.branches.includes(row.Branch)) return false;
    return true;
  });

  // Calculate totals and breakdowns
  const cancelledTotal = finalFilteredData.filter(row => cancelledStatuses.includes(row.Status)).length;
  const pendingTotal = finalFilteredData.filter(row => pendingStatuses.includes(row.Status)).length;

  const cancelledBreakdown: Record<string, number> = {};
  const pendingBreakdown: Record<string, number> = {};

  finalFilteredData.forEach(row => {
    if (cancelledStatuses.includes(row.Status) && row["Loss Reason"]) {
      const reason = row["Loss Reason"];
      cancelledBreakdown[reason] = (cancelledBreakdown[reason] || 0) + 1;
    }
    if (pendingStatuses.includes(row.Status) && row["Loss Reason"]) {
      const reason = row["Loss Reason"];
      pendingBreakdown[reason] = (pendingBreakdown[reason] || 0) + 1;
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

  const numeratorStatuses = (settings?.value as string[]) || ['Completed', 'Done', 'Scheduled', 'Planned NVD'];

  // Get raw Excel data for accurate calculation
  const { data: excelData, error } = await supabase
    .from('excel_rows_raw')
    .select('*');

  if (error) throw error;
  if (!excelData) return [];

  // Parse Excel date function
  const parseExcelDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      return new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
    }
    
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    return null;
  };

  // Get last 6 months of data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Filter data by date and parse
  const filteredData = excelData.filter(row => {
    const dateValue = row.Date;
    if (!dateValue) return false;
    
    const date = parseExcelDate(dateValue);
    if (!date) return false;
    
    return date >= sixMonthsAgo;
  });
  
  // Group by month
  const monthlyData: Record<string, { total: number; done: number }> = {};
  
  filteredData.forEach(row => {
    const dateValue = row.Date;
    const date = parseExcelDate(dateValue);
    if (!date) return;
    
    const month = date.toISOString().substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, done: 0 };
    }
    monthlyData[month].total++;
    if (numeratorStatuses.some(s => s.toLowerCase() === row.Status?.toString().toLowerCase())) {
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
  // Get raw Excel data for accurate calculation
  const { data: excelData, error } = await supabase
    .from('excel_rows_raw')
    .select('*');

  if (error) throw error;
  if (!excelData) return {
    paidCount: 0,
    paidSum: 0,
    paidPercentage: 0,
    mtdGrowth: 0
  };

  // Parse Excel date function
  const parseExcelDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    if (typeof dateValue === 'number') {
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
      const dateValue = row.Date;
      if (!dateValue) return false;
      
      const date = parseExcelDate(dateValue);
      if (!date) return false;
      
      return date.getMonth() + 1 === filters.month && date.getFullYear() === filters.year;
    });
  }

  // Apply additional filters
  const finalFilteredData = filteredData.filter(row => {
    if (filters.statuses?.length > 0 && !filters.statuses.includes(row.Status)) return false;
    if (filters.hospitals?.length > 0 && !filters.hospitals.includes(row["Hospital Name"])) return false;
    if (filters.specialties?.length > 0 && !filters.specialties.includes(row.Specialty)) return false;
    if (filters.branches?.length > 0 && !filters.branches.includes(row.Branch)) return false;
    return true;
  });

  // Calculate revenue metrics
  const paidAmounts = finalFilteredData.map(row => {
    const amount = row["Paid Amount"];
    if (!amount) return 0;
    
    // Parse amount (handle both string and number formats)
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  });

  const paidCount = paidAmounts.filter(amount => amount > 0).length;
  const paidSum = paidAmounts.reduce((sum, amount) => sum + amount, 0);
  const paidPercentage = finalFilteredData.length > 0 ? Math.round((paidCount / finalFilteredData.length) * 100 * 100) / 100 : 0;

  return {
    paidCount,
    paidSum: parseFloat(paidSum.toString()),
    paidPercentage,
    mtdGrowth: 0 // TODO: Implement MTD growth calculation with historical data
  };
}