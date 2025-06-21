import React, { useState, useEffect } from "react";
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
import DuplicateHandler from './DuplicateHandler';

export default function UserExcelUpload({ onUpload }: UserExcelUploadProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const [duplicates, setDuplicates] = React.useState<any[]>([]);
  const [showDuplicateHandler, setShowDuplicateHandler] = React.useState(false);
  const { toast } = useToast();

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('userExcelUploadData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPreviewData(parsed.previewData || []);
        setUploadResult(parsed.uploadResult || null);
      } catch (error) {
        console.error('Failed to load saved upload data:', error);
      }
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (previewData.length > 0 || uploadResult) {
      localStorage.setItem('userExcelUploadData', JSON.stringify({
        previewData,
        uploadResult
      }));
    }
  }, [previewData, uploadResult]);

  const checkForDuplicates = async (newData: any[]): Promise<{ duplicates: any[], unique: any[] }> => {
    // Get existing users from localStorage or component state
    const existingData = JSON.parse(localStorage.getItem('userExcelUploadData') || '{"previewData": []}').previewData;
    
    const duplicates: any[] = [];
    const unique: any[] = [];
    
    newData.forEach(newUser => {
      const isDuplicate = existingData.some((existingUser: any) => 
        existingUser.Email === newUser.Email || 
        (existingUser["Doctor Name"] && newUser["Doctor Name"] && existingUser["Doctor Name"] === newUser["Doctor Name"])
      );
      
      if (isDuplicate) {
        duplicates.push(newUser);
      } else {
        unique.push(newUser);
      }
    });
    
    return { duplicates, unique };
  };

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

      // Check for duplicates
      const { duplicates, unique } = await checkForDuplicates(jsonData);
      
      if (duplicates.length > 0) {
        setDuplicates(duplicates);
        setShowDuplicateHandler(true);
        setPreviewData([...previewData, ...unique]); // Add unique ones immediately
      } else {
        setPreviewData([...previewData, ...jsonData]);
      }

      const result = await processUploadData([...previewData, ...unique]);
      setUploadResult(result);
      
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

  const handleDuplicateResolution = (action: 'replace' | 'skip', selectedDuplicates: any[]) => {
    if (action === 'replace') {
      // Remove existing duplicates and add new ones
      const updatedData = previewData.filter(existingUser => 
        !selectedDuplicates.some(duplicate => 
          existingUser.Email === duplicate.Email || 
          (existingUser["Doctor Name"] && duplicate["Doctor Name"] && existingUser["Doctor Name"] === duplicate["Doctor Name"])
        )
      );
      setPreviewData([...updatedData, ...selectedDuplicates]);
    }
    // If skip, duplicates are simply not added
    
    setShowDuplicateHandler(false);
    setDuplicates([]);
    
    toast({
      title: "Duplicates Handled",
      description: `${selectedDuplicates.length} duplicate entries ${action === 'replace' ? 'replaced' : 'skipped'}.`,
    });
  };

  const handleSave = () => {
    if (uploadResult && uploadResult.success > 0) {
      onUpload(previewData);
      toast({
        title: "Upload Successful",
        description: `${previewData.length} users processed successfully.`,
      });
      handleCancel();
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Don't clear data - keep it persistent
  };

  const clearAllData = () => {
    setUploadResult(null);
    setPreviewData([]);
    localStorage.removeItem('userExcelUploadData');
    toast({
      title: "Data Cleared",
      description: "All upload data has been cleared.",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Excel
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Upload Users via Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file containing user data with names, emails, and specialties
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[70vh] pr-4">
            <div className="space-y-6 p-1">
              <TemplateDownload />
              <ExpectedFields />
              <FileUploadForm onFileUpload={handleFileUpload} isUploading={isUploading} />
              {uploadResult && <UploadResults uploadResult={uploadResult} />}
              
              {previewData.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Loaded Data Summary</h4>
                  <p className="text-sm text-blue-700">
                    {previewData.length} users ready to be saved. Data persists between navigation.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllData}
                    className="mt-2 text-red-600 hover:text-red-700"
                  >
                    Clear All Data
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t bg-white">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={previewData.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Save Users ({previewData.length})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showDuplicateHandler && (
        <DuplicateHandler
          isOpen={showDuplicateHandler}
          duplicates={duplicates}
          onResolve={handleDuplicateResolution}
          onClose={() => setShowDuplicateHandler(false)}
        />
      )}
    </>
  );
}
