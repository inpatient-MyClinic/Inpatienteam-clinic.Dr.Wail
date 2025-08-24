import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileSpreadsheet, Table2, Bug } from "lucide-react";
import { useSIAFilters } from "@/hooks/useSIAFilters";
import { useToast } from "@/hooks/use-toast";

import { useExcelMonthlyAnalytics } from "@/hooks/useExcelMonthlyAnalytics";
import { mapExcelSliceToMetrics } from "@/lib/mapExcelSliceToMetrics";
import { STATUS_KEYS, pickCount } from "@/lib/statusSynonyms";

export default function AdminDashboard() {
  // Direct month/year state (no need to sync with SIA filters for this simpler approach)
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1..12

  // Excel-only analytics for the selected month/year
  const [nonce, setNonce] = useState(0);
  const { data: excelSlice, loading, error } = useExcelMonthlyAnalytics(year, month, nonce);
  const metrics = mapExcelSliceToMetrics(excelSlice);
  const { toast } = useToast();

  // Quick status lookups from the Excel slice
  const st = excelSlice?.byStatus ?? {};
  const totalCases = metrics.totalCases;
  const completed = pickCount(st, STATUS_KEYS.completed);
  const scheduled = pickCount(st, STATUS_KEYS.scheduled);
  const plannedNVD = pickCount(st, STATUS_KEYS.plannedNvd);
  const pending = pickCount(st, STATUS_KEYS.pending);
  const cancelled = STATUS_KEYS.cancelled.reduce((acc, k) => acc + (st[k] ?? 0), 0);

  const refetch = () => setNonce(n => n + 1);

  useEffect(() => {
    // optional: toast on load problems
    if (error) {
      toast({ title: "SIA Excel Analysis Error", description: error, variant: "destructive" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <div className="p-6 space-y-6">
      {/* Top toolbar (keep your existing design; this is a minimal example) */}
      <div className="flex items-center gap-2">
        <select
          className="border rounded px-2 py-1"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          aria-label="Select Month"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i+1} value={i + 1}>{new Date(2000, i, 1).toLocaleString(undefined, { month: "long" })}</option>
          ))}
        </select>
        <input
          className="border rounded px-2 py-1 w-24"
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          aria-label="Select Year"
        />
        <Button variant="outline" onClick={refetch} className="flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Apply
        </Button>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Bug className="h-4 w-4" /> Data Debugger
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" /> Pivot Table
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Excel Analyzer
          </Button>
        </div>
      </div>

      {/* Status Counters Row (Excel-sourced) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Card className="bg-emerald-50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Done/Completed</div>
            <div className="text-2xl font-bold">{completed.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold">{pending.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Scheduled</div>
            <div className="text-2xl font-bold">{scheduled.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Cancelled</div>
            <div className="text-2xl font-bold">{cancelled.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Planned NVD</div>
            <div className="text-2xl font-bold">{plannedNVD.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Requests header — show Excel-slice total instead of stale 213 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Admin Requests</span> —{" "}
          <span>{totalCases.toLocaleString()} total requests</span>
        </div>
      </div>

      {/* Top 5s from Excel slice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Top 5 Hospitals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(metrics.topHospitals ?? []).map(h => (
                <div key={h.name} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{h.name}</span>
                  <Badge variant="secondary">{h.count}</Badge>
                </div>
              ))}
              {(!metrics.topHospitals || metrics.topHospitals.length === 0) && (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top 5 Specialties</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(metrics.topSpecialties ?? []).map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1">{s.name}</span>
                  <Badge variant="secondary">{s.count}</Badge>
                </div>
              ))}
              {(!metrics.topSpecialties || metrics.topSpecialties.length === 0) && (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Conversion</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {(completed + scheduled + plannedNVD).toLocaleString()} of {totalCases.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Errors/Loading feedback */}
      {loading && <div className="text-sm text-muted-foreground">Loading Excel analytics…</div>}
      {error && <div className="text-sm text-destructive">Error: {error}</div>}
    </div>
  );
}
