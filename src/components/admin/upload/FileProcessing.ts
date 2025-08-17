
import * as XLSX from 'xlsx';

export interface UploadResult {
  success: number;
  errors: number;
  warnings: number;
  details: string[];
}

export const processUploadData = async (data: any[]): Promise<UploadResult> => {
  let success = 0;
  let errors = 0;
  let warnings = 0;
  const details: string[] = [];

  console.log(`Processing ${data.length} requests from Excel file`);

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Check for essential fields with flexible column names
    const requestId = row["Request ID"] || row["ID"] || row["Request Id"] || row["request_id"];
    const patientName = row["Patient Name"] || row["Name"] || row["patient_name"] || row["PatientName"];
    
    if (!requestId) {
      errors++;
      details.push(`Row ${i + 1}: Missing Request ID (tried: Request ID, ID, Request Id, request_id)`);
      continue;
    }

    if (!patientName) {
      errors++;
      details.push(`Row ${i + 1}: Missing Patient Name (tried: Patient Name, Name, patient_name, PatientName)`);
      continue;
    }

    // Check date fields
    const creationDate = row["Request Creation Date"] || row["Creation Date"] || row["Date Created"] || row["date_created"];
    if (creationDate) {
      const date = new Date(creationDate);
      if (isNaN(date.getTime())) {
        warnings++;
        details.push(`Row ${i + 1}: Invalid date format for Request Creation Date: ${creationDate}`);
      }
    } else {
      warnings++;
      details.push(`Row ${i + 1}: No creation date found`);
    }

    success++;
    details.push(`Row ${i + 1}: Request ${requestId} - ${patientName} processed successfully`);
  }

  console.log(`Processing complete: ${success} success, ${errors} errors, ${warnings} warnings`);
  return { success, errors, warnings, details };
};

export const parseExcelFile = async (file: File, sheetIndex: number = 0): Promise<{ data: any[], columns: string[], sheets: string[] }> => {
  console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
  
  const data = await file.arrayBuffer();
  console.log("File read successfully, parsing Excel...");
  
  const workbook = XLSX.read(data, { type: 'array' });
  console.log("Workbook sheets:", workbook.SheetNames);
  
  const sheetName = workbook.SheetNames[sheetIndex] || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Parsed ${jsonData.length} rows from Excel sheet "${sheetName}"`);
  
  // Get column headers
  const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
  console.log("Detected columns:", columns);
  console.log("Sample data (first 2 rows):", jsonData.slice(0, 2));

  return { data: jsonData, columns, sheets: workbook.SheetNames };
};

export const parseExcelPivotTable = async (file: File): Promise<{ data: any[], columns: string[] }> => {
  console.log("Parsing pivot table from sheet 3:", file.name);
  
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  console.log("Available sheets:", workbook.SheetNames);
  
  // Try to find sheet 3 (index 2) or any sheet with "pivot" in the name
  let targetSheet = workbook.SheetNames[2]; // Sheet 3 (0-indexed)
  
  if (!targetSheet) {
    // Look for sheet with "pivot" in the name
    targetSheet = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('pivot') || 
      name.toLowerCase().includes('summary') ||
      name.toLowerCase().includes('analytics')
    );
  }
  
  if (!targetSheet) {
    throw new Error('Sheet 3 not found. Please ensure your Excel file has at least 3 sheets with pivot table data in sheet 3.');
  }
  
  console.log(`Using sheet: ${targetSheet} for pivot table data`);
  
  const worksheet = workbook.Sheets[targetSheet];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Parsed ${jsonData.length} rows from pivot table`);
  
  // Get column headers
  const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
  console.log("Pivot table columns:", columns);
  console.log("Pivot table sample data:", jsonData.slice(0, 3));

  return { data: jsonData, columns };
};
