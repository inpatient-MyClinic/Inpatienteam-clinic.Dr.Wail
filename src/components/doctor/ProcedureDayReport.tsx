import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, FileText, Plus, Eye, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AIRewriteButton from "@/components/AIRewriteButton";

interface ProcedureReport {
  id: string;
  patientName: string;
  patientId: string;
  hospital: string;
  procedureDate: string;
  procedureName: string;
  findings: string;
  postOpDiagnosis: string;
  procedureDescription: string;
  postOpProtocol: string;
  postOpInstructions: string;
  mainHistory: string;
  attachments: string[];
  createdAt: string;
  doctorName: string;
}

interface ProcedureDayReportProps {
  currentDoctorName: string;
  requests: any[];
}

export default function ProcedureDayReport({ currentDoctorName, requests }: ProcedureDayReportProps) {
  const [reports, setReports] = useState<ProcedureReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewReport, setViewReport] = useState<ProcedureReport | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    patientName: "",
    patientId: "",
    hospital: "",
    procedureDate: new Date().toISOString().split("T")[0],
    procedureName: "",
    findings: "",
    postOpDiagnosis: "",
    procedureDescription: "",
    postOpProtocol: "",
    postOpInstructions: "",
    mainHistory: "",
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.patientName || !form.procedureName || !form.findings) {
      toast({ title: "Missing Fields", description: "Please fill patient name, procedure name, and findings", variant: "destructive" });
      return;
    }

    const newReport: ProcedureReport = {
      id: `PR-${Date.now()}`,
      ...form,
      attachments: [],
      createdAt: new Date().toISOString(),
      doctorName: currentDoctorName,
    };

    setReports(prev => [...prev, newReport]);
    setShowForm(false);
    setForm({ patientName: "", patientId: "", hospital: "", procedureDate: new Date().toISOString().split("T")[0], procedureName: "", findings: "", postOpDiagnosis: "", procedureDescription: "", postOpProtocol: "", postOpInstructions: "", mainHistory: "" });
    toast({ title: "Report Saved", description: "Procedure day report saved successfully" });
  };

  const generatePDF = (report: ProcedureReport) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Procedure Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { color: #1e40af; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 4px 0; }
        .section { margin-bottom: 20px; }
        .section h3 { color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; font-size: 14px; text-transform: uppercase; }
        .section p { margin: 4px 0; font-size: 13px; line-height: 1.6; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .field { margin-bottom: 8px; }
        .field label { font-weight: bold; color: #374151; font-size: 12px; }
        .field .value { color: #111; font-size: 13px; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <h1>My Clinic</h1>
        <p>Procedure Day Report</p>
        <p style="font-size:12px;color:#999;">Generated: ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="grid">
        <div class="field"><label>Patient Name:</label><div class="value">${report.patientName}</div></div>
        <div class="field"><label>Patient ID:</label><div class="value">${report.patientId}</div></div>
        <div class="field"><label>Hospital:</label><div class="value">${report.hospital}</div></div>
        <div class="field"><label>Procedure Date:</label><div class="value">${report.procedureDate}</div></div>
        <div class="field"><label>Doctor:</label><div class="value">${report.doctorName}</div></div>
        <div class="field"><label>Procedure:</label><div class="value">${report.procedureName}</div></div>
      </div>

      <div class="section"><h3>Clinical History</h3><p>${report.mainHistory || "N/A"}</p></div>
      <div class="section"><h3>Procedure Name</h3><p>${report.procedureName}</p></div>
      <div class="section"><h3>Procedure Description</h3><p>${report.procedureDescription || "N/A"}</p></div>
      <div class="section"><h3>Findings</h3><p>${report.findings}</p></div>
      <div class="section"><h3>Post-Operative Diagnosis</h3><p>${report.postOpDiagnosis || "N/A"}</p></div>
      <div class="section"><h3>Post-Operative Protocol</h3><p>${report.postOpProtocol || "N/A"}</p></div>
      <div class="section"><h3>Post-Operative Instructions</h3><p>${report.postOpInstructions || "N/A"}</p></div>

      <div class="footer">
        <p>This report was generated by My Clinic System — Confidential Medical Document</p>
        <p>${report.doctorName} — ${report.procedureDate}</p>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const TextFieldWithAI = ({ label, field, rows = 3, context }: { label: string; field: string; rows?: number; context?: string }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label className="text-sm font-medium">{label}</Label>
        <AIRewriteButton
          text={form[field as keyof typeof form]}
          onAccept={(text) => updateField(field, text)}
          context={context || label}
        />
      </div>
      <Textarea
        value={form[field as keyof typeof form]}
        onChange={(e) => updateField(field, e.target.value)}
        rows={rows}
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" /> Procedure Reports
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            Procedure Day Reports
          </DialogTitle>
        </DialogHeader>

        {!showForm && !viewReport && (
          <>
            <Button onClick={() => setShowForm(true)} className="mb-4">
              <Plus className="w-4 h-4 mr-1" /> New Procedure Report
            </Button>

            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead>Patient</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.patientName}</TableCell>
                      <TableCell>{r.patientId}</TableCell>
                      <TableCell>{r.hospital}</TableCell>
                      <TableCell>{r.procedureName}</TableCell>
                      <TableCell>{r.procedureDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => setViewReport(r)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => generatePDF(r)}>
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reports.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No procedure reports yet. Click "New Procedure Report" to add one.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {showForm && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">New Procedure Day Report</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Patient Name *</Label>
                <Input value={form.patientName} onChange={(e) => updateField("patientName", e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium">Patient ID</Label>
                <Input value={form.patientId} onChange={(e) => updateField("patientId", e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium">Hospital</Label>
                <Input value={form.hospital} onChange={(e) => updateField("hospital", e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium">Procedure Date</Label>
                <Input type="date" value={form.procedureDate} onChange={(e) => updateField("procedureDate", e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Procedure Name *</Label>
              <Input value={form.procedureName} onChange={(e) => updateField("procedureName", e.target.value)} />
            </div>

            <TextFieldWithAI label="Clinical History" field="mainHistory" rows={3} context="clinical history" />
            <TextFieldWithAI label="Procedure Description" field="procedureDescription" rows={3} context="procedure description" />
            <TextFieldWithAI label="Findings *" field="findings" rows={3} context="operative findings" />
            <TextFieldWithAI label="Post-Operative Diagnosis" field="postOpDiagnosis" rows={2} context="post-operative diagnosis" />
            <TextFieldWithAI label="Post-Operative Protocol" field="postOpProtocol" rows={3} context="post-operative protocol" />
            <TextFieldWithAI label="Post-Operative Instructions" field="postOpInstructions" rows={3} context="post-operative patient instructions" />

            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-1" /> Save Procedure Report
            </Button>
          </div>
        )}

        {viewReport && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{viewReport.patientName} — {viewReport.procedureName}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => generatePDF(viewReport)}>
                  <FileText className="w-4 h-4 mr-1" /> Export PDF
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setViewReport(null)}>Back</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Patient:</span> {viewReport.patientName}</div>
              <div><span className="font-medium">ID:</span> {viewReport.patientId}</div>
              <div><span className="font-medium">Hospital:</span> {viewReport.hospital}</div>
              <div><span className="font-medium">Date:</span> {viewReport.procedureDate}</div>
              <div><span className="font-medium">Doctor:</span> {viewReport.doctorName}</div>
            </div>

            {[
              { label: "Clinical History", value: viewReport.mainHistory },
              { label: "Procedure", value: viewReport.procedureName },
              { label: "Description", value: viewReport.procedureDescription },
              { label: "Findings", value: viewReport.findings },
              { label: "Post-Op Diagnosis", value: viewReport.postOpDiagnosis },
              { label: "Post-Op Protocol", value: viewReport.postOpProtocol },
              { label: "Post-Op Instructions", value: viewReport.postOpInstructions },
            ].map(s => s.value ? (
              <div key={s.label} className="border-t pt-3">
                <h4 className="text-sm font-semibold text-blue-800 mb-1">{s.label}</h4>
                <p className="text-sm whitespace-pre-wrap">{s.value}</p>
              </div>
            ) : null)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
