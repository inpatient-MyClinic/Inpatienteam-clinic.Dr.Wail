
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Download, FileText, Plus, Users, BarChart3 } from "lucide-react";
import * as XLSX from "xlsx";
import { getPrintHeaderHtml } from "@/utils/logoUtils";
import { hospitals as masterHospitalList } from "@/data/medicalData";

interface NPSEntry {
  hospital: string;
  month: string;
  year: number;
  totalPatientsDone: number;
  totalSurveysSent: number;
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
  complaintsCount: number;
  complaintsClosed: number;
}

interface NPSPerformanceDashboardProps {
  requests: any[];
  targetNPS: number;
}

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function NPSPerformanceDashboard({ requests, targetNPS }: NPSPerformanceDashboardProps) {
  const [selectedHospital, setSelectedHospital] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ytd");
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [entryForm, setEntryForm] = useState({
    hospital: "",
    month: months[new Date().getMonth()],
    year: new Date().getFullYear(),
    totalPatientsDone: 0,
    totalSurveysSent: 0,
    totalResponses: 0,
    promoters: 0,
    passives: 0,
    detractors: 0,
    complaintsCount: 0,
    complaintsClosed: 0,
  });

  // Load saved NPS entries from localStorage
  const [npsEntries, setNpsEntries] = useState<NPSEntry[]>(() => {
    const saved = localStorage.getItem("npsMonthlyEntries");
    return saved ? JSON.parse(saved) : [];
  });

  // Use master hospital list, supplemented by any from entries/requests
  const hospitals = useMemo(() => {
    const fromRequests = requests.map(r => r.Hospital).filter(Boolean);
    const fromEntries = npsEntries.map(e => e.hospital);
    return [...new Set([...masterHospitalList, ...fromRequests, ...fromEntries])].sort();
  }, [requests, npsEntries]);

  // Calculate NPS from requests data per hospital
  const calculateNPSFromRequests = (data: any[], hospital?: string) => {
    const filtered = hospital && hospital !== "all" 
      ? data.filter(r => r.Hospital === hospital) 
      : data;
    
    const responded = filtered.filter(r => {
      const score = r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"];
      return score !== undefined && score !== null && score !== "";
    });

    if (responded.length === 0) return { nps: 0, promoters: 0, passives: 0, detractors: 0, total: 0, responses: responded.length };

    const promoters = responded.filter(r => Number(r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"]) >= 9).length;
    const detractors = responded.filter(r => Number(r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"]) <= 6).length;
    const passives = responded.length - promoters - detractors;
    const nps = Math.round(((promoters - detractors) / responded.length) * 100);

    return { nps, promoters, passives, detractors, total: filtered.length, responses: responded.length };
  };

  // Filter entries by hospital and period
  const filteredEntries = useMemo(() => {
    let entries = [...npsEntries];
    if (selectedHospital !== "all") {
      entries = entries.filter(e => e.hospital === selectedHospital);
    }
    if (selectedPeriod !== "ytd") {
      entries = entries.filter(e => e.month === selectedPeriod);
    }
    return entries;
  }, [npsEntries, selectedHospital, selectedPeriod]);

  // Calculate aggregate NPS
  const aggregateNPS = useMemo(() => {
    if (filteredEntries.length === 0) {
      return calculateNPSFromRequests(requests, selectedHospital !== "all" ? selectedHospital : undefined);
    }
    const totalResponses = filteredEntries.reduce((s, e) => s + e.totalResponses, 0);
    const totalPromoters = filteredEntries.reduce((s, e) => s + e.promoters, 0);
    const totalDetractors = filteredEntries.reduce((s, e) => s + e.detractors, 0);
    const totalPassives = filteredEntries.reduce((s, e) => s + e.passives, 0);
    const nps = totalResponses > 0 ? Math.round(((totalPromoters - totalDetractors) / totalResponses) * 100) : 0;
    return { nps, promoters: totalPromoters, passives: totalPassives, detractors: totalDetractors, total: filteredEntries.reduce((s, e) => s + e.totalPatientsDone, 0), responses: totalResponses };
  }, [filteredEntries, requests, selectedHospital]);

  // NPS per hospital breakdown
  const npsPerHospital = useMemo(() => {
    const hospitalMap: Record<string, { promoters: number; detractors: number; responses: number; total: number }> = {};
    
    if (npsEntries.length > 0) {
      const entries = selectedPeriod !== "ytd" ? npsEntries.filter(e => e.month === selectedPeriod) : npsEntries;
      entries.forEach(e => {
        if (!hospitalMap[e.hospital]) hospitalMap[e.hospital] = { promoters: 0, detractors: 0, responses: 0, total: 0 };
        hospitalMap[e.hospital].promoters += e.promoters;
        hospitalMap[e.hospital].detractors += e.detractors;
        hospitalMap[e.hospital].responses += e.totalResponses;
        hospitalMap[e.hospital].total += e.totalPatientsDone;
      });
    } else {
      hospitals.forEach(h => {
        const result = calculateNPSFromRequests(requests, h);
        hospitalMap[h] = { promoters: result.promoters, detractors: result.detractors, responses: result.responses, total: result.total };
      });
    }

    return Object.entries(hospitalMap).map(([hospital, data]) => ({
      hospital,
      nps: data.responses > 0 ? Math.round(((data.promoters - data.detractors) / data.responses) * 100) : 0,
      ...data,
    })).sort((a, b) => b.nps - a.nps);
  }, [npsEntries, hospitals, requests, selectedPeriod]);

  const saveEntry = () => {
    const npsScore = entryForm.totalResponses > 0 
      ? Math.round(((entryForm.promoters - entryForm.detractors) / entryForm.totalResponses) * 100) 
      : 0;

    const newEntry: NPSEntry = {
      hospital: entryForm.hospital,
      month: entryForm.month,
      year: entryForm.year,
      totalPatientsDone: entryForm.totalPatientsDone,
      totalSurveysSent: entryForm.totalSurveysSent,
      totalResponses: entryForm.totalResponses,
      promoters: entryForm.promoters,
      passives: entryForm.passives,
      detractors: entryForm.detractors,
      npsScore,
      complaintsCount: entryForm.complaintsCount,
      complaintsClosed: entryForm.complaintsClosed,
    };

    const updated = [...npsEntries.filter(e => !(e.hospital === newEntry.hospital && e.month === newEntry.month && e.year === newEntry.year)), newEntry];
    setNpsEntries(updated);
    localStorage.setItem("npsMonthlyEntries", JSON.stringify(updated));
    setShowEntryDialog(false);
  };

  // Get complaints for filtered data
  const getComplaints = () => {
    let data = requests;
    if (selectedHospital !== "all") data = data.filter(r => r.Hospital === selectedHospital);
    return data.filter(r => {
      const comment = r["Comments/Suggestions"];
      return comment && comment !== "No Comment" && comment !== "No" && comment.trim() !== "";
    });
  };

  const exportExcel = () => {
    const complaints = getComplaints();
    const exportData = complaints.map(r => ({
      Month: r.Month || "",
      MRN: r.MRN || "",
      Hospital: r.Hospital || "",
      "NPS Score": r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"] || "",
      "Overall Rating": r["On a scale of 1-5, how would you rate your overall experience?"] || "",
      "Comments/Suggestions": r["Comments/Suggestions"] || "",
      "Complaint Status": r.complaintStatus || "N/A",
    }));

    // Add NPS summary sheet
    const npsData = npsPerHospital.map(h => ({
      Hospital: h.hospital,
      "NPS Score": h.nps,
      Promoters: h.promoters,
      Detractors: h.detractors,
      "Total Responses": h.responses,
      "Total Patients": h.total,
      "Response Rate": h.total > 0 ? `${Math.round((h.responses / h.total) * 100)}%` : "0%",
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(npsData);
    XLSX.utils.book_append_sheet(wb, ws1, "NPS Summary");
    const ws2 = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws2, "Patient Responses");
    XLSX.writeFile(wb, `NPS_Report_${selectedHospital === "all" ? "All_Hospitals" : selectedHospital}_${selectedPeriod}.xlsx`);
  };

  const exportPDF = () => {
    const complaints = getComplaints();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html><head><title>NPS Performance Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #1e40af; color: white; }
        .summary { display: flex; gap: 20px; margin: 15px 0; }
        .metric { padding: 15px; background: #f0f9ff; border-radius: 8px; text-align: center; flex: 1; }
        .nps-good { color: #16a34a; } .nps-bad { color: #dc2626; }
        h2 { color: #1e3a8a; margin-top: 25px; }
      </style></head><body>
      ${getPrintHeaderHtml("NPS Performance Report")}
      <p><strong>Hospital:</strong> ${selectedHospital === "all" ? "All Hospitals" : selectedHospital} | <strong>Period:</strong> ${selectedPeriod === "ytd" ? "Year to Date" : selectedPeriod}</p>
      
      <div class="summary">
        <div class="metric"><div>NPS Score</div><div style="font-size:28px;font-weight:bold" class="${aggregateNPS.nps >= targetNPS ? 'nps-good' : 'nps-bad'}">${aggregateNPS.nps}</div></div>
        <div class="metric"><div>Promoters</div><div style="font-size:28px;font-weight:bold;color:#16a34a">${aggregateNPS.promoters}</div></div>
        <div class="metric"><div>Passives</div><div style="font-size:28px;font-weight:bold;color:#ca8a04">${aggregateNPS.passives}</div></div>
        <div class="metric"><div>Detractors</div><div style="font-size:28px;font-weight:bold;color:#dc2626">${aggregateNPS.detractors}</div></div>
      </div>

      <h2>NPS by Hospital</h2>
      <table>
        <thead><tr><th>Hospital</th><th>NPS</th><th>Promoters</th><th>Detractors</th><th>Responses</th><th>Response Rate</th></tr></thead>
        <tbody>${npsPerHospital.map(h => `<tr><td>${h.hospital}</td><td class="${h.nps >= targetNPS ? 'nps-good' : 'nps-bad'}">${h.nps}</td><td>${h.promoters}</td><td>${h.detractors}</td><td>${h.responses}</td><td>${h.total > 0 ? Math.round((h.responses / h.total) * 100) : 0}%</td></tr>`).join("")}</tbody>
      </table>

      <h2>Patient Responses & Complaints (${complaints.length})</h2>
      <table>
        <thead><tr><th>MRN</th><th>Hospital</th><th>NPS</th><th>Rating</th><th>Comments</th></tr></thead>
        <tbody>${complaints.slice(0, 100).map(r => `<tr><td>${r.MRN || ""}</td><td>${r.Hospital || ""}</td><td>${r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"] || ""}</td><td>${r["On a scale of 1-5, how would you rate your overall experience?"] || ""}</td><td>${(r["Comments/Suggestions"] || "").substring(0, 100)}</td></tr>`).join("")}</tbody>
      </table>

      <p style="text-align:center;margin-top:30px;color:#999;font-size:10px;">NPS Formula: (% Promoters - % Detractors) × 100 | Standard Scale: Promoters (9-10), Passives (7-8), Detractors (0-6)<br/>Generated ${new Date().toLocaleDateString()} — My Clinic</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> NPS Performance Dashboard</span>
            <div className="flex gap-2">
              <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />Add Monthly Entry</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Add Monthly NPS Entry</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Hospital</Label>
                      <Select value={entryForm.hospital} onValueChange={v => setEntryForm(f => ({ ...f, hospital: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select hospital" /></SelectTrigger>
                        <SelectContent>
                          {hospitals.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Month</Label>
                      <Select value={entryForm.month} onValueChange={v => setEntryForm(f => ({ ...f, month: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Total Patients Done</Label><Input type="number" value={entryForm.totalPatientsDone} onChange={e => setEntryForm(f => ({ ...f, totalPatientsDone: +e.target.value }))} /></div>
                    <div><Label>Total Responses</Label><Input type="number" value={entryForm.totalResponses} onChange={e => setEntryForm(f => ({ ...f, totalResponses: +e.target.value }))} /></div>
                    <div><Label>Promoters (9-10)</Label><Input type="number" value={entryForm.promoters} onChange={e => setEntryForm(f => ({ ...f, promoters: +e.target.value }))} /></div>
                    <div><Label>Passives (7-8)</Label><Input type="number" value={entryForm.passives} onChange={e => setEntryForm(f => ({ ...f, passives: +e.target.value }))} /></div>
                    <div><Label>Detractors (0-6)</Label><Input type="number" value={entryForm.detractors} onChange={e => setEntryForm(f => ({ ...f, detractors: +e.target.value }))} /></div>
                    <div><Label>Complaints</Label><Input type="number" value={entryForm.complaintsCount} onChange={e => setEntryForm(f => ({ ...f, complaintsCount: +e.target.value }))} /></div>
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                    <strong>Calculated NPS:</strong> {entryForm.totalResponses > 0 ? Math.round(((entryForm.promoters - entryForm.detractors) / entryForm.totalResponses) * 100) : 0}
                    <span className="ml-2 text-xs text-muted-foreground">(Promoters - Detractors) / Responses × 100</span>
                  </div>
                  <Button onClick={saveEntry} disabled={!entryForm.hospital}>Save Entry</Button>
                </DialogContent>
              </Dialog>
              <Button size="sm" variant="outline" onClick={exportExcel}><Download className="w-4 h-4 mr-1" />Excel</Button>
              <Button size="sm" variant="outline" onClick={exportPDF}><FileText className="w-4 h-4 mr-1" />PDF</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <Select value={selectedHospital} onValueChange={setSelectedHospital}>
              <SelectTrigger className="w-52"><SelectValue placeholder="All Hospitals" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hospitals</SelectItem>
                {hospitals.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ytd">Year to Date (YTD)</SelectItem>
                {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* NPS Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="text-center p-4">
              <div className="text-sm text-muted-foreground">NPS Score</div>
              <div className={`text-3xl font-bold ${aggregateNPS.nps >= targetNPS ? "text-green-600" : "text-red-600"}`}>
                {aggregateNPS.nps}
              </div>
              <div className="text-xs text-muted-foreground">Target: {targetNPS}</div>
              {aggregateNPS.nps >= targetNPS ? <TrendingUp className="h-4 w-4 text-green-600 mx-auto mt-1" /> : <TrendingDown className="h-4 w-4 text-red-600 mx-auto mt-1" />}
            </Card>
            <Card className="text-center p-4 bg-green-50">
              <div className="text-sm text-green-700">Promoters (9-10)</div>
              <div className="text-2xl font-bold text-green-800">{aggregateNPS.promoters}</div>
              <div className="text-xs text-green-600">{aggregateNPS.responses > 0 ? `${Math.round((aggregateNPS.promoters / aggregateNPS.responses) * 100)}%` : "0%"}</div>
            </Card>
            <Card className="text-center p-4 bg-yellow-50">
              <div className="text-sm text-yellow-700">Passives (7-8)</div>
              <div className="text-2xl font-bold text-yellow-800">{aggregateNPS.passives}</div>
              <div className="text-xs text-yellow-600">{aggregateNPS.responses > 0 ? `${Math.round((aggregateNPS.passives / aggregateNPS.responses) * 100)}%` : "0%"}</div>
            </Card>
            <Card className="text-center p-4 bg-red-50">
              <div className="text-sm text-red-700">Detractors (0-6)</div>
              <div className="text-2xl font-bold text-red-800">{aggregateNPS.detractors}</div>
              <div className="text-xs text-red-600">{aggregateNPS.responses > 0 ? `${Math.round((aggregateNPS.detractors / aggregateNPS.responses) * 100)}%` : "0%"}</div>
            </Card>
            <Card className="text-center p-4 bg-blue-50">
              <div className="text-sm text-blue-700">Response Rate</div>
              <div className="text-2xl font-bold text-blue-800">{aggregateNPS.total > 0 ? `${Math.round((aggregateNPS.responses / aggregateNPS.total) * 100)}%` : "0%"}</div>
              <div className="text-xs text-blue-600">{aggregateNPS.responses} / {aggregateNPS.total}</div>
            </Card>
          </div>

          {/* NPS per Hospital Table */}
          <h3 className="text-md font-semibold mb-2">NPS by Hospital</h3>
          <div className="border rounded-lg overflow-auto mb-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead>Hospital</TableHead>
                  <TableHead className="text-center">NPS Score</TableHead>
                  <TableHead className="text-center">Promoters</TableHead>
                  <TableHead className="text-center">Detractors</TableHead>
                  <TableHead className="text-center">Responses</TableHead>
                  <TableHead className="text-center">Response Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {npsPerHospital.map(h => (
                  <TableRow key={h.hospital}>
                    <TableCell className="font-medium">{h.hospital}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={h.nps >= targetNPS ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {h.nps}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-green-600">{h.promoters}</TableCell>
                    <TableCell className="text-center text-red-600">{h.detractors}</TableCell>
                    <TableCell className="text-center">{h.responses}</TableCell>
                    <TableCell className="text-center">{h.total > 0 ? `${Math.round((h.responses / h.total) * 100)}%` : "0%"}</TableCell>
                  </TableRow>
                ))}
                {npsPerHospital.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No NPS data yet. Upload survey data or add entries manually.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            NPS = (% Promoters - % Detractors) × 100 | Standard Scale: Promoters (9-10), Passives (7-8), Detractors (0-6) | CHI Saudi & European Guidelines
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
