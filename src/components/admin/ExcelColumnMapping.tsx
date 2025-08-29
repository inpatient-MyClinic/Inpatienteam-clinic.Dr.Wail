import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Database } from "lucide-react";

interface ColumnMapping {
  excelColumn: string;
  headerName: string;
  databaseField: string;
  dataType: string;
  required: boolean;
  notes?: string;
}

const EXCEL_COLUMN_MAPPINGS: ColumnMapping[] = [
  { 
    excelColumn: "AP", 
    headerName: "Date of Request:", 
    databaseField: "Date", 
    dataType: "date", 
    required: true,
    notes: "PRIMARY DATE FIELD - Used for month filtering"
  },
  { excelColumn: "B", headerName: "Date of File Opening", databaseField: "Date of File Opening", dataType: "date", required: false },
  { excelColumn: "AH", headerName: "Agreed - Booked - OR date(mm/dd/yyyy)", databaseField: "Agreed Booked Date", dataType: "date", required: false },
  { 
    excelColumn: "AI", 
    headerName: "Status of operation", 
    databaseField: "Status", 
    dataType: "text", 
    required: true,
    notes: "PRIMARY STATUS FIELD - Values: Done, Pending, Cancelled, Scheduled, Approved, Rejected, Planned NVD"
  },
  { excelColumn: "G", headerName: "My Clinic Branch", databaseField: "Branch", dataType: "text", required: true },
  { excelColumn: "L", headerName: "Specialty", databaseField: "Specialty", dataType: "text", required: true },
  { excelColumn: "S", headerName: "Case coordinator", databaseField: "Case Coordinator", dataType: "text", required: true },
  { excelColumn: "N", headerName: "Referred Hospital", databaseField: "Hospital Name", dataType: "text", required: true },
  { excelColumn: "D", headerName: "Patient's Name:", databaseField: "Patient Name", dataType: "text", required: true },
  { excelColumn: "H", headerName: "Patient's MRN:", databaseField: "Patient ID", dataType: "text", required: false },
  { excelColumn: "K", headerName: "Patient's Mobile No.:", databaseField: "Patient Mobile", dataType: "text", required: false },
  { excelColumn: "J", headerName: "Patient's National ID:", databaseField: "Patient National ID", dataType: "text", required: false },
  { excelColumn: "Y", headerName: "Insurance/Cash", databaseField: "Insurance Cash", dataType: "text", required: false },
  { excelColumn: "AF", headerName: "Approval Status", databaseField: "Approval Status", dataType: "text", required: false },
  { excelColumn: "O", headerName: "Service Description of referred service", databaseField: "Service Description", dataType: "text", required: false },
  { excelColumn: "P", headerName: "Treating Doctor's Name", databaseField: "Treating Doctor Name", dataType: "text", required: false },
  { excelColumn: "AE", headerName: "Approval Number", databaseField: "Approval Number", dataType: "text", required: false },
  { excelColumn: "Z", headerName: "Insurance Number", databaseField: "Insurance Number", dataType: "text", required: false },
  { excelColumn: "AB", headerName: "Hospital File Number", databaseField: "Hospital File Number", dataType: "text", required: false },
  { excelColumn: "M", headerName: "Type of Admission", databaseField: "Type of Admission", dataType: "text", required: false },
  { excelColumn: "Q", headerName: "Expected date of Surgery", databaseField: "Expected Surgery Date", dataType: "date", required: false },
  { excelColumn: "", headerName: "Email", databaseField: "Email", dataType: "text", required: false, notes: "No specific column mentioned" },
  { excelColumn: "S", headerName: "Case Manager", databaseField: "Case Manager", dataType: "text", required: false, notes: "Same as Case Coordinator" },
  { excelColumn: "R", headerName: "Notes: if you want to add", databaseField: "Notes", dataType: "text", required: false },
  { excelColumn: "AC", headerName: "Date of Order Submission", databaseField: "Date of Order Submission", dataType: "date", required: false },
  { excelColumn: "AK", headerName: "Category of Failure", databaseField: "Category of Failure", dataType: "text", required: false },
  { excelColumn: "AJ", headerName: "Reason of pending or cancellation", databaseField: "Reason of Pending Cancellation", dataType: "text", required: false }
];

export default function ExcelColumnMapping() {
  const keyColumns = EXCEL_COLUMN_MAPPINGS.filter(col => 
    ['AP', 'AI', 'G', 'L', 'S', 'N'].includes(col.excelColumn)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Master Excel Sheet Column Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Key Columns for Analysis</h3>
                {keyColumns.map((col) => (
                  <div key={col.excelColumn} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {col.excelColumn}
                      </Badge>
                      <span className="font-medium">{col.headerName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {col.dataType}
                      {col.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Database Storage</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">Table: excel_rows_raw</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>• raw_data: JSON object with column letters as keys</div>
                    <div>• Column AP → raw_data.AP (Date filtering)</div>
                    <div>• Column AI → raw_data.AI (Status breakdown)</div>
                    <div>• Named fields for easy querying</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-4">Complete Column Mapping</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-gray-300 p-2 text-left">Excel Column</th>
                      <th className="border border-gray-300 p-2 text-left">Header Name</th>
                      <th className="border border-gray-300 p-2 text-left">Database Field</th>
                      <th className="border border-gray-300 p-2 text-left">Type</th>
                      <th className="border border-gray-300 p-2 text-left">Required</th>
                      <th className="border border-gray-300 p-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXCEL_COLUMN_MAPPINGS.map((col) => (
                      <tr key={col.excelColumn} className={col.required ? "bg-yellow-50" : ""}>
                        <td className="border border-gray-300 p-2">
                          <Badge variant="outline" className="font-mono">
                            {col.excelColumn}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 p-2 font-medium">
                          {col.headerName}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm text-muted-foreground">
                          {col.databaseField}
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {col.dataType}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {col.required ? (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Optional</Badge>
                          )}
                        </td>
                        <td className="border border-gray-300 p-2 text-xs text-muted-foreground">
                          {col.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}