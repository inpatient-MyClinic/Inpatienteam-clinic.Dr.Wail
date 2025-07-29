
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { UploadResult } from './types';
import { processUploadData } from './utils';

const STORAGE_KEY = 'userExcelUploadData';

export function useExcelUpload() {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateHandler, setShowDuplicateHandler] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [currentWorkbook, setCurrentWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [updateMode, setUpdateMode] = useState<'replace' | 'append'>('append');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

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
    
    // Check against existing preview data AND remove internal duplicates
    const seenEmails = new Set(previewData.map(user => user.Email?.toLowerCase()));
    const seenNames = new Set(previewData.filter(user => user.Role === 'Doctor')
      .map(user => user["Doctor Name"]?.toLowerCase().replace(/[.\-_\s]/g, '')));
    
    newData.forEach(newUser => {
      const emailKey = newUser.Email?.toLowerCase();
      const nameKey = newUser.Role === 'Doctor' ? 
        newUser["Doctor Name"]?.toLowerCase().replace(/[.\-_\s]/g, '') : '';
      
      const isDuplicateByEmail = seenEmails.has(emailKey);
      const isDuplicateByName = newUser.Role === 'Doctor' && seenNames.has(nameKey);
      
      if (isDuplicateByEmail || isDuplicateByName) {
        duplicates.push(newUser);
        console.log('Found duplicate in preview data:', newUser.Email);
      } else {
        // Check for duplicates within the new data itself
        const internalDuplicateByEmail = unique.some(existing => 
          existing.Email?.toLowerCase() === emailKey);
        const internalDuplicateByName = newUser.Role === 'Doctor' && 
          unique.some(existing => 
            existing.Role === 'Doctor' && 
            existing["Doctor Name"]?.toLowerCase().replace(/[.\-_\s]/g, '') === nameKey);
        
        if (internalDuplicateByEmail || internalDuplicateByName) {
          duplicates.push(newUser);
          console.log('Found internal duplicate:', newUser.Email);
        } else {
          unique.push(newUser);
          seenEmails.add(emailKey);
          if (newUser.Role === 'Doctor') seenNames.add(nameKey);
        }
      }
    });
    
    return { duplicates, unique };
  };

  const processSheet = async (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Processing ${jsonData.length} rows from sheet: ${sheetName}`);

    if (updateMode === 'replace') {
      setPreviewData([]);
      setPreviewData(jsonData);
      const result = await processUploadData(jsonData);
      setUploadResult(result);
      
      toast({
        title: "Data Replaced",
        description: `${jsonData.length} users loaded, previous data replaced.`,
      });
    } else {
      const { duplicates, unique } = await checkForDuplicates(jsonData);
      
      if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} duplicates`);
        setDuplicates(duplicates);
        setShowDuplicateHandler(true);
        const updatedData = [...previewData, ...unique];
        setPreviewData(updatedData);
      } else {
        console.log('No duplicates found, adding all data');
        const updatedData = [...previewData, ...jsonData];
        setPreviewData(updatedData);
      }

      const result = await processUploadData([...previewData, ...unique]);
      setUploadResult(result);
      
      toast({
        title: "Sheet Processed",
        description: `${unique.length} new users loaded${duplicates.length > 0 ? `, ${duplicates.length} duplicates found` : ''}.`,
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      setCurrentWorkbook(workbook);
      setAvailableSheets(workbook.SheetNames);
      
      if (workbook.SheetNames.length > 1) {
        setSelectedSheet(workbook.SheetNames[0]);
        toast({
          title: "Multiple Sheets Detected",
          description: `Found ${workbook.SheetNames.length} sheets. Please select which sheet to process.`,
        });
      } else {
        setSelectedSheet(workbook.SheetNames[0]);
        await processSheet(workbook, workbook.SheetNames[0]);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to process the Excel file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSheetSelect = async (sheetName: string) => {
    if (!currentWorkbook) return;
    
    setSelectedSheet(sheetName);
    setIsUploading(true);
    
    try {
      await processSheet(currentWorkbook, sheetName);
    } catch (error) {
      console.error('Sheet processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the selected sheet.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDuplicateResolution = (action: 'replace' | 'skip', selectedDuplicates: any[]) => {
    let updatedData = [...previewData];
    
    if (action === 'replace') {
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

  const clearAllData = () => {
    setUploadResult(null);
    setPreviewData([]);
    setAvailableSheets([]);
    setSelectedSheet("");
    setCurrentWorkbook(null);
    localStorage.removeItem(STORAGE_KEY);
    console.log('Cleared all upload data');
    toast({
      title: "Data Cleared",
      description: "All upload data has been cleared.",
    });
  };

  return {
    // State
    previewData,
    uploadResult,
    duplicates,
    showDuplicateHandler,
    availableSheets,
    selectedSheet,
    updateMode,
    isUploading,
    
    // Actions
    setUpdateMode,
    handleFileUpload,
    handleSheetSelect,
    handleDuplicateResolution,
    clearAllData,
    setShowDuplicateHandler,
    
    // Utilities
    loadSavedData
  };
}
