
export interface EnhancedExcelUploadProps {
  onUpdatePayments: (ids: string[]) => void;
}

export interface UploadedFile {
  id: string;
  name: string;
  data: any[];
  extractedIds: string[];
}
