
import { UploadResult } from './types';

export const processUploadData = async (data: any[]): Promise<UploadResult> => {
  let success = 0;
  let errors = 0;
  let warnings = 0;
  const details: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    if (!row["Email"]) {
      errors++;
      details.push(`Row ${i + 1}: Missing Email`);
      continue;
    }

    if (!row["Doctor Name"]) {
      errors++;
      details.push(`Row ${i + 1}: Missing Doctor Name`);
      continue;
    }

    details.push(`Row ${i + 1}: Added ${row["Doctor Name"]} (${row["Email"]})`);
    success++;
  }

  return { success, errors, warnings, details };
};
