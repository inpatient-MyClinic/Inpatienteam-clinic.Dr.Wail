
export interface UserExcelUploadProps {
  onUpload: (users: any[]) => void;
}

export interface UploadResult {
  success: number;
  errors: number;
  warnings: number;
  details: string[];
}

export const expectedFields = [
  "Doctor Name",
  "Email", 
  "Specialty",
  "Category"
];
