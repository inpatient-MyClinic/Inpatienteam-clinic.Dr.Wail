
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface FilterBarProps {
  onPrint: () => void;
}

export default function FilterBar({
  onPrint
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6 justify-end">
      <Button onClick={onPrint} variant="outline">
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
    </div>
  );
}
