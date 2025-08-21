
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
  console.log('Sample row columns:', Object.keys(data[0] || {}));

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Check for patient name with very flexible column matching
    const patientName = row["Patient Name"] || row["Patient's Name:"] || row["Name"] || 
                       row["patient_name"] || row["PatientName"] || row["PATIENT_NAME"] ||
                       row["Patient's Name"] || row["Patient"] || row["Full Name"];
    
    if (!patientName || patientName.toString().trim() === '') {
      errors++;
      details.push(`Row ${i + 1}: Missing Patient Name - please check column names`);
      continue;
    }

    // Check for specialty
    const specialty = row["Specialty"] || row["Medical Specialty"] || row["Department"] || 
                     row["SPECIALTY"] || row["Service"] || row["specialty"];
    
    if (!specialty || specialty.toString().trim() === '') {
      warnings++;
      details.push(`Row ${i + 1}: Missing Specialty - will default to 'General'`);
    }

    // Check date fields with flexible matching
    const creationDate = row["Request Creation Date"] || row["Date of Request:"] ||
                        row["Creation Date"] || row["Date Created"] || row["Date"] ||
                        row["REQUEST_DATE"] || row["Created At"] || row["date"];
    
    if (!creationDate) {
      warnings++;
      details.push(`Row ${i + 1}: No creation date found - will use current date`);
    } else {
      // Try to parse the date
      const dateStr = creationDate.toString();
      let parsedDate = null;
      
      // Handle Excel serial numbers
      if (!isNaN(Number(dateStr)) && Number(dateStr) > 25000) {
        const excelDate = Number(dateStr);
        parsedDate = new Date((excelDate - 25569) * 86400 * 1000);
      } else {
        parsedDate = new Date(dateStr);
      }
      
      if (isNaN(parsedDate.getTime())) {
        warnings++;
        details.push(`Row ${i + 1}: Invalid date format: ${dateStr}`);
      }
    }

    success++;
    details.push(`Row ${i + 1}: ${patientName} - Ready for processing`);
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
  console.log("Parsing pivot table from sheet 1:", file.name);
  
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  console.log("Available sheets:", workbook.SheetNames);
  
  // Use sheet 1 (index 0) for the pivot table
  let targetSheet = workbook.SheetNames[0]; // Sheet 1 (0-indexed)
  
  if (!targetSheet) {
    throw new Error('Sheet 1 not found. Please ensure your Excel file has pivot table data in the first sheet.');
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
