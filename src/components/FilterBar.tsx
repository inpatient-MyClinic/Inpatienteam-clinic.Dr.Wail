
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";

interface FilterBarProps {
  filters: Array<{ label: string; value: string }>;
  selectedFilters: string[];
  onFilterClick: (filterValue: string) => void;
  onClearFilter: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
}

export default function FilterBar({
  filters,
  selectedFilters,
  onFilterClick,
  onClearFilter,
  onExportExcel,
  onPrint
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6 justify-end">
      {filters.map((f) => (
        <Button
          key={f.value}
          variant={selectedFilters.includes(f.value) ? "default" : "outline"}
          onClick={() => onFilterClick(f.value)}
          size="sm"
        >
          {f.label}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearFilter}
        className="ml-2"
        disabled={selectedFilters.length === 0}
      >
        Clear Filter
      </Button>
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
