import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Upload } from "lucide-react";

interface AttachmentsSectionProps {
  request: any;
  localAttachment: File | null;
  onAttachmentChange: (file: File | null) => void;
}

export default function AttachmentsSection({ request, localAttachment, onAttachmentChange }: AttachmentsSectionProps) {
  return (
    <>
      {/* Existing Attachments */}
      {request.attachments && request.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {request.attachments.map((attachment: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{attachment}</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add New Attachment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Attachment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                onAttachmentChange(file || null);
              }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="flex-1"
            />
            <Button size="sm" variant="outline">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          {localAttachment && (
            <p className="text-sm text-green-600 mt-1">
              File selected: {localAttachment.name}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
