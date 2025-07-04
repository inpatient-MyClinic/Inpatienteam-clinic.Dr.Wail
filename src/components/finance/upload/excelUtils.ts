
import * as XLSX from 'xlsx';
import { UploadedFile } from './types';

export const processExcelFiles = async (files: FileList): Promise<UploadedFile[]> => {
  const newUploadedFiles: UploadedFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      throw new Error(`File ${file.name} is not an Excel file`);
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Extract IDs from the Excel sheet
    const extractedIds: string[] = [];
    jsonData.forEach((row: any) => {
      const id = row['ID'] || row['id'] || row['Transaction ID'] || row['TXN_ID'] || row['Unified ID'];
      if (id) {
        extractedIds.push(String(id));
      }
    });

    if (extractedIds.length === 0) {
      throw new Error(`Could not find any IDs in ${file.name}. Please ensure there's an 'ID' column.`);
    }

    newUploadedFiles.push({
      id: `file-${Date.now()}-${i}`,
      name: file.name,
      data: jsonData,
      extractedIds
    });
  }

  return newUploadedFiles;
};
