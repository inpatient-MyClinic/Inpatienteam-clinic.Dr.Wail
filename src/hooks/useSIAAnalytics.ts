import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorageAnalytics } from './useLocalStorageAnalytics';
import { buildFilterWhereClause } from '@/utils/siaFilters';

// ---------- Types your UI already expects ----------
type TopItem = { name: string; count: number };
export interface SIAMetrics {
  totalCases: number;
  mcj1Cases: number;
  mcj2Cases: number;
  doneCases: number;
  conversionRate: number;            // integer %
  topHospitals: TopItem[];
  topSpecialties: TopItem[];
  lossTree: {
    cancelledTotal: number;
    cancelledBreakdown: Record<string, number>;
    pendingTotal: number;
    pendingBreakdown: Record<string, number>;
  };
  revenue: { paidCount: number; paidPercentage: number; paidSum: number; mtdGrowth?: number }; // placeholder from Excel slice
  conversionHistory: Array<{ month: string; conversionRate: number; totalCases?: number; doneCases?: number }>;     // placeholder
}

type Breakdown = Record<string, number>;
type ExcelRPCRow = {
  total_cases: number;
  status_breakdown: Breakdown;
  branch_breakdown: Breakdown;
  hospital_breakdown: Breakdown;
  specialty_breakdown: Breakdown;
};

// helpers
const topN = (obj: Breakdown, n = 5): TopItem[] =>
  Object.entries(obj)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);

const sumKeys = (obj: Breakdown, keys: string[]) =>
  keys.reduce((acc, k) => acc + (obj[k] ?? 0), 0);

// status synonyms (don't change UI; just map data)
const STATUS = {
  completed: ["Completed", "Done"],
  scheduled: ["Scheduled"],
  plannedNVD: ["Planned NVD", "Planned nvd", "Planned\nNVD"],
  cancelledAny: ["Cancelled", "Canceled", "Case Canceled", "Case Cancelled", "Rejected"],
};

const pickFirst = (obj: Breakdown, keys: string[]) => {
  for (const k of keys) if (k in obj) return obj[k]!;
  return 0;
};

// ---------- The hook your UI already uses ----------
export function useSIAAnalytics(filters: any) {
  const now = new Date();
  
  // Handle filters.month which can be a Date object or numbers
  let year: number;
  let month: number; // 1..12
  
  if (filters?.month instanceof Date) {
    year = filters.month.getFullYear();
    month = filters.month.getMonth() + 1; // Convert 0-11 to 1-12
  } else {
    year = Number(filters?.year) || now.getFullYear();
    month = Number(filters?.month) || (now.getMonth() + 1);
  }
  
  console.log(`🎯 SIA Analytics: Using year=${year}, month=${month} from filters:`, filters);

  const [metrics, setMetrics] = useState<SIAMetrics>({
    totalCases: 0, mcj1Cases: 0, mcj2Cases: 0, doneCases: 0, conversionRate: 0,
    topHospitals: [], topSpecialties: [],
    lossTree: { cancelledTotal: 0, cancelledBreakdown: {}, pendingTotal: 0, pendingBreakdown: {} },
    revenue: { paidCount: 0, paidPercentage: 0, paidSum: 0, mtdGrowth: 0 },
    conversionHistory: [],
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [useDatabase, setUseDatabase] = useState(true);
  const refetch = () => setNonce(n => n + 1);

  // Fallback to localStorage analytics
  const localStorageAnalytics = useLocalStorageAnalytics(year, month);

  useEffect(() => {
    let cancel = false;
    
    if (!useDatabase) {
      // Use localStorage fallback
      console.log('📊 Using localStorage fallback for analytics');
      return;
    }
    
    (async () => {
      setLoading(true); setError(null);

      try {
        // Try database first - simplified for now
        const monthlyResult = await supabase.rpc("analyze_excel_cases_monthly", {
          p_year: year, p_month: month
        });

        if (cancel) return;
        
        if (monthlyResult.error) {
          console.error('Database analytics error:', monthlyResult.error);
          setError(`Database error: ${monthlyResult.error.message}. Falling back to localStorage.`);
          setUseDatabase(false);
          setLoading(false);
          return;
        }

        const row: ExcelRPCRow = (monthlyResult.data ?? [])[0] as any || {
          total_cases: 0, status_breakdown: {}, branch_breakdown: {}, hospital_breakdown: {}, specialty_breakdown: {}
        };

        const total = Number(row.total_cases ?? 0);
        
        // If no data in database, fall back to localStorage
        if (total === 0) {
          console.log('📊 No data in database, falling back to localStorage analytics');
          setUseDatabase(false);
          setLoading(false);
          return;
        }

        const st = row.status_breakdown ?? {};
        const br = row.branch_breakdown ?? {};
        const hosp = row.hospital_breakdown ?? {};
        const spec = row.specialty_breakdown ?? {};

        // MCJ1/MCJ2 (from Branch column)
        const mcj1 = Object.entries(br).reduce((acc, [k, v]) => /\bmcj\s*1\b/i.test(k) ? acc + (v ?? 0) : acc, 0);
        const mcj2 = Object.entries(br).reduce((acc, [k, v]) => /\bmcj\s*2\b/i.test(k) ? acc + (v ?? 0) : acc, 0);

        // "Done" = Completed + Scheduled + Planned NVD
        const done =
          pickFirst(st, STATUS.completed) +
          pickFirst(st, STATUS.scheduled) +
          pickFirst(st, STATUS.plannedNVD);
        const conversionRate = total ? Math.round((done / total) * 100) : 0;

        // Loss tree groupings
        const cancelledTotal = sumKeys(st, STATUS.cancelledAny);
        const cancelledBreakdown = Object.fromEntries(STATUS.cancelledAny
          .filter(k => (st[k] ?? 0) > 0)
          .map(k => [k, st[k]]));
        const pendingKeys = Object.keys(st).filter(k =>
          ![...STATUS.completed, ...STATUS.scheduled, ...STATUS.plannedNVD, ...STATUS.cancelledAny].some(x =>
            new RegExp(`^${x}$`, "i").test(k)
          )
        );
        const pendingBreakdown = Object.fromEntries(pendingKeys.map(k => [k, st[k] ?? 0]));
        const pendingTotal = pendingKeys.reduce((a, k) => a + (st[k] ?? 0), 0);

        console.log(`📊 Database analytics: ${total} total cases for ${year}-${month.toString().padStart(2, '0')}`);

        setMetrics({
          totalCases: total,
          mcj1Cases: mcj1,
          mcj2Cases: mcj2,
          doneCases: done,
          conversionRate,
          topHospitals: topN(hosp, 5),
          topSpecialties: topN(spec, 5),
          lossTree: {
            cancelledTotal,
            cancelledBreakdown,
            pendingTotal,
            pendingBreakdown
          },
          // Excel-only slice doesn't include revenue or history; keep safe defaults
          revenue: { paidCount: 0, paidPercentage: 0, paidSum: 0, mtdGrowth: 0 },
          conversionHistory: [],
        });

        setLoading(false);
      } catch (err) {
        if (cancel) return;
        console.error('Analytics error:', err);
        setError(`Failed to fetch analytics: ${err instanceof Error ? err.message : 'Unknown error'}. Falling back to localStorage.`);
        setUseDatabase(false);
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [year, month, nonce, useDatabase]);
  
  // Use localStorage analytics when database is not available
  useEffect(() => {
    if (!useDatabase && !localStorageAnalytics.loading) {
      const { metrics: localMetrics } = localStorageAnalytics;
      
      // Transform localStorage metrics to match SIAMetrics interface
      const st = localMetrics.byStatus;
      const br = localMetrics.byBranch; 
      const hosp = localMetrics.byHospital;
      const spec = localMetrics.bySpecialty;
      
      // MCJ1/MCJ2 (from Branch column)
      const mcj1 = Object.entries(br).reduce((acc, [k, v]) => /\bmcj\s*1\b/i.test(k) ? acc + (v ?? 0) : acc, 0);
      const mcj2 = Object.entries(br).reduce((acc, [k, v]) => /\bmcj\s*2\b/i.test(k) ? acc + (v ?? 0) : acc, 0);

      // "Done" = Completed + Scheduled + Planned NVD
      const done =
        pickFirst(st, STATUS.completed) +
        pickFirst(st, STATUS.scheduled) +
        pickFirst(st, STATUS.plannedNVD);
      const conversionRate = localMetrics.totalCases ? Math.round((done / localMetrics.totalCases) * 100) : 0;

      // Loss tree groupings
      const cancelledTotal = sumKeys(st, STATUS.cancelledAny);
      const cancelledBreakdown = Object.fromEntries(STATUS.cancelledAny
        .filter(k => (st[k] ?? 0) > 0)
        .map(k => [k, st[k]]));
      const pendingKeys = Object.keys(st).filter(k =>
        ![...STATUS.completed, ...STATUS.scheduled, ...STATUS.plannedNVD, ...STATUS.cancelledAny].some(x =>
          new RegExp(`^${x}$`, "i").test(k)
        )
      );
      const pendingBreakdown = Object.fromEntries(pendingKeys.map(k => [k, st[k] ?? 0]));
      const pendingTotal = pendingKeys.reduce((a, k) => a + (st[k] ?? 0), 0);
      
      console.log(`📊 localStorage analytics: ${localMetrics.totalCases} total cases for ${year}-${month.toString().padStart(2, '0')}`);
      
      setMetrics({
        totalCases: localMetrics.totalCases,
        mcj1Cases: mcj1,
        mcj2Cases: mcj2,
        doneCases: done,
        conversionRate,
        topHospitals: topN(hosp, 5),
        topSpecialties: topN(spec, 5),
        lossTree: {
          cancelledTotal,
          cancelledBreakdown,
          pendingTotal,
          pendingBreakdown
        },
        revenue: { paidCount: 0, paidPercentage: 0, paidSum: 0, mtdGrowth: 0 },
        conversionHistory: [],
      });
      setLoading(false);
    }
  }, [useDatabase, localStorageAnalytics.metrics, localStorageAnalytics.loading, year, month]);

  return { 
    metrics, 
    loading: loading || localStorageAnalytics.loading, 
    error, 
    refetch: () => {
      setUseDatabase(true);
      refetch();
    },
    usingLocalStorage: !useDatabase
  };
}