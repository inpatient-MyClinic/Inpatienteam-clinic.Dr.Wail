
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export default function TemplateDownload() {
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      {
        "Request ID": "REQ001",
        "Patient Name": "Ahmed Mohammed",
        "Patient National ID": "1234567890",
        "Patient Mobile No": "966501234567",
        "Hospital MRN": "MRN001234",
        "Hospital Name": "King Abdulaziz Hospital",
        "Specialty": "Cardiology",
        "Doctor Name": "Dr. Ahmed Al-Rashid",
        "Service Description": "Cardiac Surgery",
        "Expected Surgery Date": "2025-07-01",
        "Request Creation Date": "2025-01-15",
        "Case Coordinator": "Sarah Al-Mahmoud",
        "Request Status": "Approved",
        "Priority Level": "High",
        "Urgency": "Normal",
        "Medical History": "Hypertension, Diabetes",
        "Current Medications": "Metformin, Lisinopril",
        "Allergies": "Penicillin",
        "Insurance Company": "BUPA Arabia",
        "Policy Number": "POL123456",
        "Contact Person": "Mohammed Ahmed",
        "Contact Phone": "966501234567",
        "Contact Email": "mohammed@example.com",
        "Notes": "Patient requires special care"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Requests Template");
    XLSX.writeFile(wb, "admin_requests_upload_template.xlsx");
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded to your computer.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Download Template</CardTitle>
        <CardDescription>
          Download the Excel template with the correct format for historical requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={downloadTemplate} variant="outline" size="sm">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download Requests Template
        </Button>
      </CardContent>
    </Card>
  );
}
