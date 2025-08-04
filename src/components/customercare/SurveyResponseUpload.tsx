
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface SurveyResponseUploadProps {
  onUpdateResponses: (responses: any[]) => void;
}

export default function SurveyResponseUpload({ onUpdateResponses }: SurveyResponseUploadProps) {
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

      // Process the Excel data and pass complete rows
      const processedData: any[] = [];
      
      // Get column headers from first row to find the right columns
      const headers = Object.keys(jsonData[0] || {});
      console.log('Excel columns found:', headers);
      
      jsonData.forEach((row: any, index: number) => {
        // Look for ID in MRN column or similar
        let id = row['MRN'] || row['ID'] || row['id'] || row['Request ID'] || 
                 Object.values(row).find(val => typeof val === 'string' && (val.includes('NC01-') || val.includes('NC02-') || val.includes('NC03-') || val.includes('NC04-') || val.includes('NC05-') || val.includes('NC06-')));
        
        if (id && String(id).trim() && String(id).trim() !== 'NA') {
          console.log(`Row ${index + 1}: ID=${id}, Processing complete row data`);
          console.log('Raw row data:', row);
          
          // Pass the complete row data with the ID
          processedData.push({
            ...row,
            id: String(id).trim()
          });
        } else {
          console.log(`Row ${index + 1}: Skipped - no valid ID found (ID was: ${id})`);
        }
      });

      if (processedData.length === 0) {
        toast({
          title: "No data found",
          description: `Could not find any valid rows with IDs. Found columns: ${headers.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Processed Excel data:', processedData);
      onUpdateResponses(processedData);
      
      toast({
        title: "Excel upload successful",
        description: `Updated survey responses for ${processedData.length} requests`,
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
          {isUploading ? 'Processing...' : 'Upload Survey Responses'}
        </Button>
      </div>
      <Label className="text-xs text-gray-500">
        Upload Excel with ID and response data
      </Label>
    </div>
  );
}
