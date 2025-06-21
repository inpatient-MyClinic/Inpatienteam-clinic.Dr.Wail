
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { UserExcelUploadProps, UploadResult } from './types';
import { processUploadData } from './utils';
import TemplateDownload from './TemplateDownload';
import ExpectedFields from './ExpectedFields';
import FileUploadForm from './FileUploadForm';
import UploadResults from './UploadResults';

export default function UserExcelUpload({ onUpload }: UserExcelUploadProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const { toast } = useToast();

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
            <TemplateDownload />
            <ExpectedFields />
            <FileUploadForm onFileUpload={handleFileUpload} isUploading={isUploading} />
            {uploadResult && <UploadResults uploadResult={uploadResult} />}
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
