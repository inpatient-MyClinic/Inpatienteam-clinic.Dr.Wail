
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import RequestsExcelUpload from "./upload/RequestsExcelUpload";

interface AdminRequestsUploadProps {
  onUpload: (data: any[]) => void;
}

export default function AdminRequestsUpload({ onUpload }: AdminRequestsUploadProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col h-20 gap-2">
          <Upload className="w-5 h-5" />
          <span className="text-xs">Import Requests</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Requests from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file containing request data and map the columns to import them as historical requests.
          </DialogDescription>
        </DialogHeader>
        <RequestsExcelUpload />
      </DialogContent>
    </Dialog>
  );
}
