// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface RawExcelMetrics {
  totalCases: number;
  mcj1Cases: number;
  mcj2Cases: number;
  doneCases: number;
  conversionRate: number;
  statusBreakdown: Record<string, number>;
  branchBreakdown: Record<string, number>;
  hospitalBreakdown: Record<string, number>;
  specialtyBreakdown: Record<string, number>;
}

// Excel date serial to JS Date
const excelDateToJS = (serial: any): Date | null => {
  if (!serial) return null;
  const num = Number(serial);
  if (!isNaN(num) && num > 25569) {
    // Excel serial date (days since 1899-12-30)
    return new Date((num - 25569) * 86400 * 1000);
  }
  // Try parsing as string date
  const d = new Date(serial);
  return isNaN(d.getTime()) ? null : d;
};

export function useRawExcelAnalytics(year: number, month: number) {
  const [metrics, setMetrics] = useState<RawExcelMetrics>({
    totalCases: 0,
    mcj1Cases: 0,
    mcj2Cases: 0,
    doneCases: 0,
    conversionRate: 0,
    statusBreakdown: {},
    branchBreakdown: {},
    hospitalBreakdown: {},
    specialtyBreakdown: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refetch = () => setNonce(n => n + 1);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all rows from excel_rows_raw
        const { data, error: fetchError } = await supabase
          .from('excel_rows_raw')
          .select('raw_data');

        if (fetchError) throw fetchError;
        if (cancelled) return;

        if (!data || data.length === 0) {
          console.log('📊 No data in excel_rows_raw');
          setLoading(false);
          return;
        }

        console.log(`📊 Processing ${data.length} rows from excel_rows_raw`);

        // Filter by year/month and aggregate
        const statusBreakdown: Record<string, number> = {};
        const branchBreakdown: Record<string, number> = {};
        const hospitalBreakdown: Record<string, number> = {};
        const specialtyBreakdown: Record<string, number> = {};

        let totalCases = 0;

        data.forEach(row => {
          const raw = row.raw_data as any;
          if (!raw) return;

          // Parse date from "Date of Request:" field
          const dateValue = raw['Date of Request:'] || raw['Date of Request'] || raw['date_of_request'];
          const date = excelDateToJS(dateValue);

          if (!date) return;

          // Filter by selected month/year
          if (date.getFullYear() !== year || (date.getMonth() + 1) !== month) {
            return;
          }

          totalCases++;

          // Extract status
          const status = raw['Status of operation:'] || raw['Status of Operation:'] || raw['status_of_operation'] || 'Unknown';
          statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

          // Extract branch
          const branch = raw['Branch:'] || raw['Branch'] || raw['branch'] || 'Unknown';
          branchBreakdown[branch] = (branchBreakdown[branch] || 0) + 1;

          // Extract hospital
          const hospital = raw['Hospital Name:'] || raw['Hospital Name'] || raw['hospital_name'] || 'Unknown';
          hospitalBreakdown[hospital] = (hospitalBreakdown[hospital] || 0) + 1;

          // Extract specialty
          const specialty = raw['Specialty:'] || raw['Specialty'] || raw['specialty'] || 'Unknown';
          specialtyBreakdown[specialty] = (specialtyBreakdown[specialty] || 0) + 1;
        });

        // Calculate MCJ1/MCJ2 from branch
        const mcj1Cases = Object.entries(branchBreakdown)
          .filter(([k]) => /mcj\s*1/i.test(k))
          .reduce((acc, [, v]) => acc + v, 0);
        
        const mcj2Cases = Object.entries(branchBreakdown)
          .filter(([k]) => /mcj\s*2/i.test(k))
          .reduce((acc, [, v]) => acc + v, 0);

        // Calculate done cases (Done + Scheduled + Planned NVD)
        const doneStatuses = ['Done', 'Completed', 'Scheduled', 'Planned NVD', 'Planned nvd'];
        const doneCases = Object.entries(statusBreakdown)
          .filter(([k]) => doneStatuses.some(s => k.toLowerCase().includes(s.toLowerCase())))
          .reduce((acc, [, v]) => acc + v, 0);

        const conversionRate = totalCases > 0 ? Math.round((doneCases / totalCases) * 100) : 0;

        console.log(`📊 Raw Excel Analytics for ${month}/${year}:
      Total Cases: ${totalCases}
      MCJ1: ${mcj1Cases}
      MCJ2: ${mcj2Cases}
      Done: ${doneCases}
      Conversion: ${conversionRate}%`);

        setMetrics({
          totalCases,
          mcj1Cases,
          mcj2Cases,
          doneCases,
          conversionRate,
          statusBreakdown,
          branchBreakdown,
          hospitalBreakdown,
          specialtyBreakdown,
        });
      } catch (err) {
        console.error('Raw Excel Analytics error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [year, month, nonce]);

  return { metrics, loading, error, refetch };
}
