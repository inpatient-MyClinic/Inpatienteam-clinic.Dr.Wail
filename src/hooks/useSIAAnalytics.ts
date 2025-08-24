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
      // Get raw Excel data - this is the ONLY source of truth
      const { data: excelData, error } = await supabase
        .from('excel_rows_raw')
        .select('*');

      if (error) throw error;
      if (!excelData) {
        setMetrics({
          totalCases: 0,
          mcj1Cases: 0,
          mcj2Cases: 0,
          conversionRate: 0,
          doneCases: 0,
          topHospitals: [],
          topSpecialties: [],
          lossTree: { cancelledTotal: 0, pendingTotal: 0, cancelledBreakdown: {}, pendingBreakdown: {} },
          conversionHistory: [],
          revenue: { paidCount: 0, paidSum: 0, paidPercentage: 0, mtdGrowth: 0 }
        });
        return;
      }

      console.log('Raw Excel Data Count:', excelData.length);

      // Filter data by month/year if specified
      let filteredData = excelData;
      
      if (filters.month && filters.year) {
        filteredData = excelData.filter(row => {
          const dateValue = row.Date;
          if (!dateValue) return false;
          
          // Handle Excel serial dates properly
          let date: Date | null = null;
          if (typeof dateValue === 'number') {
            // Excel serial date - days since 1900-01-01 (but Excel has a leap year bug, so we use 1899-12-30 as epoch)
            const excelEpoch = new Date(1899, 11, 30);
            date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
          } else if (typeof dateValue === 'string') {
            date = new Date(dateValue);
          }
          
          if (!date || isNaN(date.getTime())) return false;
          
          const rowMonth = date.getMonth() + 1; // getMonth() is 0-based
          const rowYear = date.getFullYear();
          
          return rowMonth === filters.month && rowYear === filters.year;
        });

        console.log(`Filtered data for ${filters.month}/${filters.year}:`, filteredData.length);
      }

      // Apply additional filters
      if (filters.statuses?.length > 0) {
        filteredData = filteredData.filter(row => filters.statuses.includes(row.Status));
      }
      if (filters.hospitals?.length > 0) {
        filteredData = filteredData.filter(row => filters.hospitals.includes(row["Hospital Name"]));
      }
      if (filters.specialties?.length > 0) {
        filteredData = filteredData.filter(row => filters.specialties.includes(row.Specialty));
      }
      if (filters.branches?.length > 0) {
        filteredData = filteredData.filter(row => filters.branches.includes(row.Branch));
      }

      // Get actual status breakdown from filtered data
      const statusCounts: Record<string, number> = {};
      filteredData.forEach(row => {
        const status = row.Status?.toString().trim();
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      });

      console.log('CORRECTED Status Breakdown for July:', statusCounts);

      // Calculate metrics using EXACT status names from Excel
      const totalCases = filteredData.length;
      const mcj1Cases = filteredData.filter(row => row.Branch === 'MCJ1').length;
      const mcj2Cases = filteredData.filter(row => row.Branch === 'MCJ2').length;

      // Use exact status names from your Excel data
      const doneCount = statusCounts['Done'] || 0;
      const scheduledCount = statusCounts['Scheduled'] || 0;
      const plannedNVDCount = statusCounts['Planned NVD'] || 0;
      
      const totalDone = doneCount + scheduledCount + plannedNVDCount;
      const conversionRate = totalCases > 0 ? Math.round((totalDone / totalCases) * 100 * 100) / 100 : 0;

      // Calculate top hospitals
      const hospitalCounts: Record<string, number> = {};
      filteredData.forEach(row => {
        const hospital = row["Hospital Name"];
        if (hospital) {
          hospitalCounts[hospital] = (hospitalCounts[hospital] || 0) + 1;
        }
      });

      const topHospitals = Object.entries(hospitalCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate top specialties
      const specialtyCounts: Record<string, number> = {};
      filteredData.forEach(row => {
        const specialty = row.Specialty;
        if (specialty) {
          specialtyCounts[specialty] = (specialtyCounts[specialty] || 0) + 1;
        }
      });

      const topSpecialties = Object.entries(specialtyCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate loss tree with exact status names
      const cancelledTotal = statusCounts['Case Canceled'] || 0;
      const pendingTotal = (statusCounts['Pending'] || 0) + (statusCounts['Under Process'] || 0);

      // Calculate revenue
      const paidAmounts = filteredData.map(row => {
        const amount = row["Paid Amount"];
        if (!amount) return 0;
        
        if (typeof amount === 'number') return amount;
        if (typeof amount === 'string') {
          const parsed = parseFloat(amount.replace(/[^0-9.-]/g, ''));
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      });

      const paidCount = paidAmounts.filter(amount => amount > 0).length;
      const paidSum = paidAmounts.reduce((sum, amount) => sum + amount, 0);
      const paidPercentage = totalCases > 0 ? Math.round((paidCount / totalCases) * 100 * 100) / 100 : 0;

      console.log('FINAL CORRECTED SIA Metrics:', {
        totalCases,
        mcj1Cases,
        mcj2Cases,
        doneCount,
        scheduledCount,
        plannedNVDCount,
        totalDone,
        conversionRate,
        statusBreakdown: statusCounts
      });

      setMetrics({
        totalCases,
        mcj1Cases,
        mcj2Cases,
        conversionRate,
        doneCases: totalDone,
        topHospitals,
        topSpecialties,
        lossTree: {
          cancelledTotal,
          pendingTotal,
          cancelledBreakdown: { 'Case Canceled': cancelledTotal },
          pendingBreakdown: { 'Pending': statusCounts['Pending'] || 0, 'Under Process': statusCounts['Under Process'] || 0 }
        },
        conversionHistory: [], // Simplified for now
        revenue: {
          paidCount,
          paidSum,
          paidPercentage,
          mtdGrowth: 0
        }
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