
import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import { getLogoUrl } from "@/utils/logoUtils";
import { getProviderInfo } from "@/utils/providerInfoUtils";

interface MedicalCodingReferenceProps {
  request: any;
}

export default function MedicalCodingReference({ request }: MedicalCodingReferenceProps) {
  const diagnosisList = (request.diagnosis || "").split(";").map((s: string) => s.trim()).filter(Boolean);
  const procedureList = (request.serviceDescription || "").split(";").map((s: string) => s.trim()).filter(Boolean);

  if (diagnosisList.length === 0 && procedureList.length === 0) return null;

  const handlePrint = () => {
    const logoUrl = getLogoUrl();
    const provider = getProviderInfo();
    const now = new Date();

    const printContent = `
      <html>
      <head>
        <title>Medical Coding Reference - ${request.patientName || "Patient"}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #1a1a1a; }
          .header { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
          .header img { height: 60px; }
          .header-text { flex: 1; }
          .header-text h1 { font-size: 18px; color: #1e3a5f; margin: 0; }
          .header-text p { font-size: 11px; color: #666; margin: 2px 0; }
          .divider { border-top: 2px solid #1e3a5f; margin: 12px 0; }
          .title { text-align: center; font-size: 16px; font-weight: bold; color: #1e3a5f; margin: 16px 0 8px; }
          .subtitle { text-align: center; font-size: 11px; color: #888; margin-bottom: 16px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 16px; font-size: 12px; }
          .info-grid .label { font-weight: bold; color: #333; }
          .info-grid .value { color: #555; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
          th { background: #1e3a5f; color: white; padding: 8px 10px; text-align: left; }
          td { padding: 6px 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f8f9fa; }
          .section-title { font-size: 14px; font-weight: bold; color: #1e3a5f; margin: 16px 0 8px; }
          .footer { margin-top: 24px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
          .guidelines { font-size: 10px; color: #666; margin-top: 8px; padding: 8px; background: #f0f4f8; border-radius: 4px; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logoUrl}" alt="Clinic Logo" />
          <div class="header-text">
            <h1>${provider.name}</h1>
            <p>${provider.address}</p>
            <p>VAT: ${provider.vatNumber} | CR: ${provider.crNumber}</p>
          </div>
        </div>
        <div class="divider"></div>

        <div class="title">Medical Coding Reference Sheet</div>
        <div class="subtitle">For Insurance Pre-Authorization & Claims — CHI Saudi & European Guidelines Compliant</div>

        <div class="info-grid">
          <div><span class="label">Patient Name:</span> <span class="value">${request.patientName || "N/A"}</span></div>
          <div><span class="label">MRN:</span> <span class="value">${request.mrn || request.hospitalMRN || request.patientMRN || "N/A"}</span></div>
          <div><span class="label">National ID:</span> <span class="value">${request.idNumber || request.patientNationalId || "N/A"}</span></div>
          <div><span class="label">Specialty:</span> <span class="value">${request.specialty || "N/A"}</span></div>
          <div><span class="label">Doctor:</span> <span class="value">${request.doctorName || "N/A"}</span></div>
          <div><span class="label">Hospital:</span> <span class="value">${request.hospital || request.referredToHospital || "N/A"}</span></div>
          <div><span class="label">Date:</span> <span class="value">${request.dateCreated || now.toISOString().split("T")[0]}</span></div>
          <div><span class="label">Request ID:</span> <span class="value">${request.id || "N/A"}</span></div>
        </div>

        ${diagnosisList.length > 0 ? `
          <div class="section-title">Diagnosis Codes (ICD-10-AM / ICD-10-CM)</div>
          <table>
            <thead><tr><th>#</th><th>Code / Description</th></tr></thead>
            <tbody>
              ${diagnosisList.map((d: string, i: number) => `<tr><td>${i + 1}</td><td>${d}</td></tr>`).join("")}
            </tbody>
          </table>
        ` : ""}

        ${procedureList.length > 0 ? `
          <div class="section-title">Procedure / Service Codes (CPT / HCPCS / CHI Package)</div>
          <table>
            <thead><tr><th>#</th><th>Code / Description</th></tr></thead>
            <tbody>
              ${procedureList.map((p: string, i: number) => `<tr><td>${i + 1}</td><td>${p}</td></tr>`).join("")}
            </tbody>
          </table>
        ` : ""}

        <div class="guidelines">
          <strong>Reference Standards:</strong><br/>
          • CHI (Council of Health Insurance) Saudi Arabia — ICD-10-AM coding & pre-authorization requirements<br/>
          • WHO ICD-10 International Classification of Diseases<br/>
          • European Coding Guidelines (EU-DRG) for diagnosis & procedure classification<br/>
          • CPT® (Current Procedural Terminology) — AMA Standard
        </div>

        <div class="footer">
          Generated on ${now.toLocaleDateString("en-GB")} at ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} — This document is system-generated for insurance reference purposes.
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className="border-[#1e3a5f]/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg text-[#1e3a5f] flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Medical Coding Reference (Insurance)
        </CardTitle>
        <Button size="sm" variant="outline" onClick={handlePrint} className="text-[#1e3a5f] border-[#1e3a5f]/30">
          <Printer className="w-4 h-4 mr-1" />
          Print for Insurance
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {diagnosisList.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Diagnosis Codes (ICD-10)</p>
            <div className="flex flex-wrap gap-2">
              {diagnosisList.map((item: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {procedureList.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Procedure / Service Codes</p>
            <div className="flex flex-wrap gap-2">
              {procedureList.map((item: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground italic">
          Per CHI Saudi & European guidelines — printable for insurance pre-authorization attachment.
        </p>
      </CardContent>
    </Card>
  );
}
