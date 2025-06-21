
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  onUpdatePayments: (ids: string[]) => void;
}

export default function ExcelUpload({ onUpdatePayments }: ExcelUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [previewIds, setPreviewIds] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Extract IDs from the Excel sheet
      const extractedIds: string[] = [];
      jsonData.forEach((row: any) => {
        // Look for common column names that might contain the ID
        const id = row['ID'] || row['id'] || row['Transaction ID'] || row['TXN_ID'] || row['Unified ID'];
        if (id) {
          extractedIds.push(String(id));
        }
      });

      if (extractedIds.length === 0) {
        toast({
          title: "No IDs found",
          description: "Could not find any IDs in the Excel file. Please ensure there's an 'ID' column.",
          variant: "destructive",
        });
        return;
      }

      setUploadedData(jsonData);
      setPreviewIds(extractedIds);

    } catch (error) {
      console.error('Error processing Excel file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error processing the Excel file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleSave = () => {
    if (previewIds.length > 0) {
      onUpdatePayments(previewIds);
      toast({
        title: "Excel upload successful",
        description: `Updated payment status for ${previewIds.length} transactions`,
      });
      handleCancel();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setUploadedData([]);
    setPreviewIds([]);
  };

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
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Excel for Payment Updates</DialogTitle>
          <DialogDescription>
            Upload Excel with ID column to bulk update payments
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  disabled={isUploading}
                  className="w-full flex items-center gap-2 h-12"
                >
                  {isUploading ? (
                    <FileSpreadsheet className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? 'Processing...' : 'Choose Excel File'}
                </Button>
              </div>
              <Label className="text-xs text-gray-500 block text-center">
                Upload Excel with ID column to bulk update payments
              </Label>
            </div>

            {previewIds.length > 0 && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Preview: {previewIds.length} IDs found</h3>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {previewIds.slice(0, 10).map((id, index) => (
                      <div key={index} className="text-sm bg-gray-50 px-2 py-1 rounded">
                        {id}
                      </div>
                    ))}
                    {previewIds.length > 10 && (
                      <div className="text-sm text-gray-500">
                        ... and {previewIds.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
            disabled={previewIds.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Save & Update ({previewIds.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
