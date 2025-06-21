
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

export default function TemplateDownload() {
  const downloadTemplate = () => {
    const templateData = [
      {
        "Doctor Name": "Dr. Ahmed Al-Rashid",
        "Email": "ahmed.rashid@myclinic.com",
        "Specialty": "Cardiology",
        "Category": "Doctor"
      },
      {
        "Doctor Name": "Dr. Sara Mohammed", 
        "Email": "sara.mohammed@myclinic.com",
        "Specialty": "Neurology",
        "Category": "Doctor"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Template");
    XLSX.writeFile(wb, "users_upload_template.xlsx");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Download Template</CardTitle>
        <CardDescription>
          Download the Excel template with the correct format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={downloadTemplate} variant="outline" size="sm">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </CardContent>
    </Card>
  );
}
