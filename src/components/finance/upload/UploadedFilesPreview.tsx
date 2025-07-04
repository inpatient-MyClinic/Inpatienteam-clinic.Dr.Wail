
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadedFile } from './types';

interface UploadedFilesPreviewProps {
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
}

export default function UploadedFilesPreview({ uploadedFiles, onRemoveFile }: UploadedFilesPreviewProps) {
  const totalIds = uploadedFiles.reduce((sum, file) => sum + file.extractedIds.length, 0);

  if (uploadedFiles.length === 0) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-sm text-green-800">✅ Uploaded Files ({uploadedFiles.length})</CardTitle>
        <CardDescription className="text-green-600">
          Total IDs found: {totalIds}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-sm">{file.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {file.extractedIds.length} IDs
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Sample IDs: {file.extractedIds.slice(0, 3).join(', ')}
                  {file.extractedIds.length > 3 && ` +${file.extractedIds.length - 3} more`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(file.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
