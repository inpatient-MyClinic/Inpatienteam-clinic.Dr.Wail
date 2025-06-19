
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

interface AttachmentsSectionProps {
  attachments: string[];
}

export default function AttachmentsSection({ attachments }: AttachmentsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Attachments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {attachments.map((attachment: string, index: number) => (
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
  );
}
