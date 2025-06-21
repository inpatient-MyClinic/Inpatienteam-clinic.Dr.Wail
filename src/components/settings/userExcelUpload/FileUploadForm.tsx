
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FileUploadFormProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export default function FileUploadForm({ onFileUpload, isUploading }: FileUploadFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Upload Excel File</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {isUploading && (
            <div className="text-sm text-blue-600">
              Processing file... Please wait.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
