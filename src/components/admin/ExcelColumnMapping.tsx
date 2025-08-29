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
  { excelColumn: "A", headerName: "رقم", databaseField: "row_number", dataType: "number", required: false },
  { excelColumn: "B", headerName: "Date of File Opening", databaseField: "date_of_file_opening", dataType: "date", required: false },
  { excelColumn: "C", headerName: "الفرع", databaseField: "branch_arabic", dataType: "text", required: false },
  { excelColumn: "D", headerName: "Patient's Name:", databaseField: "patient_name", dataType: "text", required: true },
  { excelColumn: "E", headerName: "العمر", databaseField: "age", dataType: "number", required: false },
  { excelColumn: "F", headerName: "الجنس", databaseField: "gender", dataType: "text", required: false },
  { excelColumn: "G", headerName: "My Clinic Branch", databaseField: "my_clinic_branch", dataType: "text", required: true },
  { excelColumn: "H", headerName: "Patient's MRN:", databaseField: "patient_mrn", dataType: "text", required: false },
  { excelColumn: "I", headerName: "الجنسية", databaseField: "nationality", dataType: "text", required: false },
  { excelColumn: "J", headerName: "Patient's National ID:", databaseField: "patient_national_id", dataType: "text", required: false },
  { excelColumn: "K", headerName: "Patient's Mobile No.:", databaseField: "patient_mobile", dataType: "text", required: false },
  { excelColumn: "L", headerName: "Specialty", databaseField: "specialty", dataType: "text", required: true },
  { excelColumn: "M", headerName: "Type of Admission", databaseField: "type_of_admission", dataType: "text", required: false },
  { excelColumn: "N", headerName: "Referred Hospital", databaseField: "referred_hospital", dataType: "text", required: true },
  { excelColumn: "O", headerName: "Service Description of referred service", databaseField: "service_description", dataType: "text", required: false },
  { excelColumn: "P", headerName: "Treating Doctor's Name", databaseField: "treating_doctor_name", dataType: "text", required: false },
  { excelColumn: "Q", headerName: "Expected date of Surgery", databaseField: "expected_date_surgery", dataType: "date", required: false },
  { excelColumn: "R", headerName: "Notes: if you want to add", databaseField: "notes", dataType: "text", required: false },
  { excelColumn: "S", headerName: "Case coordinator / Case Manager", databaseField: "case_coordinator", dataType: "text", required: true },
  { excelColumn: "T", headerName: "التشخيص", databaseField: "diagnosis", dataType: "text", required: false },
  { excelColumn: "U", headerName: "طبيعة الحالة", databaseField: "case_nature", dataType: "text", required: false },
  { excelColumn: "V", headerName: "درجة الألم", databaseField: "pain_level", dataType: "text", required: false },
  { excelColumn: "W", headerName: "حالة المريض", databaseField: "patient_condition", dataType: "text", required: false },
  { excelColumn: "X", headerName: "نوع التأمين", databaseField: "insurance_type", dataType: "text", required: false },
  { excelColumn: "Y", headerName: "Insurance/Cash", databaseField: "insurance_cash", dataType: "text", required: false },
  { excelColumn: "Z", headerName: "Insurance Number", databaseField: "insurance_number", dataType: "text", required: false },
  { excelColumn: "AA", headerName: "قيمة التأمين", databaseField: "insurance_value", dataType: "number", required: false },
  { excelColumn: "AB", headerName: "Hospital File Number", databaseField: "hospital_file_number", dataType: "text", required: false },
  { excelColumn: "AC", headerName: "Date of Order Submission", databaseField: "date_order_submission", dataType: "date", required: false },
  { excelColumn: "AD", headerName: "طريقة التواصل", databaseField: "contact_method", dataType: "text", required: false },
  { excelColumn: "AE", headerName: "Approval Number", databaseField: "approval_number", dataType: "text", required: false },
  { excelColumn: "AF", headerName: "Approval Status", databaseField: "approval_status", dataType: "text", required: false },
  { excelColumn: "AG", headerName: "تاريخ الموافقة", databaseField: "approval_date", dataType: "date", required: false },
  { excelColumn: "AH", headerName: "Agreed - Booked - OR date(mm/dd/yyyy)", databaseField: "agreed_booked_or_date", dataType: "date", required: false },
  { 
    excelColumn: "AI", 
    headerName: "Status of operation", 
    databaseField: "status_of_operation", 
    dataType: "text", 
    required: true,
    notes: "Values: Done, Pending, Cancelled, Scheduled, Approved, Rejected, Planned NVD"
  },
  { excelColumn: "AJ", headerName: "Reason of pending or cancellation", databaseField: "reason_pending_cancellation", dataType: "text", required: false },
  { excelColumn: "AK", headerName: "Category of Failure", databaseField: "category_failure", dataType: "text", required: false },
  { excelColumn: "AL", headerName: "التكلفة المتوقعة", databaseField: "expected_cost", dataType: "number", required: false },
  { excelColumn: "AM", headerName: "التكلفة الفعلية", databaseField: "actual_cost", dataType: "number", required: false },
  { excelColumn: "AN", headerName: "الربح المتوقع", databaseField: "expected_profit", dataType: "number", required: false },
  { excelColumn: "AO", headerName: "الربح الفعلي", databaseField: "actual_profit", dataType: "number", required: false },
  { 
    excelColumn: "AP", 
    headerName: "Date of Request:", 
    databaseField: "date_of_request", 
    dataType: "date", 
    required: true,
    notes: "PRIMARY DATE FIELD - Used for month filtering"
  }
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