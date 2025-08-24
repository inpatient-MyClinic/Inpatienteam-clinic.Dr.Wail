import type { ExcelMonthlySlice } from "@/hooks/useExcelMonthlyAnalytics";

type TopItem = { name: string; count: number };
export type UIMetrics = {
  totalCases: number;
  mcj1Cases: number;
  mcj2Cases: number;
  doneCases: number;
  conversionRate: number; // integer %
  topHospitals: TopItem[];
  topSpecialties: TopItem[];
  lossTree: {
    cancelledTotal: number;
    cancelledBreakdown: Record<string, number>;
    pendingTotal: number;
    pendingBreakdown: Record<string, number>;
  };
  revenue: { paidCount: number; paidPercentage: number; paidSum: number };
  conversionHistory: Array<{ month: string; conversionRate: number }>;
};

const sum = (obj: Record<string, number>, keys: string[]) =>
  keys.reduce((acc, k) => acc + (obj[k] ?? 0), 0);

const toTop = (obj: Record<string, number>, n = 5): TopItem[] =>
  Object.entries(obj)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);

export function mapExcelSliceToMetrics(slice: ExcelMonthlySlice | null): UIMetrics {
  const total = slice?.total ?? 0;
  const st = slice?.byStatus ?? {};
  const br = slice?.byBranch ?? {};
  const hosp = slice?.byHospital ?? {};
  const spec = slice?.bySpecialty ?? {};

  // MCJ1/MCJ2 detection (robust)
  const mcj1 = Object.entries(br).reduce((acc, [k, v]) => (/mcj\s*1/i.test(k) ? acc + v : acc), 0);
  const mcj2 = Object.entries(br).reduce((acc, [k, v]) => (/mcj\s*2/i.test(k) ? acc + v : acc), 0);

  // "Done" = Done + Scheduled + Planned NVD (use exact status names)
  const done = st["Done"] ?? 0;
  const scheduled = st["Scheduled"] ?? 0;
  const plannedNVD = st["Planned NVD"] ?? 0;
  const totalDone = done + scheduled + plannedNVD;
  const conversion = total ? Math.round((totalDone / total) * 100) : 0;

  // Loss tree groupings
  const cancelledKeys = Object.keys(st).filter(k => /cancel|reject/i.test(k));
  const pendingKeys = Object.keys(st).filter(
    k => !/^(done|scheduled|planned\s*nvd|completed)$/i.test(k) && !/cancel|reject/i.test(k)
  );

  return {
    totalCases: total,
    mcj1Cases: mcj1,
    mcj2Cases: mcj2,
    doneCases: totalDone,
    conversionRate: conversion,
    topHospitals: toTop(hosp, 5),
    topSpecialties: toTop(spec, 5),
    lossTree: {
      cancelledTotal: sum(st, cancelledKeys),
      cancelledBreakdown: Object.fromEntries(cancelledKeys.map(k => [k, st[k]])),
      pendingTotal: sum(st, pendingKeys),
      pendingBreakdown: Object.fromEntries(pendingKeys.map(k => [k, st[k]])),
    },
    // Not sourced from Excel-only slice; keep safe defaults:
    revenue: { paidCount: 0, paidPercentage: 0, paidSum: 0 },
    conversionHistory: [],
  };
}
