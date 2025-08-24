import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    let cancelled = false;
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
          setError(error.message);
          setLoading(false);
          return;
        }
        
        const row = (data ?? [])[0] ?? {} as any;
        setData({
          total: Number(row.total_cases ?? 0),
          byStatus: row.status_breakdown ?? {},
          byBranch: row.branch_breakdown ?? {},
          byHospital: row.hospital_breakdown ?? {},
          bySpecialty: row.specialty_breakdown ?? {},
        });
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
        setLoading(false);
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [year, month1to12, nonce]);

  return { data, loading, error };
}