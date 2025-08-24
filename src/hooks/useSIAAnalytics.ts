import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
  const year  = Number(filters?.year)  || now.getFullYear();
  const month = Number(filters?.month) || (now.getMonth() + 1); // 1..12

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
  const refetch = () => setNonce(n => n + 1);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true); setError(null);

      try {
        // Single source of truth: Excel monthly RPC
        const { data, error } = await supabase.rpc("analyze_excel_cases_monthly", {
          p_year: year, p_month: month
        });

        if (cancel) return;
        if (error) { 
          setError(error.message); 
          setLoading(false); 
          return; 
        }

        const row: ExcelRPCRow = (data ?? [])[0] as any || {
          total_cases: 0, status_breakdown: {}, branch_breakdown: {}, hospital_breakdown: {}, specialty_breakdown: {}
        };

        const total = Number(row.total_cases ?? 0);
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
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [year, month, nonce]);

  return { metrics, loading, error, refetch };
}