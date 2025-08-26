import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  statuses?: string[];
  hospitals?: string[];
  specialties?: string[];
  branches?: string[];
}

export interface KPIData {
  conversion_rate: {
    numerator: number;
    denominator: number;
    mcj1_count: number;
    mcj2_count: number;
    rate: number;
  };
  branch_counts: Array<{
    branch_code: string;
    total_count: number;
    mcj1_count: number;
    mcj2_count: number;
  }>;
  top_hospitals: Array<{
    hospital_name: string;
    total_cases: number;
    conversion_rate: number;
  }>;
  top_specialties: Array<{
    specialty: string;
    total_cases: number;
    conversion_rate: number;
  }>;
  loss_tree: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export function useRPCAnalytics(selectedMonth: Date | null) {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build date filters from selected month
  const filters = useMemo(() => {
    if (selectedMonth) {
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    } else {
      return {
        startDate: '1900-01-01',
        endDate: new Date().toISOString().split('T')[0]
      };
    }
  }, [selectedMonth]);

  const fetchKPIData = async () => {
    if (!filters) return;

    setLoading(true);
    setError(null);

    try {
      // For now, use mock data since RPC functions may not be available yet
      // This will be replaced with actual RPC calls once the functions are implemented
      const mockData = {
        conversion_rate: { numerator: 150, denominator: 200, mcj1_count: 120, mcj2_count: 30, rate: 75.0 },
        branch_counts: [
          { branch_code: 'MCJ', total_count: 100, mcj1_count: 80, mcj2_count: 20 },
          { branch_code: 'Branch 2', total_count: 50, mcj1_count: 40, mcj2_count: 10 }
        ],
        top_hospitals: [
          { hospital_name: 'Hospital A', total_cases: 80, conversion_rate: 85.0 },
          { hospital_name: 'Hospital B', total_cases: 60, conversion_rate: 70.0 },
          { hospital_name: 'Hospital C', total_cases: 40, conversion_rate: 65.0 }
        ],
        top_specialties: [
          { specialty: 'Cardiology', total_cases: 50, conversion_rate: 80.0 },
          { specialty: 'Orthopedics', total_cases: 40, conversion_rate: 75.0 },
          { specialty: 'General Surgery', total_cases: 35, conversion_rate: 70.0 }
        ],
        loss_tree: [
          { status: 'Completed', count: 150, percentage: 75.0 },
          { status: 'Cancelled', count: 30, percentage: 15.0 },
          { status: 'Pending', count: 20, percentage: 10.0 }
        ]
      };

      setData(mockData);

    } catch (err: any) {
      console.error('Error fetching KPI data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
  }, [filters.startDate, filters.endDate]);

  const refetch = () => {
    fetchKPIData();
  };

  return {
    data,
    loading,
    error,
    refetch,
    filters
  };
}