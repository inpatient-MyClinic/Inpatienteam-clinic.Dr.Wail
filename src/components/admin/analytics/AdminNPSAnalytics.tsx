
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, BarChart3 } from "lucide-react";
import * as XLSX from "xlsx";
import { getPrintHeaderHtml } from "@/utils/logoUtils";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface AdminNPSAnalyticsProps {
  data: any[];
}

export default function AdminNPSAnalytics({ data }: AdminNPSAnalyticsProps) {
  const [filterBy, setFilterBy] = useState<"specialty" | "doctor">("specialty");
  const [selectedHospital, setSelectedHospital] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");

  // Load customer care data
  const customerCareData = useMemo(() => {
    const saved = localStorage.getItem("customerCareData");
    return saved ? JSON.parse(saved) : [];
  }, []);

  const hospitals = useMemo(() => [...new Set(data.map((d: any) => d.hospital).filter(Boolean))].sort(), [data]);

  // Calculate NPS per specialty or doctor from customer care data + admin data
  const npsBreakdown = useMemo(() => {
    let ccData = customerCareData;
    if (selectedHospital !== "all") ccData = ccData.filter((r: any) => r.Hospital === selectedHospital);
    if (selectedPeriod !== "ytd") ccData = ccData.filter((r: any) => r.Month === selectedPeriod);

    const groupField = filterBy === "specialty" ? "Specialty" : "Doctor";
    const groups: Record<string, { promoters: number; detractors: number; passives: number; responses: number; total: number }> = {};

    // From customer care survey data
    ccData.forEach((r: any) => {
      const group = r[groupField] || r.specialty || r.doctor || "Unknown";
      const score = Number(r["On a scale of 1-10, how likely are you to recommend My Clinic? (NPS)"]);
      if (isNaN(score)) return;

      if (!groups[group]) groups[group] = { promoters: 0, detractors: 0, passives: 0, responses: 0, total: 0 };
      groups[group].responses++;
      groups[group].total++;
      if (score >= 9) groups[group].promoters++;
      else if (score <= 6) groups[group].detractors++;
      else groups[group].passives++;
    });

    // Also try to derive from admin data specialties/doctors
    let adminFiltered = data;
    if (selectedHospital !== "all") adminFiltered = adminFiltered.filter((d: any) => d.hospital === selectedHospital);

    if (Object.keys(groups).length === 0) {
      const field = filterBy === "specialty" ? "specialty" : "user";
      adminFiltered.forEach((d: any) => {
        const group = d[field] || "Unknown";
        if (!groups[group]) groups[group] = { promoters: 0, detractors: 0, passives: 0, responses: 0, total: 0 };
        groups[group].total++;
      });
    }

    return Object.entries(groups)
      .map(([name, d]) => ({
        name,
        nps: d.responses > 0 ? Math.round(((d.promoters - d.detractors) / d.responses) * 100) : 0,
        ...d,
      }))
      .sort((a, b) => b.nps - a.nps);
  }, [customerCareData, data, filterBy, selectedHospital, selectedPeriod]);

  const targetNPS = (() => {
    const saved = localStorage.getItem("npsTargets");
    if (saved) { try { return JSON.parse(saved).customerCare || 75; } catch { return 75; } }
    return 75;
  })();

  const exportExcel = () => {
    const exportData = npsBreakdown.map(d => ({
      [filterBy === "specialty" ? "Specialty" : "Doctor"]: d.name,
      "NPS Score": d.nps,
      Promoters: d.promoters,
      Passives: d.passives,
      Detractors: d.detractors,
      Responses: d.responses,
      "Total Patients": d.total,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `NPS by ${filterBy}`);
    XLSX.writeFile(wb, `Admin_NPS_${filterBy}_${selectedPeriod}.xlsx`);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>NPS by ${filterBy}</title>
      <style>
        body { font-family: Arial; padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #1e40af; color: white; }
        .good { color: green; font-weight: bold; } .bad { color: red; font-weight: bold; }
      </style></head><body>
      ${getPrintHeaderHtml(`NPS Performance by ${filterBy === "specialty" ? "Specialty" : "Doctor"}`)}
      <p><strong>Period:</strong> ${selectedPeriod === "ytd" ? "Year to Date" : selectedPeriod} | <strong>Hospital:</strong> ${selectedHospital === "all" ? "All" : selectedHospital}</p>
      <table>
        <thead><tr><th>${filterBy === "specialty" ? "Specialty" : "Doctor"}</th><th>NPS</th><th>Promoters</th><th>Passives</th><th>Detractors</th><th>Responses</th></tr></thead>
        <tbody>${npsBreakdown.map(d => `<tr><td>${d.name}</td><td class="${d.nps >= targetNPS ? 'good' : 'bad'}">${d.nps}</td><td>${d.promoters}</td><td>${d.passives}</td><td>${d.detractors}</td><td>${d.responses}</td></tr>`).join("")}</tbody>
      </table>
      <p style="text-align:center;margin-top:30px;color:#999;font-size:10px;">Generated ${new Date().toLocaleDateString()} — My Clinic</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> NPS by {filterBy === "specialty" ? "Specialty" : "Doctor"}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={exportExcel}><Download className="w-4 h-4 mr-1" />Excel</Button>
            <Button size="sm" variant="outline" onClick={exportPDF}><FileText className="w-4 h-4 mr-1" />PDF</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <Select value={filterBy} onValueChange={v => setFilterBy(v as any)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="specialty">By Specialty</SelectItem>
              <SelectItem value="doctor">By Doctor</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hospitals</SelectItem>
              {hospitals.map(h => <SelectItem key={h as string} value={h as string}>{h as string}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">YTD</SelectItem>
              {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead>{filterBy === "specialty" ? "Specialty" : "Doctor"}</TableHead>
                <TableHead className="text-center">NPS Score</TableHead>
                <TableHead className="text-center">Promoters</TableHead>
                <TableHead className="text-center">Passives</TableHead>
                <TableHead className="text-center">Detractors</TableHead>
                <TableHead className="text-center">Responses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {npsBreakdown.map(d => (
                <TableRow key={d.name}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={d.nps >= targetNPS ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{d.nps}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-green-600">{d.promoters}</TableCell>
                  <TableCell className="text-center text-yellow-600">{d.passives}</TableCell>
                  <TableCell className="text-center text-red-600">{d.detractors}</TableCell>
                  <TableCell className="text-center">{d.responses}</TableCell>
                </TableRow>
              ))}
              {npsBreakdown.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No NPS data available. Upload survey data in Customer Care dashboard first.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
