import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface AdminRequestsUploadProps {
  onUpload: (data: any[]) => void;
}

interface UploadResult {
  success: number;
  errors: number;
  warnings: number;
  details: string[];
}

export default function AdminRequestsUpload({ onUpload }: AdminRequestsUploadProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const { toast } = useToast();

  const expectedFields = [
    "Request ID",
    "Patient Name", 
    "Patient National ID",
    "Patient Mobile No",
    "Hospital MRN",
    "Hospital Name",
    "Specialty",
    "Doctor Name",
    "Service Description",
    "Expected Surgery Date",
    "Request Creation Date",
    "Case Coordinator",
    "Request Status",
    "Priority Level",
    "Urgency",
    "Medical History",
    "Current Medications",
    "Allergies",
    "Insurance Company",
    "Policy Number",
    "Contact Person",
    "Contact Phone",
    "Contact Email",
    "Notes"
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Processing ${jsonData.length} requests from Excel file`);

      const result = await processUploadData(jsonData);
      setUploadResult(result);
      setPreviewData(jsonData);
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the Excel file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const processUploadData = async (data: any[]): Promise<UploadResult> => {
    let success = 0;
    let errors = 0;
    let warnings = 0;
    const details: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row["Request ID"]) {
        errors++;
        details.push(`Row ${i + 1}: Missing Request ID`);
        continue;
      }

      if (!row["Patient Name"]) {
        errors++;
        details.push(`Row ${i + 1}: Missing Patient Name`);
        continue;
      }

      if (row["Request Creation Date"]) {
        const date = new Date(row["Request Creation Date"]);
        if (isNaN(date.getTime())) {
          warnings++;
          details.push(`Row ${i + 1}: Invalid date format for Request Creation Date`);
        }
      }

      success++;
      details.push(`Row ${i + 1}: Request ${row["Request ID"]} processed successfully`);
    }

    return { success, errors, warnings, details };
  };

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
  };

  const handleSave = () => {
    if (uploadResult && uploadResult.success > 0) {
      console.log(`Saving ${previewData.length} historical requests to admin system`);
      onUpload(previewData);
      toast({
        title: "Upload Successful",
        description: `${uploadResult.success} historical requests imported successfully.`,
      });
      handleCancel();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setUploadResult(null);
    setPreviewData([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col h-20 gap-2">
          <Upload className="w-5 h-5" />
          <span className="text-xs">Import Requests</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Historical Requests (January - Present)</DialogTitle>
          <DialogDescription>
            Upload an Excel file containing historical request data from January 2025 till now
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Template Download */}
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

            {/* Expected Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expected Fields</CardTitle>
                <CardDescription>
                  Your Excel file should contain these exact column headers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {expectedFields.map((field, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload Excel File</CardTitle>
                <CardDescription>
                  Select your Excel file with historical requests to upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {isUploading && (
                    <div className="text-sm text-blue-600">
                      Processing historical requests... Please wait.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upload Results */}
            {uploadResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Upload Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Success: {uploadResult.success}
                      </Badge>
                      {uploadResult.warnings > 0 && (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                          Warnings: {uploadResult.warnings}
                        </Badge>
                      )}
                      {uploadResult.errors > 0 && (
                        <Badge variant="destructive">
                          Errors: {uploadResult.errors}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="max-h-32 overflow-y-auto">
                      {uploadResult.details.slice(0, 5).map((detail, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                          {detail.includes("Error") ? (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          ) : detail.includes("Invalid") ? (
                            <AlertCircle className="w-3 h-3 text-yellow-500" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                          {detail}
                        </div>
                      ))}
                      {uploadResult.details.length > 5 && (
                        <div className="text-xs text-gray-500">
                          ... and {uploadResult.details.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Import Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Import historical requests from January 2025 onwards</li>
                  <li>• Full patient and medical information mapping</li>
                  <li>• Status and priority level preservation</li>
                  <li>• Case coordinator and hospital assignment</li>
                  <li>• Date validation and formatting</li>
                  <li>• Duplicate detection and prevention</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!uploadResult || uploadResult.success === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Import Requests ({uploadResult?.success || 0})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
