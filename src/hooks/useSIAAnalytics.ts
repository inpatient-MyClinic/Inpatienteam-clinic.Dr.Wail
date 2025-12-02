import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useRawExcelAnalytics } from './useRawExcelAnalytics';

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
  revenue: { paidCount: number; paidPercentage: number; paidSum: number; mtdGrowth?: number };
  conversionHistory: Array<{ month: string; conversionRate: number; totalCases?: number; doneCases?: number }>;
}

// helpers
const topN = (obj: Record<string, number>, n = 5): TopItem[] =>
  Object.entries(obj)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);

// status synonyms
const STATUS = {
  completed: ["Completed", "Done"],
  scheduled: ["Scheduled"],
  plannedNVD: ["Planned NVD", "Planned nvd", "Planned\nNVD"],
  cancelledAny: ["Cancelled", "Canceled", "Case Canceled", "Case Cancelled", "Rejected"],
};

// ---------- The hook your UI already uses ----------
export function useSIAAnalytics(filters: any) {
  const now = new Date();
  
  // Handle filters.month which can be a Date object or numbers
  let year: number;
  let month: number; // 1..12
  
  if (filters?.month instanceof Date) {
    year = filters.month.getFullYear();
    month = filters.month.getMonth() + 1;
  } else {
    year = Number(filters?.year) || now.getFullYear();
    month = Number(filters?.month) || (now.getMonth() + 1);
  }
  
  console.log(`🎯 SIA Analytics: Using year=${year}, month=${month}`);

  // Use the new raw excel analytics hook
  const rawAnalytics = useRawExcelAnalytics(year, month);

  const [metrics, setMetrics] = useState<SIAMetrics>({
    totalCases: 0, mcj1Cases: 0, mcj2Cases: 0, doneCases: 0, conversionRate: 0,
    topHospitals: [], topSpecialties: [],
    lossTree: { cancelledTotal: 0, cancelledBreakdown: {}, pendingTotal: 0, pendingBreakdown: {} },
    revenue: { paidCount: 0, paidPercentage: 0, paidSum: 0, mtdGrowth: 0 },
    conversionHistory: [],
  });

  useEffect(() => {
    if (rawAnalytics.loading) return;

    const { 
      totalCases, mcj1Cases, mcj2Cases, doneCases, conversionRate,
      statusBreakdown, hospitalBreakdown, specialtyBreakdown 
    } = rawAnalytics.metrics;

    // Calculate loss tree from status breakdown
    const cancelledTotal = Object.entries(statusBreakdown)
      .filter(([k]) => STATUS.cancelledAny.some(s => k.toLowerCase().includes(s.toLowerCase())))
      .reduce((acc, [, v]) => acc + v, 0);
    
    const cancelledBreakdown = Object.fromEntries(
      Object.entries(statusBreakdown)
        .filter(([k]) => STATUS.cancelledAny.some(s => k.toLowerCase().includes(s.toLowerCase())))
    );

    const completedStatuses = [...STATUS.completed, ...STATUS.scheduled, ...STATUS.plannedNVD];
    const pendingBreakdown = Object.fromEntries(
      Object.entries(statusBreakdown)
        .filter(([k]) => 
          !STATUS.cancelledAny.some(s => k.toLowerCase().includes(s.toLowerCase())) &&
          !completedStatuses.some(s => k.toLowerCase().includes(s.toLowerCase()))
        )
    );
    const pendingTotal = Object.values(pendingBreakdown).reduce((a, b) => a + b, 0);

    setMetrics({
      totalCases,
      mcj1Cases,
      mcj2Cases,
      doneCases,
      conversionRate,
      topHospitals: topN(hospitalBreakdown, 5),
      topSpecialties: topN(specialtyBreakdown, 5),
      lossTree: {
        cancelledTotal,
        cancelledBreakdown,
        pendingTotal,
        pendingBreakdown
      },
      revenue: { paidCount: 0, paidPercentage: 0, paidSum: 0, mtdGrowth: 0 },
      conversionHistory: [],
    });
  }, [rawAnalytics.metrics, rawAnalytics.loading]);

  return { 
    metrics, 
    loading: rawAnalytics.loading, 
    error: rawAnalytics.error, 
    refetch: rawAnalytics.refetch,
    usingLocalStorage: false
  };
}