
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { UserExcelUploadProps } from './types';
import { useExcelUpload } from './useExcelUpload';
import TemplateDownload from './TemplateDownload';
import ExpectedFields from './ExpectedFields';
import FileUploadForm from './FileUploadForm';
import UploadResults from './UploadResults';
import DuplicateHandler from './DuplicateHandler';
import UpdateModeSelector from './UpdateModeSelector';
import SheetSelector from './SheetSelector';
import DataSummary from './DataSummary';

export default function UserExcelUpload({ onUpload }: UserExcelUploadProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  
  const {
    previewData,
    uploadResult,
    duplicates,
    showDuplicateHandler,
    availableSheets,
    selectedSheet,
    updateMode,
    isUploading,
    setUpdateMode,
    handleFileUpload,
    handleSheetSelect,
    handleDuplicateResolution,
    clearAllData,
    setShowDuplicateHandler,
    loadSavedData
  } = useExcelUpload();

  // Load data when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      loadSavedData();
    }
  }, [isOpen, loadSavedData]);

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
            <DialogTitle>Upload Users via Excel - Multi-Sheet Support</DialogTitle>
            <DialogDescription>
              Upload an Excel file with multiple sheets. Data can be updated (append) or replaced. Data persists across navigation.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[70vh] pr-4">
            <div className="space-y-6 p-1">
              <TemplateDownload />
              <ExpectedFields />
              
              <UpdateModeSelector 
                updateMode={updateMode}
                onUpdateModeChange={setUpdateMode}
              />

              <FileUploadForm 
                onFileUpload={handleFileUpload} 
                isUploading={isUploading} 
              />

              <SheetSelector
                availableSheets={availableSheets}
                selectedSheet={selectedSheet}
                onSheetSelect={handleSheetSelect}
              />

              {uploadResult && <UploadResults uploadResult={uploadResult} />}
              
              <DataSummary
                dataLength={previewData.length}
                onClearData={clearAllData}
                onSaveNow={handleSave}
              />
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
