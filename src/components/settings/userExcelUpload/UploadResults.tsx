
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { UploadResult } from './types';

interface UploadResultsProps {
  uploadResult: UploadResult;
}

export default function UploadResults({ uploadResult }: UploadResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Upload Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex gap-4">
            <Badge variant="default" className="bg-green-100 text-green-800">
              Success: {uploadResult.success}
            </Badge>
            {uploadResult.errors > 0 && (
              <Badge variant="destructive">
                Errors: {uploadResult.errors}
              </Badge>
            )}
          </div>
          
          <div className="max-h-32 overflow-y-auto">
            {uploadResult.details.slice(0, 5).map((detail, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                {detail.includes("Error") ? (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
                {detail}
              </div>
            ))}
            {uploadResult.details.length > 5 && (
              <div className="text-xs text-gray-500">
                ... and {uploadResult.details.length - 5} more
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
