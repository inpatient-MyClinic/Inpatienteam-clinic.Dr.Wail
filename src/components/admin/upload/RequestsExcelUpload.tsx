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
  { excelColumn: "Patient Name", requestField: "patientName", required: true },
  { excelColumn: "National ID", requestField: "patientNationalId", required: true },
  { excelColumn: "Mobile Number", requestField: "patientMobileNo", required: true },
  { excelColumn: "Specialty", requestField: "specialty", required: true },
  { excelColumn: "Doctor Name", requestField: "doctorName", required: true },
  { excelColumn: "Hospital Name", requestField: "hospitalName", required: true },
  { excelColumn: "Hospital MRN", requestField: "hospitalMRN", required: true },
  { excelColumn: "Service Description", requestField: "serviceDescription", required: true },
  { excelColumn: "Expected Surgery Date", requestField: "expectedSurgeryDate", required: true },
  { excelColumn: "Referred From", requestField: "referredFrom", required: false },
  { excelColumn: "Referred To Hospital", requestField: "referredToHospital", required: false },
  { excelColumn: "Admission Type", requestField: "admissionType", required: false },
  { excelColumn: "History", requestField: "history", required: false },
  { excelColumn: "Notes", requestField: "notes", required: false },
  { excelColumn: "Status", requestField: "status", required: false },
  { excelColumn: "Date Created", requestField: "dateCreated", required: false },
  { excelColumn: "Time Created", requestField: "timeCreated", required: false }
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
        "Patient Name": "Ahmed Hassan",
        "National ID": "1234567890",
        "Mobile Number": "0554447777",
        "Specialty": "cardiology",
        "Doctor Name": "Dr. Ahmed Salem",
        "Hospital Name": "DSAH",
        "Hospital MRN": "MRN-001",
        "Service Description": "Cardiac Surgery - Valve Replacement",
        "Expected Surgery Date": "2024-02-01",
        "Referred From": "Emergency",
        "Referred To Hospital": "DSAH",
        "Admission Type": "Emergency",
        "History": "Patient history",
        "Notes": "Additional notes",
        "Status": "Approved",
        "Date Created": "2024-01-15",
        "Time Created": "10:30"
      },
      {
        "Patient Name": "Sara Ali",
        "National ID": "2345678901",
        "Mobile Number": "0555558888",
        "Specialty": "orthopedics",
        "Doctor Name": "Dr. Mohammed Khalil",
        "Hospital Name": "DSFH (main)",
        "Hospital MRN": "MRN-002",
        "Service Description": "Orthopedic Surgery - Knee Replacement",
        "Expected Surgery Date": "2024-02-10",
        "Referred From": "Outpatient",
        "Referred To Hospital": "DSFH (main)",
        "Admission Type": "Elective",
        "History": "Knee pain for 2 years",
        "Notes": "Requires pre-operative assessment",
        "Status": "Pending",
        "Date Created": "2024-01-16",
        "Time Created": "14:20"
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