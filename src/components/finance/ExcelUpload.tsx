
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  onUpdatePayments: (ids: string[]) => void;
}

export default function ExcelUpload({ onUpdatePayments }: ExcelUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
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

      onUpdatePayments(extractedIds);
      
      toast({
        title: "Excel upload successful",
        description: `Updated payment status for ${extractedIds.length} transactions`,
      });

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

  return (
    <div className="flex items-center gap-2">
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
          size="sm"
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <FileSpreadsheet className="w-4 h-4 animate-pulse" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? 'Processing...' : 'Upload Excel'}
        </Button>
      </div>
      <Label className="text-xs text-gray-500">
        Upload Excel with ID column to bulk update payments
      </Label>
    </div>
  );
}
