
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DataSummaryProps {
  dataLength: number;
  onClearData: () => void;
  onSaveNow: () => void;
}

export default function DataSummary({ dataLength, onClearData, onSaveNow }: DataSummaryProps) {
  if (dataLength === 0) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-medium text-blue-900 mb-2">Loaded Data Summary</h4>
      <p className="text-sm text-blue-700 mb-3">
        {dataLength} users ready to be saved. Data persists between navigation and page refreshes.
      </p>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearData}
          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Clear All Data
        </Button>
        <Button 
          size="sm" 
          onClick={onSaveNow}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Now ({dataLength})
        </Button>
      </div>
    </div>
  );
}
