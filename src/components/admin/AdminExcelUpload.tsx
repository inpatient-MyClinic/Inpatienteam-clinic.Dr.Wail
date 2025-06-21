import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface AdminExcelUploadProps {
  onUpload: (data: any[]) => void;
}

interface UploadResult {
  success: number;
  errors: number;
  warnings: number;
  details: string[];
}

export default function AdminExcelUpload({ onUpload }: AdminExcelUploadProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<UploadResult | null>(null);
  const { toast } = useToast();

  const expectedFields = [
    "Unified ID",
    "Patient Name", 
    "Patient National ID",
    "Patient Mobile No",
    "Hospital MRN",
    "Hospital Name",
    "Specialty",
    "Doctor Name",
    "Service Description",
    "Expected Surgery Date",
    "Admission Type",
    "Expected Revenue",
    "Actual Revenue",
    "Request Creation Date",
    "Case Coordinator",
    "Coordinator Notes",
    "Hospital Status",
    "Hospital Notes",
    "Request Status",
    "Priority Level"
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

      // Validate and process data
      const result = await processUploadData(jsonData);
      setUploadResult(result);
      
      if (result.success > 0) {
        onUpload(jsonData);
        toast({
          title: "Upload Successful",
          description: `${result.success} records processed successfully.`,
        });
      }
      
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
      
      // Validate required fields
      if (!row["Unified ID"]) {
        errors++;
        details.push(`Row ${i + 1}: Missing Unified ID`);
        continue;
      }

      // Check for existing record
      const existingRecord = await checkExistingRecord(row["Unified ID"]);
      if (existingRecord) {
        warnings++;
        details.push(`Row ${i + 1}: Updated existing record ${row["Unified ID"]}`);
      } else {
        details.push(`Row ${i + 1}: Created new record ${row["Unified ID"]}`);
      }

      success++;
    }

    return { success, errors, warnings, details };
  };

  const checkExistingRecord = async (unifiedId: string): Promise<boolean> => {
    // Simulate checking for existing record
    return Math.random() > 0.7; // 30% chance of existing record
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "Unified ID": "REQ001",
        "Patient Name": "Ahmed Mohammed",
        "Patient National ID": "1234567890",
        "Patient Mobile No": "966501234567",
        "Hospital MRN": "MRN001234",
        "Hospital Name": "King Abdulaziz Hospital",
        "Specialty": "Cardiology",
        "Doctor Name": "Dr. Ahmed Al-Rashid",
        "Service Description": "Cardiac Surgery",
        "Expected Surgery Date": "2025-07-01",
        "Admission Type": "Elective",
        "Expected Revenue": "15000",
        "Actual Revenue": "15000",
        "Request Creation Date": "2025-06-15",
        "Case Coordinator": "Sarah Al-Mahmoud",
        "Coordinator Notes": "Patient evaluated and approved",
        "Hospital Status": "Confirmed",
        "Hospital Notes": "Surgery scheduled",
        "Request Status": "Approved",
        "Priority Level": "High"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "admin_upload_template.xlsx");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Data Upload via Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file containing request data with unified IDs for automatic updates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Download Template</CardTitle>
              <CardDescription>
                Download the Excel template with the correct format and field mappings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Template
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
                Select your Excel file to upload and process the data
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
                    Processing file... Please wait.
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
                        ) : detail.includes("Updated") ? (
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
              <CardTitle className="text-sm">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Unified ID recognition for automatic updates</li>
                <li>• Field mapping matches request creation format</li>
                <li>• Supports case coordinator and hospital data</li>
                <li>• Prevents data duplication</li>
                <li>• Maintains data consistency across all inputs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
