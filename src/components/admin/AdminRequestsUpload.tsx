
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Info } from "lucide-react";
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
  const [fileInfo, setFileInfo] = React.useState<string>("");
  const [detectedColumns, setDetectedColumns] = React.useState<string[]>([]);
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

    console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
    setFileInfo(`File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    setIsUploading(true);
    
    try {
      console.log("Reading file...");
      const data = await file.arrayBuffer();
      console.log("File read successfully, parsing Excel...");
      
      const workbook = XLSX.read(data, { type: 'array' });
      console.log("Workbook sheets:", workbook.SheetNames);
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log(`Parsed ${jsonData.length} rows from Excel file`);
      
      // Get column headers
      if (jsonData.length > 0) {
        const columns = Object.keys(jsonData[0]);
        setDetectedColumns(columns);
        console.log("Detected columns:", columns);
      }

      console.log("Sample data (first 2 rows):", jsonData.slice(0, 2));

      const result = await processUploadData(jsonData);
      setUploadResult(result);
      setPreviewData(jsonData);
      
      toast({
        title: "File Processed",
        description: `Found ${jsonData.length} records in the Excel file.`,
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: `Failed to process the Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setFileInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const processUploadData = async (data: any[]): Promise<UploadResult> => {
    let success = 0;
    let errors = 0;
    let warnings = 0;
    const details: string[] = [];

    console.log(`Processing ${data.length} requests from Excel file`);

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Check for essential fields with flexible column names
      const requestId = row["Request ID"] || row["ID"] || row["Request Id"] || row["request_id"];
      const patientName = row["Patient Name"] || row["Name"] || row["patient_name"] || row["PatientName"];
      
      if (!requestId) {
        errors++;
        details.push(`Row ${i + 1}: Missing Request ID (tried: Request ID, ID, Request Id, request_id)`);
        continue;
      }

      if (!patientName) {
        errors++;
        details.push(`Row ${i + 1}: Missing Patient Name (tried: Patient Name, Name, patient_name, PatientName)`);
        continue;
      }

      // Check date fields
      const creationDate = row["Request Creation Date"] || row["Creation Date"] || row["Date Created"] || row["date_created"];
      if (creationDate) {
        const date = new Date(creationDate);
        if (isNaN(date.getTime())) {
          warnings++;
          details.push(`Row ${i + 1}: Invalid date format for Request Creation Date: ${creationDate}`);
        }
      } else {
        warnings++;
        details.push(`Row ${i + 1}: No creation date found`);
      }

      success++;
      details.push(`Row ${i + 1}: Request ${requestId} - ${patientName} processed successfully`);
    }

    console.log(`Processing complete: ${success} success, ${errors} errors, ${warnings} warnings`);
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
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded to your computer.",
    });
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
    setFileInfo("");
    setDetectedColumns([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col h-20 gap-2">
          <Upload className="w-5 h-5" />
          <span className="text-xs">Import Requests</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Historical Requests (January - Present)</DialogTitle>
          <DialogDescription>
            Upload an Excel file containing historical request data from January 2025 till now
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* File Info */}
            {fileInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    File Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{fileInfo}</p>
                </CardContent>
              </Card>
            )}

            {/* Detected Columns */}
            {detectedColumns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detected Columns ({detectedColumns.length})</CardTitle>
                  <CardDescription>
                    These are the columns found in your Excel file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {detectedColumns.map((column, index) => (
                      <Badge 
                        key={index} 
                        variant={expectedFields.includes(column) ? "default" : "outline"} 
                        className="text-xs"
                      >
                        {column}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Green badges indicate columns that match our expected format
                  </p>
                </CardContent>
              </Card>
            )}

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
                    <div className="text-sm text-blue-600 flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
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
                    
                    <div className="max-h-40 overflow-y-auto">
                      {uploadResult.details.slice(0, 10).map((detail, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                          {detail.includes("Error") || detail.includes("Missing") ? (
                            <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                          ) : detail.includes("Invalid") || detail.includes("No creation date") ? (
                            <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          )}
                          <span className="break-all">{detail}</span>
                        </div>
                      ))}
                      {uploadResult.details.length > 10 && (
                        <div className="text-xs text-gray-500">
                          ... and {uploadResult.details.length - 10} more entries
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expected Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expected Fields</CardTitle>
                <CardDescription>
                  Your Excel file should contain these exact column headers (or close variations)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {expectedFields.map((field, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Import Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Import historical requests from January 2025 onwards</li>
                  <li>• Flexible column name matching (handles variations)</li>
                  <li>• Full patient and medical information mapping</li>
                  <li>• Status and priority level preservation</li>
                  <li>• Date validation and formatting</li>
                  <li>• Detailed error reporting and debugging</li>
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
