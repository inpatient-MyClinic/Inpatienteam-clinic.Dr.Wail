
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EnhancedExcelUploadProps, UploadedFile } from './types';
import TemplateDownload from './TemplateDownload';
import FileUploadSection from './FileUploadSection';
import UploadedFilesPreview from './UploadedFilesPreview';
import { processExcelFiles } from './excelUtils';

export default function EnhancedExcelUpload({ onUpdatePayments }: EnhancedExcelUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newUploadedFiles = await processExcelFiles(files);
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
        description: error instanceof Error ? error.message : "There was an error processing the Excel files",
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
            Download the template first, fill in your data, then upload multiple Excel files to bulk update payments.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <TemplateDownload />
            <FileUploadSection isUploading={isUploading} onFileUpload={handleFileUpload} />
            <UploadedFilesPreview uploadedFiles={uploadedFiles} onRemoveFile={removeFile} />
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
