
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ComplaintUploadProps {
  onUpdateComplaints: (complaints: { id: string; status: 'open' | 'closed' }[]) => void;
}

export default function ComplaintUpload({ onUpdateComplaints }: ComplaintUploadProps) {
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

      // Extract complaint updates from the Excel sheet
      const complaints: { id: string; status: 'open' | 'closed' }[] = [];
      jsonData.forEach((row: any) => {
        const id = row['ID'] || row['id'] || row['Unified ID'] || row['Request ID'];
        const status = row['Status'] || row['status'] || row['Complaint Status'];
        
        if (id && status) {
          const normalizedStatus = String(status).toLowerCase();
          if (normalizedStatus === 'open' || normalizedStatus === 'closed') {
            complaints.push({
              id: String(id),
              status: normalizedStatus as 'open' | 'closed'
            });
          }
        }
      });

      if (complaints.length === 0) {
        toast({
          title: "No complaint updates found",
          description: "Could not find any complaint status updates in the Excel file.",
          variant: "destructive",
        });
        return;
      }

      onUpdateComplaints(complaints);
      
      toast({
        title: "Excel upload successful",
        description: `Updated complaint status for ${complaints.length} requests`,
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
          {isUploading ? 'Processing...' : 'Upload Complaints'}
        </Button>
      </div>
      <Label className="text-xs text-gray-500">
        Upload Excel with ID and complaint status
      </Label>
    </div>
  );
}
