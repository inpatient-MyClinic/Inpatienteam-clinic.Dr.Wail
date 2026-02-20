import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Download, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import { getPrintHeaderHtml } from "@/utils/logoUtils";

interface FinanceRecord {
  id: string;
  patientName: string;
  patientId: string;
  hospital: string;
  procedure: string;
  procedureDate: string;
  splitShare: number;
  splitPercentage: number;
  doctorType: "FT" | "PT";
  status: "paid" | "pending";
}

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Sample data for demonstration
const sampleRecords: FinanceRecord[] = [
  { id: "F1", patientName: "Ahmed Ali", patientId: "MRN-2001", hospital: "King Fahad Hospital", procedure: "Knee Replacement", procedureDate: "2026-01-15", splitShare: 32895, splitPercentage: 85, doctorType: "PT", status: "paid" },
  { id: "F2", patientName: "Mohammed Saleh", patientId: "MRN-2005", hospital: "Dr. Soliman Fakeeh Hospital", procedure: "Hip Replacement", procedureDate: "2026-01-22", splitShare: 27922.5, splitPercentage: 85, doctorType: "PT", status: "paid" },
  { id: "F3", patientName: "Sara Ahmed", patientId: "MRN-3001", hospital: "King Fahad Hospital", procedure: "ACL Reconstruction", procedureDate: "2026-02-05", splitShare: 18500, splitPercentage: 85, doctorType: "PT", status: "pending" },
];

interface DoctorFinanceReportProps {
  currentDoctorName: string;
}

export default function DoctorFinanceReport({ currentDoctorName }: DoctorFinanceReportProps) {
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  // Filter records for current doctor only
  const records = sampleRecords.filter(r => 
    currentDoctorName === "Doctor" || 
    r.patientName.toLowerCase().includes(currentDoctorName.toLowerCase()) ||
    true // In production, filter by actual doctor association
  );

  const totalPaid = records.filter(r => r.status === "paid").reduce((s, r) => s + r.splitShare, 0);
  const totalPending = records.filter(r => r.status === "pending").reduce((s, r) => s + r.splitShare, 0);

  const exportExcel = () => {
    const data = records.map(r => ({
      "Patient Name": r.patientName,
      "Patient ID": r.patientId,
      Hospital: r.hospital,
      Procedure: r.procedure,
      "Procedure Date": r.procedureDate,
      "Doctor Type": r.doctorType,
      "Split %": `${r.splitPercentage}%`,
      "Split Amount (SAR)": r.splitShare,
      Status: r.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finance Report");
    XLSX.writeFile(wb, `Doctor_Finance_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Doctor Finance Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #1e40af; color: white; }
        .summary { margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; }
        .paid { color: green; font-weight: bold; }
        .pending { color: orange; font-weight: bold; }
      </style></head><body>
      ${getPrintHeaderHtml('Doctor Monthly Finance Report')}
      <p><strong>Doctor:</strong> ${currentDoctorName} | <strong>Period:</strong> ${selectedMonth} ${selectedYear}</p>
      <table>
        <thead><tr><th>Patient Name</th><th>Patient ID</th><th>Hospital</th><th>Procedure</th><th>Date</th><th>Type</th><th>Split %</th><th>Amount (SAR)</th><th>Status</th></tr></thead>
        <tbody>${records.map(r => `<tr><td>${r.patientName}</td><td>${r.patientId}</td><td>${r.hospital}</td><td>${r.procedure}</td><td>${r.procedureDate}</td><td>${r.doctorType}</td><td>${r.splitPercentage}%</td><td>${r.splitShare.toLocaleString()}</td><td class="${r.status}">${r.status}</td></tr>`).join("")}</tbody>
      </table>
      <div class="summary">
        <p><strong>Total Paid:</strong> SAR ${totalPaid.toLocaleString()} | <strong>Total Pending:</strong> SAR ${totalPending.toLocaleString()} | <strong>Grand Total:</strong> SAR ${(totalPaid + totalPending).toLocaleString()}</p>
      </div>
      <p style="text-align:center;margin-top:40px;color:#999;font-size:11px;">Generated on ${new Date().toLocaleDateString()} — My Clinic</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Finance Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Monthly Finance Report — {currentDoctorName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-center mb-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{["2025","2026","2027"].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={exportExcel}><Download className="w-4 h-4 mr-1" />Excel</Button>
            <Button variant="outline" size="sm" onClick={exportPDF}><FileText className="w-4 h-4 mr-1" />PDF</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-700 font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-green-800">SAR {totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-sm text-yellow-700 font-medium">Total Pending</p>
            <p className="text-2xl font-bold text-yellow-800">SAR {totalPending.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-700 font-medium">Grand Total</p>
            <p className="text-2xl font-bold text-blue-800">SAR {(totalPaid + totalPending).toLocaleString()}</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead>Patient Name</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Split %</TableHead>
                <TableHead className="text-right">Amount (SAR)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.patientName}</TableCell>
                  <TableCell>{r.patientId}</TableCell>
                  <TableCell>{r.hospital}</TableCell>
                  <TableCell>{r.procedure}</TableCell>
                  <TableCell>{r.procedureDate}</TableCell>
                  <TableCell><Badge variant="outline">{r.doctorType}</Badge></TableCell>
                  <TableCell className="text-right">{r.splitPercentage}%</TableCell>
                  <TableCell className="text-right font-medium">{r.splitShare.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={r.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-gray-500">No records for this period</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
