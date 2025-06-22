
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { UploadResult } from "./FileProcessing";

interface UploadResultsDisplayProps {
  uploadResult: UploadResult;
}

export default function UploadResultsDisplay({ uploadResult }: UploadResultsDisplayProps) {
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
            {uploadResult.warnings > 0 && (
              <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                Warnings: {uploadResult.warnings}
              </Badge>
            )}
            {uploadResult.errors > 0 && (
              <Badge variant="destructive">
                Errors: {uploadResult.errors}
              </Badge>
            )}
          </div>
          
          <div className="max-h-40 overflow-y-auto">
            {uploadResult.details.slice(0, 10).map((detail, index) => (
              <div key={index} className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                {detail.includes("Error") || detail.includes("Missing") ? (
                  <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                ) : detail.includes("Invalid") || detail.includes("No creation date") ? (
                  <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                )}
                <span className="break-all">{detail}</span>
              </div>
            ))}
            {uploadResult.details.length > 10 && (
              <div className="text-xs text-gray-500">
                ... and {uploadResult.details.length - 10} more entries
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
