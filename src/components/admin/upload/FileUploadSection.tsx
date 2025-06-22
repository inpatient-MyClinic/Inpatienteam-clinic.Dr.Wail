
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface FileUploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  fileInfo: string;
  detectedColumns: string[];
}

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

export default function FileUploadSection({ 
  onFileUpload, 
  isUploading, 
  fileInfo, 
  detectedColumns 
}: FileUploadSectionProps) {
  return (
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
              onChange={onFileUpload}
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
  );
}
