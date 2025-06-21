
export interface UserExcelUploadProps {
  onUpload: (users: any[]) => void;
}

export interface UploadResult {
  success: number;
  errors: number;
  warnings: number;
  details: string[];
}

export interface DuplicateHandlerProps {
  isOpen: boolean;
  duplicates: any[];
  onResolve: (action: 'replace' | 'skip', selectedDuplicates: any[]) => void;
  onClose: () => void;
}

export const expectedFields = [
  "Doctor Name",
  "Email", 
  "Specialty",
  "Category"
];
