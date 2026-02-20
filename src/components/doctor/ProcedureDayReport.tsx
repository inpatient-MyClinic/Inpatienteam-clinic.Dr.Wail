import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, FileText, Plus, Eye, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPrintHeaderHtml } from "@/utils/logoUtils";
import ProcedureReportForm from "./ProcedureReportForm";
import SurgeonLogBook from "./SurgeonLogBook";

export interface ProcedureReport {
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
  status: "completed" | "pending";
  requestId?: number;
  // Request data for full print
  requestData?: {
    serviceDescription?: string;
    specialty?: string;
    mrn?: string;
    phone?: string;
    expectedSurgeryDate?: string;
    createdBy?: string;
    hospitalName?: string;
  };
}

interface ProcedureDayReportProps {
  currentDoctorName: string;
  requests: any[];
}

const emptyForm = {
  patientName: "", patientId: "", hospital: "",
  procedureDate: new Date().toISOString().split("T")[0],
  procedureName: "", findings: "", postOpDiagnosis: "",
  procedureDescription: "", postOpProtocol: "", postOpInstructions: "", mainHistory: "",
};

export interface ProcedureDayReportHandle {
  createFromRequest: (request: any) => void;
}

const ProcedureDayReport = forwardRef<ProcedureDayReportHandle, ProcedureDayReportProps>(({ currentDoctorName, requests }, ref) => {
  const [reports, setReports] = useState<ProcedureReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewReport, setViewReport] = useState<ProcedureReport | null>(null);
  const [editingReport, setEditingReport] = useState<ProcedureReport | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const { toast } = useToast();

  // Expose createFromRequest to parent via ref
  // useImperativeHandle moved below createFromRequest

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.patientName || !form.procedureName || !form.findings) {
      toast({ title: "Missing Fields", description: "Please fill patient name, procedure name, and findings", variant: "destructive" });
      return;
    }

    if (editingReport) {
      // Complete a pending report
      setReports(prev => prev.map(r => r.id === editingReport.id ? {
        ...r, ...form, status: "completed" as const, createdAt: new Date().toISOString()
      } : r));
      setEditingReport(null);
      toast({ title: "Report Completed", description: "Procedure report has been completed" });
    } else {
      const newReport: ProcedureReport = {
        id: `PR-${Date.now()}`,
        ...form,
        attachments: [],
        createdAt: new Date().toISOString(),
        doctorName: currentDoctorName,
        status: "completed",
      };
      setReports(prev => [...prev, newReport]);
      toast({ title: "Report Saved", description: "Procedure day report saved successfully" });
    }

    setShowForm(false);
    setForm({ ...emptyForm });
  };

  // Create a pending procedure report from request table action
  const createFromRequest = (request: any) => {
    const pendingReport: ProcedureReport = {
      id: `PR-${Date.now()}`,
      patientName: request.patientName || "",
      patientId: request.mrn || "",
      hospital: request.hospital || "",
      procedureDate: new Date().toISOString().split("T")[0],
      procedureName: request.serviceDescription || "",
      findings: "",
      postOpDiagnosis: "",
      procedureDescription: "",
      postOpProtocol: "",
      postOpInstructions: "",
      mainHistory: "",
      attachments: [],
      createdAt: new Date().toISOString(),
      doctorName: currentDoctorName,
      status: "pending",
      requestId: request.id,
      requestData: {
        serviceDescription: request.serviceDescription,
        specialty: request.specialty,
        mrn: request.mrn,
        phone: request.phone,
        expectedSurgeryDate: request.expectedSurgeryDate,
        createdBy: request.createdBy,
        hospitalName: request.hospital,
      }
    };
    setReports(prev => [...prev, pendingReport]);
    toast({ title: "Procedure Report Created", description: `Pending report for ${request.patientName} added` });
  };

  // Expose createFromRequest to parent via ref
  useImperativeHandle(ref, () => ({
    createFromRequest
  }));

  const completePendingReport = (report: ProcedureReport) => {
    setEditingReport(report);
    setForm({
      patientName: report.patientName,
      patientId: report.patientId,
      hospital: report.hospital,
      procedureDate: report.procedureDate,
      procedureName: report.procedureName,
      findings: report.findings,
      postOpDiagnosis: report.postOpDiagnosis,
      procedureDescription: report.procedureDescription,
      postOpProtocol: report.postOpProtocol,
      postOpInstructions: report.postOpInstructions,
      mainHistory: report.mainHistory,
    });
    setShowForm(true);
  };

  const generateFullPDF = (report: ProcedureReport) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const reqData = report.requestData;
    const requestSection = reqData ? `
      <div class="section"><h3>Original Request Information</h3>
        <div class="grid">
          <div class="field"><label>Service Description:</label><div class="value">${reqData.serviceDescription || 'N/A'}</div></div>
          <div class="field"><label>Specialty:</label><div class="value">${reqData.specialty || 'N/A'}</div></div>
          <div class="field"><label>MRN:</label><div class="value">${reqData.mrn || 'N/A'}</div></div>
          <div class="field"><label>Phone:</label><div class="value">${reqData.phone || 'N/A'}</div></div>
          <div class="field"><label>Expected Surgery Date:</label><div class="value">${reqData.expectedSurgeryDate || 'N/A'}</div></div>
          <div class="field"><label>Hospital:</label><div class="value">${reqData.hospitalName || 'N/A'}</div></div>
          <div class="field"><label>Created By:</label><div class="value">${reqData.createdBy || 'N/A'}</div></div>
        </div>
      </div>
    ` : '';

    printWindow.document.write(`
      <html><head><title>Procedure Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
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
      ${getPrintHeaderHtml('Procedure Day Report')}
      <p style="text-align:center;font-size:12px;color:#999;">Generated: ${new Date().toLocaleDateString()}</p>

      <div class="grid">
        <div class="field"><label>Patient Name:</label><div class="value">${report.patientName}</div></div>
        <div class="field"><label>Patient ID:</label><div class="value">${report.patientId}</div></div>
        <div class="field"><label>Hospital:</label><div class="value">${report.hospital}</div></div>
        <div class="field"><label>Procedure Date:</label><div class="value">${report.procedureDate}</div></div>
        <div class="field"><label>Doctor:</label><div class="value">${report.doctorName}</div></div>
        <div class="field"><label>Procedure:</label><div class="value">${report.procedureName}</div></div>
      </div>

      ${requestSection}

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

  const pendingReports = reports.filter(r => r.status === "pending");
  const completedReports = reports.filter(r => r.status === "completed");

  // Build log book entries from both reports and requests
  const logEntries = [
    ...reports.map(r => ({
      id: r.id,
      procedureDate: r.procedureDate,
      patientName: r.patientName,
      patientId: r.patientId,
      procedureName: r.procedureName,
      hospital: r.hospital,
      status: r.status,
    })),
  ];

  // Requests that have status "Done" but no procedure report yet
  const doneRequestsWithoutReport = requests.filter(req => {
    const hasReport = reports.some(r => r.requestId === req.id);
    return req.status === "Done" && !hasReport;
  });

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Procedure Reports
            {pendingReports.length > 0 && (
              <Badge className="bg-yellow-500 text-white ml-1">{pendingReports.length}</Badge>
            )}
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
              <div className="flex gap-2 mb-4">
                <Button onClick={() => { setEditingReport(null); setForm({ ...emptyForm }); setShowForm(true); }}>
                  <Plus className="w-4 h-4 mr-1" /> New Procedure Report
                </Button>
              </div>

              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All ({reports.length})</TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({pendingReports.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">Completed ({completedReports.length})</TabsTrigger>
                </TabsList>

                {["all", "pending", "completed"].map(tab => (
                  <TabsContent key={tab} value={tab}>
                    <div className="border rounded-lg overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-blue-50">
                            <TableHead>Patient</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Hospital</TableHead>
                            <TableHead>Procedure</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(tab === "all" ? reports : tab === "pending" ? pendingReports : completedReports).map(r => (
                            <TableRow key={r.id}>
                              <TableCell className="font-medium">{r.patientName}</TableCell>
                              <TableCell>{r.patientId}</TableCell>
                              <TableCell>{r.hospital}</TableCell>
                              <TableCell>{r.procedureName}</TableCell>
                              <TableCell>{r.procedureDate}</TableCell>
                              <TableCell>
                                <Badge className={r.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {r.status === 'completed' ? 'Completed' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {r.status === "pending" && (
                                    <Button size="sm" variant="outline" onClick={() => completePendingReport(r)} title="Complete Report">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => setViewReport(r)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => generateFullPDF(r)}>
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {(tab === "all" ? reports : tab === "pending" ? pendingReports : completedReports).length === 0 && (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No {tab !== 'all' ? tab : ''} procedure reports.</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}

          {showForm && (
            <ProcedureReportForm
              form={form}
              onUpdateField={updateField}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingReport(null); }}
              title={editingReport ? `Complete Report — ${editingReport.patientName}` : "New Procedure Day Report"}
            />
          )}

          {viewReport && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{viewReport.patientName} — {viewReport.procedureName}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => generateFullPDF(viewReport)}>
                    <FileText className="w-4 h-4 mr-1" /> Print Full Report
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setViewReport(null)}>Back</Button>
                </div>
              </div>

              <Badge className={viewReport.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {viewReport.status === 'completed' ? 'Completed' : 'Pending'}
              </Badge>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Patient:</span> {viewReport.patientName}</div>
                <div><span className="font-medium">ID:</span> {viewReport.patientId}</div>
                <div><span className="font-medium">Hospital:</span> {viewReport.hospital}</div>
                <div><span className="font-medium">Date:</span> {viewReport.procedureDate}</div>
                <div><span className="font-medium">Doctor:</span> {viewReport.doctorName}</div>
              </div>

              {/* Request data section */}
              {viewReport.requestData && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Original Request Data</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm bg-blue-50 p-3 rounded">
                    <div><span className="font-medium">Service:</span> {viewReport.requestData.serviceDescription || 'N/A'}</div>
                    <div><span className="font-medium">Specialty:</span> {viewReport.requestData.specialty || 'N/A'}</div>
                    <div><span className="font-medium">MRN:</span> {viewReport.requestData.mrn || 'N/A'}</div>
                    <div><span className="font-medium">Phone:</span> {viewReport.requestData.phone || 'N/A'}</div>
                    <div><span className="font-medium">Surgery Date:</span> {viewReport.requestData.expectedSurgeryDate || 'N/A'}</div>
                    <div><span className="font-medium">Created By:</span> {viewReport.requestData.createdBy || 'N/A'}</div>
                  </div>
                </div>
              )}

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

      {/* Surgeon Log Book - separate button */}
      <SurgeonLogBook entries={logEntries} doctorName={currentDoctorName} />
    </>
  );
});

export default ProcedureDayReport;
export type { ProcedureReport as ProcedureReportType };
