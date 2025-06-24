
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SheetSelectorProps {
  availableSheets: string[];
  selectedSheet: string;
  onSheetSelect: (sheetName: string) => void;
}

export default function SheetSelector({ availableSheets, selectedSheet, onSheetSelect }: SheetSelectorProps) {
  if (availableSheets.length <= 1) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-medium text-blue-900 mb-2">Select Sheet to Process</h4>
      <div className="space-y-2">
        <Select value={selectedSheet} onValueChange={onSheetSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a sheet" />
          </SelectTrigger>
          <SelectContent>
            {availableSheets.map(sheetName => (
              <SelectItem key={sheetName} value={sheetName}>
                {sheetName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-blue-700">
          Found {availableSheets.length} sheets: {availableSheets.join(', ')}
        </p>
      </div>
    </div>
  );
}
