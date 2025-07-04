
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FileUploadSectionProps {
  isUploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUploadSection({ isUploading, onFileUpload }: FileUploadSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">📤 Step 2: Upload Files</CardTitle>
        <CardDescription>
          Select multiple Excel files to upload (supports .xlsx and .xls)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="file"
              accept=".xlsx,.xls"
              multiple
              onChange={onFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              disabled={isUploading}
              className="w-full flex items-center gap-2 h-12 border-dashed border-2 hover:bg-green-50"
            >
              {isUploading ? (
                <FileSpreadsheet className="w-4 h-4 animate-pulse" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isUploading ? 'Processing...' : 'Add Excel Files (Multiple Selection)'}
            </Button>
          </div>
          <Label className="text-xs text-gray-500 block text-center">
            You can select multiple files at once or add files one by one
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
