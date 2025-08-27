import { useEffect, useState } from "react";
import { EnhancedAnalyticsService } from "@/services/enhancedAnalyticsService";

type Breakdown = Record<string, number>;
export type ExcelMonthlySlice = {
  total: number;
  byStatus: Breakdown;
  byBranch: Breakdown;
  byHospital: Breakdown;
  bySpecialty: Breakdown;
};

/**
 * Enhanced analytics hook that seamlessly handles both database and localStorage data
 */
export function useExcelMonthlyAnalytics(year: number, month1to12: number, nonce = 0) {
  const [data, setData] = useState<ExcelMonthlySlice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`📊 Fetching analytics for ${year}-${month1to12.toString().padStart(2, '0')}`);
        
        const analyticsData = await EnhancedAnalyticsService.getMonthlyAnalytics(year, month1to12);
        
        if (cancelled) return;
        
        console.log(`📈 Analytics result: ${analyticsData.totalCases} total cases`);
        
        setData({
          total: analyticsData.totalCases,
          byStatus: analyticsData.byStatus,
          byBranch: analyticsData.byBranch,
          byHospital: analyticsData.byHospital,
          bySpecialty: analyticsData.bySpecialty,
        });
        
        // Check if we're using localStorage data (when database is empty)
        setUsingLocalStorage(analyticsData.rawData !== undefined);
        
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Analytics error:', err);
        setError(`Failed to fetch analytics: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [year, month1to12, nonce]);

  return { 
    data, 
    loading, 
    error,
    usingLocalStorage,
    retryDatabase: () => setUsingLocalStorage(false)
  };
}