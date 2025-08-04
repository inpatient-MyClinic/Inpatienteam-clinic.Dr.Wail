
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
      
      // Get column headers from first row to find the right columns
      const headers = Object.keys(jsonData[0] || {});
      console.log('Excel columns found:', headers);
      
      // Show user what columns were found
      toast({
        title: "Excel file loaded",
        description: `Found ${jsonData.length} rows with columns: ${headers.join(', ')}`,
      });
      
      jsonData.forEach((row: any, index: number) => {
        // More flexible column matching - look for any column containing these keywords
        const idColumn = headers.find(h => 
          h.toLowerCase().includes('id') || 
          h.toLowerCase().includes('unified') ||
          h.toLowerCase().includes('transaction') ||
          h.toLowerCase().includes('txn') ||
          h.toLowerCase().includes('request')
        );
        
        const respondedColumn = headers.find(h => 
          h.toLowerCase().includes('respond') || 
          h.toLowerCase().includes('survey') ||
          h.toLowerCase().includes('sent') ||
          h.toLowerCase().includes('completed')
        );
        
        const npsColumn = headers.find(h => 
          h.toLowerCase().includes('nps') || 
          h.toLowerCase().includes('score') ||
          h.toLowerCase().includes('rating')
        );
        
        const complaintColumn = headers.find(h => 
          h.toLowerCase().includes('complaint') || 
          h.toLowerCase().includes('issue') ||
          h.toLowerCase().includes('feedback') ||
          h.toLowerCase().includes('problem')
        );
        
        // Try to get ID from any column if not found with keywords
        const id = idColumn ? row[idColumn] : 
                  row[headers[0]] || // First column as fallback
                  Object.values(row)[0]; // Any first value
        
        if (id && String(id).trim()) {
          const responded = respondedColumn ? (
            String(row[respondedColumn]).toLowerCase().includes('yes') || 
            String(row[respondedColumn]).toLowerCase().includes('true') ||
            String(row[respondedColumn]).toLowerCase().includes('responded') ||
            String(row[respondedColumn]) === '1'
          ) : false;
          
          const npsScore = npsColumn ? Number(row[npsColumn]) : undefined;
          const hasComplaint = complaintColumn ? Boolean(row[complaintColumn] && String(row[complaintColumn]).trim()) : false;
          
          console.log(`Row ${index + 1}: ID=${id}, Responded=${responded}, NPS=${npsScore}, Complaint=${hasComplaint}`);
          console.log('Raw row data:', row);
          
          responses.push({
            id: String(id).trim(),
            responded,
            npsScore: npsScore && !isNaN(npsScore) ? npsScore : undefined
          });
        } else {
          console.log(`Row ${index + 1}: Skipped - no ID found`);
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
