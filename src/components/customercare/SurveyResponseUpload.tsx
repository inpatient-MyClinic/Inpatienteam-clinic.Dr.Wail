
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface SurveyResponseUploadProps {
  onUpdateResponses: (responses: { 
    id: string; 
    responded: boolean; 
    npsScore?: number;
    hospitalName?: string;
    completionDate?: string;
    complaint?: string;
  }[]) => void;
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
      const responses: { 
        id: string; 
        responded: boolean; 
        npsScore?: number;
        hospitalName?: string;
        completionDate?: string;
        complaint?: string;
      }[] = [];
      
      // Get column headers from first row to find the right columns
      const headers = Object.keys(jsonData[0] || {});
      console.log('Excel columns found:', headers);
      
      // Show user what columns were found
      toast({
        title: "Excel file loaded",
        description: `Found ${jsonData.length} rows with columns: ${headers.join(', ')}`,
      });
      
      jsonData.forEach((row: any, index: number) => {
        // Handle your specific Excel format
        let id = null;
        let responded = false;
        let npsScore = undefined;
        let hospitalName = null;
        let completionDate = null;
        let complaint = null;
        
        // Look for ID in __EMPTY_1 (column B equivalent)
        id = row['__EMPTY_1'] || 
             row['ID'] || row['id'] || row['Request ID'] || row['Unified ID'] ||
             Object.values(row).find(val => typeof val === 'string' && (val.includes('NC01-') || val.includes('NC02-') || val.includes('NC03-') || val.includes('NC04-') || val.includes('NC05-') || val.includes('NC06-')));
        
        // Get hospital name from column M (__EMPTY_9)
        hospitalName = row['__EMPTY_9'] || row['Hospital Name'] || row['Hospital'];
        
        // Get completion date from column B (__EMPTY - the month column)
        completionDate = row['__EMPTY'] || row['Month'] || row['Completion Date'];
        
        // Look for response indicators
        const responseValues = Object.values(row).join(' ').toLowerCase();
        responded = responseValues.includes('yes') || responseValues.includes('نعم') || 
                   responseValues.includes('answered') || responseValues.includes('responded');
        
        // Look for NPS score in __EMPTY_7 (column H equivalent)
        npsScore = row['__EMPTY_7'];
        if (typeof npsScore !== 'number' || npsScore < 0 || npsScore > 10) {
          // Fallback to looking in other numeric columns
          const numericValues = Object.values(row).filter(val => typeof val === 'number' && val >= 0 && val <= 10);
          if (numericValues.length > 0) {
            npsScore = Math.max(...numericValues as number[]);
          } else {
            npsScore = undefined;
          }
        }
        
        // Look for complaint in __EMPTY_8 (comments column)
        complaint = row['__EMPTY_8'] || row['Comments'] || row['Complaint'];
        if (complaint && complaint.toLowerCase().includes('no comment')) {
          complaint = null;
        }
        
        if (id && String(id).trim() && String(id).trim() !== 'NA') {
          console.log(`Row ${index + 1}: ID=${id}, Responded=${responded}, NPS=${npsScore}, Hospital=${hospitalName}, Date=${completionDate}`);
          console.log('Raw row data:', row);
          
          responses.push({
            id: String(id).trim(),
            responded,
            npsScore: npsScore && npsScore >= 0 && npsScore <= 10 ? npsScore : undefined,
            hospitalName: hospitalName ? String(hospitalName).trim() : undefined,
            completionDate: completionDate ? String(completionDate).trim() : undefined,
            complaint: complaint && String(complaint).trim() !== '' ? String(complaint).trim() : undefined
          });
        } else {
          console.log(`Row ${index + 1}: Skipped - no valid ID found (ID was: ${id})`);
        }
      });

      if (responses.length === 0) {
        toast({
          title: "No responses found",
          description: `Could not find any survey responses. Expected columns with keywords like: ID, Responded, NPS Score. Found columns: ${headers.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Processed responses:', responses);
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
