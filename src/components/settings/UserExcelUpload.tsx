
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface UserExcelUploadProps {
  onUpload: (users: any[]) => void;
}

interface UploadResult {
  success: number;
  errors: number;
  warnings: number;
  details: string[];
}

export default function UserExcelUpload({ onUpload }: UserExcelUploadProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const { toast } = useToast();

  const expectedFields = [
    "Doctor Name",
    "Email", 
    "Specialty",
    "Category"
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
      
      if (!row["Email"]) {
        errors++;
        details.push(`Row ${i + 1}: Missing Email`);
        continue;
      }

      if (!row["Doctor Name"]) {
        errors++;
        details.push(`Row ${i + 1}: Missing Doctor Name`);
        continue;
      }

      details.push(`Row ${i + 1}: Added ${row["Doctor Name"]} (${row["Email"]})`);
      success++;
    }

    return { success, errors, warnings, details };
  };

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

  const handleSave = () => {
    if (uploadResult && uploadResult.success > 0) {
      onUpload(previewData);
      toast({
        title: "Upload Successful",
        description: `${uploadResult.success} users processed successfully.`,
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
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Upload Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Users via Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file containing user data with names, emails, and specialties
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expected Fields</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload Excel File</CardTitle>
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
            Save Users ({uploadResult?.success || 0})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
