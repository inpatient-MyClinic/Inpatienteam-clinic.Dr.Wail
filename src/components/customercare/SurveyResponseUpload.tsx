
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface SurveyResponseUploadProps {
  onUpdateResponses: (responses: { id: string; responded: boolean; npsScore?: number }[]) => void;
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

      // Extract responses from the Excel sheet
      const responses: { id: string; responded: boolean; npsScore?: number }[] = [];
      jsonData.forEach((row: any) => {
        const id = row['ID'] || row['id'] || row['Unified ID'] || row['Request ID'];
        const responded = row['Responded'] === 'Yes' || row['responded'] === true;
        const npsScore = row['NPS Score'] || row['nps_score'] || row['Score'];
        
        if (id) {
          responses.push({
            id: String(id),
            responded,
            npsScore: npsScore ? Number(npsScore) : undefined
          });
        }
      });

      if (responses.length === 0) {
        toast({
          title: "No responses found",
          description: "Could not find any survey responses in the Excel file.",
          variant: "destructive",
        });
        return;
      }

      onUpdateResponses(responses);
      
      toast({
        title: "Excel upload successful",
        description: `Updated survey responses for ${responses.length} requests`,
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
