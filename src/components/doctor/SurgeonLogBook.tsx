import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Printer } from "lucide-react";
import { getPrintHeaderHtml } from "@/utils/logoUtils";

interface LogEntry {
  id: string;
  procedureDate: string;
  patientName: string;
  patientId: string;
  procedureName: string;
  hospital: string;
  status: "completed" | "pending";
}

interface SurgeonLogBookProps {
  entries: LogEntry[];
  doctorName: string;
}

export default function SurgeonLogBook({ entries, doctorName }: SurgeonLogBookProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [procedureFilter, setProcedureFilter] = useState("");

  const uniqueHospitals = useMemo(() => [...new Set(entries.map(e => e.hospital).filter(Boolean))], [entries]);
  const uniqueProcedures = useMemo(() => [...new Set(entries.map(e => e.procedureName).filter(Boolean))], [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (dateFrom && entry.procedureDate < dateFrom) return false;
      if (dateTo && entry.procedureDate > dateTo) return false;
      if (hospitalFilter !== "all" && entry.hospital !== hospitalFilter) return false;
      if (procedureFilter && !entry.procedureName.toLowerCase().includes(procedureFilter.toLowerCase())) return false;
      return true;
    });
  }, [entries, dateFrom, dateTo, hospitalFilter, procedureFilter]);

  const printLogBook = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Surgeon Log Book</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 900px; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background: #1e40af; color: white; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        .summary { margin-top: 15px; font-size: 13px; color: #374151; }
        @media print { body { padding: 15px; } }
      </style></head><body>
      ${getPrintHeaderHtml('Surgeon Log Book')}
      <p style="text-align:center;font-size:12px;color:#666;">Doctor: ${doctorName} | Generated: ${new Date().toLocaleDateString()}</p>
      <p class="summary">Total Procedures: ${filteredEntries.length} | 
        Completed: ${filteredEntries.filter(e => e.status === 'completed').length} | 
        Pending: ${filteredEntries.filter(e => e.status === 'pending').length}
      </p>
      <table>
        <thead><tr>
          <th>#</th><th>Date</th><th>Patient Name</th><th>Patient ID</th><th>Procedure</th><th>Hospital</th><th>Status</th>
        </tr></thead>
        <tbody>
        ${filteredEntries.map((e, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${e.procedureDate}</td>
            <td>${e.patientName}</td>
            <td>${e.patientId}</td>
            <td>${e.procedureName}</td>
            <td>${e.hospital}</td>
            <td>${e.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</td>
          </tr>
        `).join('')}
        </tbody>
      </table>
      <div class="footer"><p>Surgeon Log Book — ${doctorName} — Confidential Medical Record</p></div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Surgeon Log Book
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Surgeon Log Book — {doctorName}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <Label className="text-xs">From Date</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To Date</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Hospital</Label>
            <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hospitals</SelectItem>
                {uniqueHospitals.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Procedure</Label>
            <Input placeholder="Search procedure..." value={procedureFilter} onChange={e => setProcedureFilter(e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        <div className="flex gap-3 mb-3">
          <Badge variant="secondary">Total: {filteredEntries.length}</Badge>
          <Badge className="bg-green-100 text-green-800">Completed: {filteredEntries.filter(e => e.status === 'completed').length}</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">Pending: {filteredEntries.filter(e => e.status === 'pending').length}</Badge>
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={printLogBook}>
              <Printer className="w-4 h-4 mr-1" /> Print Log Book
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead>#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry, i) => (
                <TableRow key={entry.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{entry.procedureDate}</TableCell>
                  <TableCell className="font-medium">{entry.patientName}</TableCell>
                  <TableCell>{entry.patientId}</TableCell>
                  <TableCell>{entry.procedureName}</TableCell>
                  <TableCell>{entry.hospital}</TableCell>
                  <TableCell>
                    <Badge className={entry.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {entry.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEntries.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No log entries found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
