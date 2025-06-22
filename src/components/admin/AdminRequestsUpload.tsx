
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import AdminRequestsUploadDialog from "./upload/AdminRequestsUploadDialog";

interface AdminRequestsUploadProps {
  onUpload: (data: any[]) => void;
}

export default function AdminRequestsUpload({ onUpload }: AdminRequestsUploadProps) {
  const trigger = (
    <Button variant="outline" className="flex flex-col h-20 gap-2">
      <Upload className="w-5 h-5" />
      <span className="text-xs">Import Requests</span>
    </Button>
  );

  return (
    <AdminRequestsUploadDialog
      onUpload={onUpload}
      trigger={trigger}
    />
  );
}
