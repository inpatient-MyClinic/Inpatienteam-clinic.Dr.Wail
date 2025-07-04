
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, X, Download, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';

interface EnhancedExcelUploadProps {
  onUpdatePayments: (ids: string[]) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  data: any[];
  extractedIds: string[];
}

export default function EnhancedExcelUpload({ onUpdatePayments }: EnhancedExcelUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      {
        'ID': 'FIN001',
        'Patient Name': 'Ahmed Mohammed',
        'MRN': 'MRN001234',
        'Hospital': 'King Abdulaziz Hospital',
        'Doctor': 'Dr. Ahmed Al-Rashid',
        'Specialty': 'Cardiology',
        'Amount': '15000',
        'Status': 'Paid',
        'Date': '2025-06-15'
      },
      {
        'ID': 'FIN002',
        'Patient Name': 'Fatima Hassan',
        'MRN': 'MRN005678',
        'Hospital': 'Prince Sultan Hospital',
        'Doctor': 'Dr. Sarah Al-Mahmoud',
        'Specialty': 'Orthopedics',
        'Amount': '8500',
        'Status': 'Pending',
        'Date': '2025-06-10'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Finance Template');
    XLSX.writeFile(wb, 'finance_upload_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded to your computer.",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newUploadedFiles: UploadedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
          toast({
            title: "Invalid file type",
            description: `File ${file.name} is not an Excel file`,
            variant: "destructive",
          });
          continue;
        }

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Extract IDs from the Excel sheet
        const extractedIds: string[] = [];
        jsonData.forEach((row: any) => {
          const id = row['ID'] || row['id'] || row['Transaction ID'] || row['TXN_ID'] || row['Unified ID'];
          if (id) {
            extractedIds.push(String(id));
          }
        });

        if (extractedIds.length === 0) {
          toast({
            title: "No IDs found",
            description: `Could not find any IDs in ${file.name}. Please ensure there's an 'ID' column.`,
            variant: "destructive",
          });
          continue;
        }

        newUploadedFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          data: jsonData,
          extractedIds
        });
      }

      setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
      
      if (newUploadedFiles.length > 0) {
        toast({
          title: "Files uploaded successfully",
          description: `${newUploadedFiles.length} file(s) processed successfully.`,
        });
      }

    } catch (error) {
      console.error('Error processing Excel files:', error);
      toast({
        title: "Upload failed",
        description: "There was an error processing the Excel files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    toast({
      title: "File removed",
      description: "File has been removed from the upload list.",
    });
  };

  const handleSave = () => {
    const allIds = uploadedFiles.flatMap(file => file.extractedIds);
    
    if (allIds.length > 0) {
      onUpdatePayments(allIds);
      toast({
        title: "Bulk update successful",
        description: `Updated payment status for ${allIds.length} transactions from ${uploadedFiles.length} file(s)`,
      });
      handleCancel();
    } else {
      toast({
        title: "No data to process",
        description: "Please upload files with valid transaction IDs.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setUploadedFiles([]);
  };

  const totalIds = uploadedFiles.reduce((sum, file) => sum + file.extractedIds.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Excel
          {uploadedFiles.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {uploadedFiles.length} files
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Excel Files for Payment Updates</DialogTitle>
          <DialogDescription>
            Upload multiple Excel files with ID columns to bulk update payments. Download the template first.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Template Download */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Download Template</CardTitle>
                <CardDescription>
                  Download the Excel template with the correct format and column headers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadTemplate} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </CardContent>
            </Card>

            {/* Expected Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Expected Columns</CardTitle>
                <CardDescription>
                  Your Excel files should contain these columns (ID column is required)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {['ID', 'Patient Name', 'MRN', 'Hospital', 'Doctor', 'Specialty', 'Amount', 'Status', 'Date'].map(field => (
                    <Badge key={field} variant={field === 'ID' ? 'default' : 'outline'} className="text-xs">
                      {field} {field === 'ID' && '*'}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Upload Files</CardTitle>
                <CardDescription>
                  Select multiple Excel files to upload (supports .xlsx and .xls)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Button
                      variant="outline"
                      disabled={isUploading}
                      className="w-full flex items-center gap-2 h-12 border-dashed"
                    >
                      {isUploading ? (
                        <FileSpreadsheet className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {isUploading ? 'Processing...' : 'Add Excel Files (Multiple Selection)'}
                    </Button>
                  </div>
                  <Label className="text-xs text-gray-500 block text-center">
                    You can select multiple files at once or add files one by one
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Uploaded Files ({uploadedFiles.length})</CardTitle>
                  <CardDescription>
                    Total IDs found: {totalIds}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-sm">{file.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {file.extractedIds.length} IDs
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Sample IDs: {file.extractedIds.slice(0, 3).join(', ')}
                            {file.extractedIds.length > 3 && ` +${file.extractedIds.length - 3} more`}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
            disabled={uploadedFiles.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Update Payments ({totalIds} transactions)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
