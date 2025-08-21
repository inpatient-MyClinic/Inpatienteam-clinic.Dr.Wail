import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  errors: number;
  warnings: number;
  details: string[];
}

export default function UnifiedExcelImport() {
  const { importExcelData, currentUser } = useUnifiedData();
  const [file, setFile] = useState<File | null>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const requiredFields = [
    { key: 'patient_name', label: 'Patient Name', required: true },
    { key: 'medical_condition', label: 'Medical Condition', required: true },
    { key: 'specialty', label: 'Specialty', required: true },
    { key: 'hospital_code', label: 'Hospital Code', required: true },
    { key: 'request_date', label: 'Request Date', required: false },
    { key: 'patient_id', label: 'Patient ID', required: false },
    { key: 'patient_phone', label: 'Patient Phone', required: false },
    { key: 'patient_email', label: 'Patient Email', required: false },
    { key: 'hospital_name', label: 'Hospital Name', required: false },
    { key: 'branch_code', label: 'Branch Code', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'urgency', label: 'Urgency', required: false },
    { key: 'paid_amount', label: 'Paid Amount', required: false },
    { key: 'loss_reason', label: 'Loss Reason', required: false },
    { key: 'notes', label: 'Notes', required: false }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

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
          const rows = jsonData.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any[])[index];
            });
            return obj;
          });

          setExcelColumns(headers);
          setExcelData(rows);
          
          // Auto-map columns based on common names
          const autoMappings: Record<string, string> = {};
          headers.forEach(header => {
            const normalizedHeader = header.toLowerCase().trim();
            
            if (normalizedHeader.includes('patient') && normalizedHeader.includes('name')) {
              autoMappings[header] = 'patient_name';
            } else if (normalizedHeader.includes('condition') || normalizedHeader.includes('diagnosis')) {
              autoMappings[header] = 'medical_condition';
            } else if (normalizedHeader.includes('specialty') || normalizedHeader.includes('department')) {
              autoMappings[header] = 'specialty';
            } else if (normalizedHeader.includes('hospital') && normalizedHeader.includes('code')) {
              autoMappings[header] = 'hospital_code';
            } else if (normalizedHeader.includes('hospital') && normalizedHeader.includes('name')) {
              autoMappings[header] = 'hospital_name';
            } else if (normalizedHeader.includes('date')) {
              autoMappings[header] = 'request_date';
            } else if (normalizedHeader.includes('status')) {
              autoMappings[header] = 'status';
            } else if (normalizedHeader.includes('amount') || normalizedHeader.includes('paid')) {
              autoMappings[header] = 'paid_amount';
            } else if (normalizedHeader.includes('branch')) {
              autoMappings[header] = 'branch_code';
            }
          });

          setColumnMappings(autoMappings);
        }
      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleMappingChange = (excelColumn: string, dbField: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [excelColumn]: dbField
    }));
  };

  const handleImport = async () => {
    if (!file || !currentUser) return;

    // Validate required mappings
    const requiredMappings = requiredFields.filter(field => field.required);
    const missingMappings = requiredMappings.filter(field => 
      !Object.values(columnMappings).includes(field.key)
    );

    if (missingMappings.length > 0) {
      setImportResult({
        success: 0,
        errors: 1,
        warnings: 0,
        details: [`Missing required field mappings: ${missingMappings.map(m => m.label).join(', ')}`]
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Add created_by to mappings
    const finalMappings = {
      ...columnMappings,
      created_by: currentUser.id // Auto-set the current user as creator
    };

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await importExcelData(file.name, excelData, finalMappings);
      
      clearInterval(progressInterval);
      setProgress(100);
      setImportResult(result);
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: 0,
        errors: 1,
        warnings: 0,
        details: ['Import failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      requiredFields.map(field => field.label),
      ['John Doe', 'Heart Surgery', 'Cardiology', 'KFHU', '2025-01-01', 'P001', '+966501234567', 'john@example.com', 'King Fahd Hospital', 'B001', 'pending', 'high', '5000', '', 'Sample notes']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'medical_requests_template.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Excel Template
          </CardTitle>
          <CardDescription>
            Download the template file to see the expected format for importing medical requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Excel File
          </CardTitle>
          <CardDescription>
            Select an Excel file (.xlsx, .xls) containing medical request data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">Excel File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
          </div>
          
          {file && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="secondary">{excelData.length} rows</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column Mapping */}
      {excelColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Column Mapping</CardTitle>
            <CardDescription>
              Map your Excel columns to database fields. Required fields are marked with *.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {excelColumns.map((column) => (
                <div key={column} className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <Label className="font-medium">{column}</Label>
                    <div className="text-sm text-muted-foreground">
                      Sample: {excelData[0]?.[column]}
                    </div>
                  </div>
                  <div>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={columnMappings[column] || ''}
                      onChange={(e) => handleMappingChange(column, e.target.value)}
                    >
                      <option value="">-- Select Field --</option>
                      {requiredFields.map((field) => (
                        <option key={field.key} value={field.key}>
                          {field.label} {field.required ? '*' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Validation Summary */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Mapping Summary</h4>
              <div className="grid gap-2">
                {requiredFields.filter(f => f.required).map((field) => {
                  const isMapped = Object.values(columnMappings).includes(field.key);
                  return (
                    <div key={field.key} className="flex items-center gap-2">
                      {isMapped ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={isMapped ? 'text-green-700' : 'text-red-700'}>
                        {field.label} {isMapped ? '✓' : '(Required)'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {excelData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ready to import {excelData.length} requests</p>
                <p className="text-sm text-muted-foreground">
                  This will create new medical requests in the database.
                </p>
              </div>
              <Button 
                onClick={handleImport} 
                disabled={isProcessing}
                className="min-w-[120px]"
              >
                {isProcessing ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
            
            {isProcessing && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  Processing... {progress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.errors === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{importResult.success}</div>
                <div className="text-sm text-green-600">Successfully Imported</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{importResult.errors}</div>
                <div className="text-sm text-red-600">Errors</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{importResult.warnings}</div>
                <div className="text-sm text-yellow-600">Warnings</div>
              </div>
            </div>

            {importResult.details.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Details:</h4>
                <div className="max-h-40 overflow-y-auto">
                  {importResult.details.map((detail, index) => (
                    <Alert key={index} className="mb-2">
                      <AlertDescription className="text-sm">{detail}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}