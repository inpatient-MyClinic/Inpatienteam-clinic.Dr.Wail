
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface FilterBarProps {
  onExportExcel: () => void;
  onPrint: () => void;
}

export default function FilterBar({
  onExportExcel,
  onPrint
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6 justify-end">
      <Button onClick={onExportExcel} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export Excel
      </Button>
      <Button onClick={onPrint} variant="outline">
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
    </div>
  );
}
