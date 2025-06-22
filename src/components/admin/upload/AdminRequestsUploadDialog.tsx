
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FileUploadSection from "./FileUploadSection";
import UploadResultsDisplay from "./UploadResultsDisplay";
import TemplateDownload from "./TemplateDownload";
import { processUploadData, parseExcelFile, UploadResult } from "./FileProcessing";

interface AdminRequestsUploadDialogProps {
  onUpload: (data: any[]) => void;
  trigger: React.ReactNode;
}

export default function AdminRequestsUploadDialog({ onUpload, trigger }: AdminRequestsUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileInfo, setFileInfo] = useState<string>("");
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileInfo(`File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    setIsUploading(true);
    
    try {
      const { data: jsonData, columns } = await parseExcelFile(file);
      setDetectedColumns(columns);

      const result = await processUploadData(jsonData);
      setUploadResult(result);
      setPreviewData(jsonData);
      
      toast({
        title: "File Processed",
        description: `Found ${jsonData.length} records in the Excel file.`,
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: `Failed to process the Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setFileInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    if (uploadResult && uploadResult.success > 0) {
      console.log(`Saving ${previewData.length} historical requests to admin system`);
      onUpload(previewData);
      toast({
        title: "Upload Successful",
        description: `${uploadResult.success} historical requests imported successfully.`,
      });
      handleCancel();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setUploadResult(null);
    setPreviewData([]);
    setFileInfo("");
    setDetectedColumns([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Historical Requests (January - Present)</DialogTitle>
          <DialogDescription>
            Upload an Excel file containing historical request data from January 2025 till now
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <TemplateDownload />
            
            <FileUploadSection
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              fileInfo={fileInfo}
              detectedColumns={detectedColumns}
            />

            {uploadResult && (
              <UploadResultsDisplay uploadResult={uploadResult} />
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
            Import Requests ({uploadResult?.success || 0})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
