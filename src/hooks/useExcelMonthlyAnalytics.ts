import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorageAnalytics } from './useLocalStorageAnalytics';

type Breakdown = Record<string, number>;
export type ExcelMonthlySlice = {
  total: number;
  byStatus: Breakdown;
  byBranch: Breakdown;
  byHospital: Breakdown;
  bySpecialty: Breakdown;
};

/**
 * Pulls monthly analytics ONLY from Excel uploads (AP=Month/Date, AI=Status).
 * Guarantees that changing month/year reslices the same source rows.
 */
export function useExcelMonthlyAnalytics(year: number, month1to12: number, nonce = 0) {
  const [data, setData] = useState<ExcelMonthlySlice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDatabase, setUseDatabase] = useState(true);
  
  // Fallback to localStorage analytics
  const localStorageAnalytics = useLocalStorageAnalytics(year, month1to12);

  useEffect(() => {
    let cancelled = false;
    
    if (!useDatabase) {
      // Use localStorage fallback
      return;
    }
    
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.rpc("analyze_excel_cases_monthly", {
          p_year: year,
          p_month: month1to12,
        });
        
        if (cancelled) return;
        
        if (error) {
          console.error('Database analytics error:', error);
          setError(`Database error: ${error.message}. Falling back to localStorage.`);
          setUseDatabase(false);
          setLoading(false);
          return;
        }
        
        const row = (data ?? [])[0] ?? {} as any;
        const total = Number(row.total_cases ?? 0);
        
        // If no data in database, fall back to localStorage
        if (total === 0) {
          console.log(`📊 No database data for ${year}-${month1to12.toString().padStart(2, '0')}, using localStorage`);
          setUseDatabase(false);
          setLoading(false);
          return;
        }
        
        console.log(`📊 Database found ${total} cases for ${year}-${month1to12.toString().padStart(2, '0')}`);
        
        setData({
          total,
          byStatus: row.status_breakdown ?? {},
          byBranch: row.branch_breakdown ?? {},
          byHospital: row.hospital_breakdown ?? {},
          bySpecialty: row.specialty_breakdown ?? {},
        });
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Analytics error:', err);
        setError(`Failed to fetch analytics: ${err instanceof Error ? err.message : 'Unknown error'}. Falling back to localStorage.`);
        setUseDatabase(false);
        setLoading(false);
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [year, month1to12, nonce, useDatabase]);
  
  // Use localStorage analytics when database is not available
  useEffect(() => {
    if (!useDatabase && !localStorageAnalytics.loading) {
      const { metrics } = localStorageAnalytics;
      console.log(`📊 Using localStorage: ${metrics.totalCases} cases for ${year}-${month1to12.toString().padStart(2, '0')}`);
      
      setData({
        total: metrics.totalCases,
        byStatus: metrics.byStatus,
        byBranch: metrics.byBranch,
        byHospital: metrics.byHospital,
        bySpecialty: metrics.bySpecialty,
      });
      setLoading(false);
    }
  }, [useDatabase, localStorageAnalytics.metrics, localStorageAnalytics.loading, year, month1to12]);

  return { 
    data, 
    loading: loading || localStorageAnalytics.loading, 
    error,
    usingLocalStorage: !useDatabase,
    retryDatabase: () => setUseDatabase(true)
  };
}