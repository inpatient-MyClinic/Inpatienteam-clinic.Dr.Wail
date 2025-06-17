
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Request {
  id: number;
  patientName: string;
  idNumber: string;
  phone: string;
  agreedSurgeryDate: string;
  hospital: string;
  hospitalMRN: string;
  expectedRevenue: number;
  actualRevenue: number;
  status: string;
}

interface ExportButtonProps {
  requests: Request[];
}

const ExportButton = ({ requests }: ExportButtonProps) => {
  const exportToExcel = () => {
    const headers = ["Patient Name", "ID Number", "Phone", "Surgery Date", "Hospital", "Status", "Expected Revenue", "Actual Revenue"];
    const csvContent = [
      headers.join(","),
      ...requests.map(req => [
        req.patientName,
        req.idNumber,
        req.phone,
        req.agreedSurgeryDate,
        req.hospital,
        req.status,
        req.expectedRevenue,
        req.actualRevenue || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "doctor_requests.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
      <Download className="w-4 h-4" />
      Export Excel
    </Button>
  );
};

export default ExportButton;
