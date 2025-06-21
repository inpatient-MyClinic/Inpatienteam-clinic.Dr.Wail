
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

const STORAGE_KEY = 'userExcelUploadData';

export default function UserExcelUpload({ onUpload }: UserExcelUploadProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = React.useState<any[]>([]);
  const [duplicates, setDuplicates] = React.useState<any[]>([]);
  const [showDuplicateHandler, setShowDuplicateHandler] = React.useState(false);
  const { toast } = useToast();

  // Load saved data on component mount and when dialog opens
  useEffect(() => {
    loadSavedData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSavedData();
    }
  }, [isOpen]);

  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.previewData && Array.isArray(parsed.previewData)) {
          setPreviewData(parsed.previewData);
        }
        if (parsed.uploadResult) {
          setUploadResult(parsed.uploadResult);
        }
        console.log(`Loaded ${parsed.previewData?.length || 0} users from storage`);
      }
    } catch (error) {
      console.error('Failed to load saved upload data:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const saveToStorage = (data: any[], result: UploadResult | null) => {
    try {
      const dataToSave = {
        previewData: data,
        uploadResult: result,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log(`Saved ${data.length} users to storage`);
    } catch (error) {
      console.error('Failed to save upload data:', error);
    }
  };

  // Save data whenever it changes
  useEffect(() => {
    if (previewData.length > 0 || uploadResult) {
      saveToStorage(previewData, uploadResult);
    }
  }, [previewData, uploadResult]);

  const checkForDuplicates = async (newData: any[]): Promise<{ duplicates: any[], unique: any[] }> => {
    const duplicates: any[] = [];
    const unique: any[] = [];
    
    newData.forEach(newUser => {
      const isDuplicate = previewData.some(existingUser => 
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

      console.log(`Processing ${jsonData.length} rows from Excel file`);

      // Check for duplicates
      const { duplicates, unique } = await checkForDuplicates(jsonData);
      
      if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} duplicates`);
        setDuplicates(duplicates);
        setShowDuplicateHandler(true);
        // Add unique ones immediately
        const updatedData = [...previewData, ...unique];
        setPreviewData(updatedData);
      } else {
        console.log('No duplicates found, adding all data');
        const updatedData = [...previewData, ...jsonData];
        setPreviewData(updatedData);
      }

      // Process results for the new unique data
      const result = await processUploadData([...previewData, ...unique]);
      setUploadResult(result);
      
      toast({
        title: "File Processed",
        description: `${unique.length} new users loaded${duplicates.length > 0 ? `, ${duplicates.length} duplicates found` : ''}.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to process the Excel file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDuplicateResolution = (action: 'replace' | 'skip', selectedDuplicates: any[]) => {
    let updatedData = [...previewData];
    
    if (action === 'replace') {
      // Remove existing duplicates and add new ones
      updatedData = previewData.filter(existingUser => 
        !selectedDuplicates.some(duplicate => 
          existingUser.Email === duplicate.Email || 
          (existingUser["Doctor Name"] && duplicate["Doctor Name"] && existingUser["Doctor Name"] === duplicate["Doctor Name"])
        )
      );
      updatedData = [...updatedData, ...selectedDuplicates];
      console.log(`Replaced ${selectedDuplicates.length} duplicate entries`);
    } else {
      console.log(`Skipped ${selectedDuplicates.length} duplicate entries`);
    }
    
    setPreviewData(updatedData);
    setShowDuplicateHandler(false);
    setDuplicates([]);
    
    toast({
      title: "Duplicates Handled",
      description: `${selectedDuplicates.length} duplicate entries ${action === 'replace' ? 'replaced' : 'skipped'}.`,
    });
  };

  const handleSave = () => {
    if (previewData.length > 0) {
      console.log(`Saving ${previewData.length} users to parent component`);
      onUpload(previewData);
      toast({
        title: "Upload Successful",
        description: `${previewData.length} users processed successfully.`,
      });
      setIsOpen(false);
    } else {
      toast({
        title: "No Data",
        description: "No users to save.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Don't clear data - keep it persistent
  };

  const clearAllData = () => {
    setUploadResult(null);
    setPreviewData([]);
    localStorage.removeItem(STORAGE_KEY);
    console.log('Cleared all upload data');
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
            {previewData.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                {previewData.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Upload Users via Excel</DialogTitle>
            <DialogDescription>
              Upload an Excel file containing user data with names, emails, and specialties. Data persists across navigation.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[70vh] pr-4">
            <div className="space-y-6 p-1">
              <TemplateDownload />
              <ExpectedFields />
              <FileUploadForm onFileUpload={handleFileUpload} isUploading={isUploading} />
              {uploadResult && <UploadResults uploadResult={uploadResult} />}
              
              {previewData.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Loaded Data Summary</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    {previewData.length} users ready to be saved. Data persists between navigation and page refreshes.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAllData}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      Clear All Data
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save Now ({previewData.length})
                    </Button>
                  </div>
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
