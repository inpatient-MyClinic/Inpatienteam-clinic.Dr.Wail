import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { RequestFormData } from "@/types/request";
import { requestStorage } from "@/services/requestStorage";

interface ColumnMapping {
  excelColumn: string;
  requestField: keyof RequestFormData;
  required: boolean;
}

const defaultColumnMappings: ColumnMapping[] = [
  // Core patient information
  { excelColumn: "Patient's Name:", requestField: "patientName", required: true },
  { excelColumn: "Patient's MRN:", requestField: "patientMRN", required: true },
  { excelColumn: "Patient's National ID:", requestField: "patientNationalId", required: true },
  { excelColumn: "Patient's Mobile No.:", requestField: "patientMobileNo", required: true },
  { excelColumn: "Patient's Phone", requestField: "patientPhone", required: false },
  { excelColumn: "Email", requestField: "email", required: false },
  
  // Medical information
  { excelColumn: "Specialty", requestField: "specialty", required: true },
  { excelColumn: "Treating Doctor's Name", requestField: "doctorName", required: true },
  { excelColumn: "Service Description of referred service", requestField: "serviceDescription", required: true },
  { excelColumn: "Expected date of Surgery", requestField: "expectedSurgeryDate", required: false },
  { excelColumn: "Type of Admission", requestField: "admissionType", required: false },
  { excelColumn: "Notes: if you want to add", requestField: "notes", required: false },
  
  // Hospital information
  { excelColumn: "Referred Hospital", requestField: "hospitalName", required: true },
  { excelColumn: "My Clinic Branch", requestField: "clinicBranch", required: false },
  { excelColumn: "Hospital File Number", requestField: "hospitalFileNumber", required: false },
  
  // Case management
  { excelColumn: "Case Manager", requestField: "caseManager", required: false },
  { excelColumn: "Received Referral Documents / Email", requestField: "receivedDocuments", required: false },
  { excelColumn: "SMS Introduction", requestField: "smsIntroduction", required: false },
  { excelColumn: "Patient Contacted", requestField: "patientContacted", required: false },
  { excelColumn: "Preferred way of communication", requestField: "preferredCommunication", required: false },
  
  // Financial information
  { excelColumn: "Insurance/Cash", requestField: "insuranceType", required: false },
  { excelColumn: "Insurance Number", requestField: "insuranceNumber", required: false },
  
  // Dates and scheduling
  { excelColumn: "Start time", requestField: "startTime", required: false },
  { excelColumn: "Completion time", requestField: "completionTime", required: false },
  { excelColumn: "Date of Request:", requestField: "dateCreated", required: false },
  { excelColumn: "Date of File Opening", requestField: "fileOpeningDate", required: false },
  { excelColumn: "Date of Order Submission by Doctor", requestField: "orderSubmissionDate", required: false },
  { excelColumn: "Agreed - Booked - OR date(mm/dd/yyyy)", requestField: "agreedBookingDate", required: false },
  
  // Order and approval information
  { excelColumn: "Order Submission by Doctor", requestField: "orderSubmission", required: false },
  { excelColumn: "Approval Number", requestField: "approvalNumber", required: false },
  { excelColumn: "Approval Status", requestField: "approvalStatus", required: false },
  { excelColumn: "Preoperative assessment status", requestField: "preOpStatus", required: false },
  
  // Status and outcome
  { excelColumn: "Status of operation", requestField: "operationStatus", required: false },
  { excelColumn: "Reason of pending or cancellation", requestField: "reasonPendingCancellation", required: false },
  { excelColumn: "Category of Failure", requestField: "categoryOfFailure", required: false }
];

interface UploadResult {
  success: number;
  errors: number;
  details: string[];
  processedData: RequestFormData[];
}

export default function RequestsExcelUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>(defaultColumnMappings);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      {
        "Start time": "2024-01-15 09:00",
        "Completion time": "2024-01-15 17:00",
        "Email": "patient1@example.com",
        "Name": "Ahmed Hassan",
        "Last modified time": "2024-01-15 18:00",
        "Date of Request:": "2024-01-15",
        "My Clinic Branch": "Main Branch",
        "Patient's MRN:": "P001",
        "Patient's Name:": "Ahmed Hassan",
        "Patient's National ID:": "1234567890",
        "Patient's Mobile No.:": "0554447777",
        "Specialty": "cardiology",
        "Type of Admission": "Emergency",
        "Referred Hospital": "DSAH",
        "Service Description of referred service": "Cardiac Surgery - Valve Replacement",
        "Treating Doctor's Name": "Dr. Ahmed Salem",
        "Expected date of Surgery": "2024-02-01",
        "Notes: if you want to add": "Additional notes",
        "Case Manager": "Manager 1",
        "Received Referral Documents / Email": "Yes",
        "Patient's Phone": "0554447777",
        "SMS Introduction": "Sent",
        "Patient Contacted": "Yes",
        "Preferred way of communication": "Phone",
        "Insurance/Cash": "Insurance",
        "Insurance Number": "INS001",
        "Date of File Opening": "2024-01-15",
        "Hospital File Number": "HF001",
        "Order Submission by Doctor": "Submitted",
        "Date of Order Submission by Doctor": "2024-01-16",
        "Approval Number": "APR001",
        "Approval Status": "Approved",
        "Preoperative assessment status": "Completed",
        "Agreed - Booked - OR date(mm/dd/yyyy)": "02/01/2024",
        "Status of operation": "Scheduled",
        "Reason of pending or cancellation": "",
        "Category of Failure": ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Requests Template");
    XLSX.writeFile(wb, "requests_template.xlsx");
    
    toast({
      title: "Template Downloaded",
      description: "Use this template to format your request data."
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1);
          
          setExcelColumns(headers);
          
          // Convert to objects
          const dataObjects = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any[])[index] || '';
            });
            return obj;
          });
          
          setExcelData(dataObjects);
          
          toast({
            title: "File Loaded",
            description: `Found ${dataObjects.length} rows with ${headers.length} columns.`
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to read Excel file. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsArrayBuffer(uploadedFile);
  };

  const updateMapping = (index: number, excelColumn: string) => {
    const newMappings = [...mappings];
    newMappings[index].excelColumn = excelColumn;
    setMappings(newMappings);
  };

  const processData = () => {
    if (!excelData.length) return;
    
    setIsProcessing(true);
    const result: UploadResult = {
      success: 0,
      errors: 0,
      details: [],
      processedData: []
    };

    excelData.forEach((row, index) => {
      try {
        const requestData: Partial<RequestFormData> = {};
        
        // Map Excel columns to request fields
        mappings.forEach(mapping => {
          if (mapping.excelColumn && row[mapping.excelColumn] !== undefined) {
            (requestData as any)[mapping.requestField] = row[mapping.excelColumn];
          }
        });

        // Set default values for missing required fields
        if (!requestData.dateCreated) {
          requestData.dateCreated = new Date().toISOString().split('T')[0];
        }
        if (!requestData.timeCreated) {
          requestData.timeCreated = new Date().toTimeString().split(' ')[0].substring(0, 5);
        }
        if (!requestData.status) {
          requestData.status = "Pending";
        }
        if (!requestData.admissionType) {
          requestData.admissionType = "Elective";
        }
        if (!requestData.hospitalMRN && requestData.patientMRN) {
          requestData.hospitalMRN = requestData.patientMRN;
        }
        if (!requestData.referredFrom) {
          requestData.referredFrom = "Excel Import";
        }
        if (!requestData.referredToHospital && requestData.hospitalName) {
          requestData.referredToHospital = requestData.hospitalName;
        }
        if (!requestData.history) {
          requestData.history = "Imported from Excel";
        }

        // Validate required fields
        const requiredFields = mappings.filter(m => m.required);
        const missingFields = requiredFields.filter(field => 
          !requestData[field.requestField] || 
          String(requestData[field.requestField]).trim() === ''
        );

        if (missingFields.length > 0) {
          result.errors++;
          result.details.push(`Row ${index + 1}: Missing required fields: ${missingFields.map(f => f.requestField).join(', ')}`);
        } else {
          result.processedData.push(requestData as RequestFormData);
          result.success++;
          result.details.push(`Row ${index + 1}: Successfully processed`);
        }
        
      } catch (error) {
        result.errors++;
        result.details.push(`Row ${index + 1}: Error processing data - ${error}`);
      }
    });

    setUploadResult(result);
    setIsProcessing(false);

    toast({
      title: "Processing Complete",
      description: `${result.success} requests processed successfully, ${result.errors} errors.`
    });
  };

  const saveRequests = () => {
    if (!uploadResult?.processedData.length) return;

    uploadResult.processedData.forEach(requestData => {
      requestStorage.saveRequest(requestData, "Excel Import");
    });

    toast({
      title: "Import Complete",
      description: `${uploadResult.success} requests imported successfully.`
    });

    // Reset form
    setFile(null);
    setExcelData([]);
    setExcelColumns([]);
    setUploadResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Requests from Excel
          </CardTitle>
          <CardDescription>
            Upload an Excel file with request data and map the columns to import historical requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Template
            </Button>
            
            <div className="flex-1">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload">
                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    {file ? file.name : "Choose Excel File"}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {excelColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping</CardTitle>
            <CardDescription>
              Map your Excel columns to the request fields. Required fields are marked with *.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {mappings.map((mapping, index) => (
                <div key={index} className="flex items-center gap-2">
                  <label className="text-sm font-medium min-w-0 flex-1">
                    {mapping.requestField}
                    {mapping.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <select
                    value={mapping.excelColumn}
                    onChange={(e) => updateMapping(index, e.target.value)}
                    className="border rounded px-2 py-1 text-sm min-w-0 flex-1"
                  >
                    <option value="">-- Select Column --</option>
                    {excelColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button 
                onClick={processData} 
                disabled={isProcessing || !excelData.length}
                className="flex items-center gap-2"
              >
                {isProcessing ? "Processing..." : "Process Data"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.errors > 0 ? (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{uploadResult.success}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">{uploadResult.errors}</div>
                <div className="text-sm text-red-600">Errors</div>
              </div>
            </div>
            
            <div className="max-h-40 overflow-y-auto text-sm space-y-1">
              {uploadResult.details.map((detail, index) => (
                <div key={index} className={detail.includes('Error') ? 'text-red-600' : 'text-green-600'}>
                  {detail}
                </div>
              ))}
            </div>

            {uploadResult.success > 0 && (
              <div className="mt-4">
                <Button onClick={saveRequests} className="w-full">
                  Import {uploadResult.success} Requests
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}