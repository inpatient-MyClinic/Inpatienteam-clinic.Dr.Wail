import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle, CheckCircle, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseExcelPivotTable } from "./upload/FileProcessing";

interface PivotTableUploadProps {
  onPivotDataLoaded: (data: any[]) => void;
}

export default function PivotTableUpload({ onPivotDataLoaded }: PivotTableUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pivotData, setPivotData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);
    
    try {
      const { data, columns } = await parseExcelPivotTable(uploadedFile);
      
      if (data.length === 0) {
        throw new Error('No data found in the pivot table sheet');
      }
      
      setPivotData(data);
      setColumns(columns);
      
      // Store pivot table data in localStorage for the monthly analytics
      localStorage.setItem('pivotTableData', JSON.stringify(data));
      localStorage.setItem('pivotTableColumns', JSON.stringify(columns));
      localStorage.setItem('pivotTableLastUpdated', new Date().toISOString());
      
      // Notify parent component
      onPivotDataLoaded(data);
      
      setUploadResult({
        success: true,
        message: `Successfully loaded ${data.length} rows from pivot table with ${columns.length} columns`
      });
      
      toast({
        title: "Pivot Table Loaded",
        description: `Successfully processed ${data.length} rows from sheet 1.`
      });
      
    } catch (error) {
      console.error('Error processing pivot table:', error);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process pivot table'
      });
      
      toast({
        title: "Error",
        description: "Failed to load pivot table from sheet 1. Please check the file format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const usePivotData = () => {
    if (pivotData.length === 0) return;
    
    // Replace current admin data with pivot table data
    localStorage.setItem('adminData', JSON.stringify(pivotData));
    localStorage.setItem('excel_data_imported', 'true');
    localStorage.setItem('pivot_table_active', 'true');
    
    // Trigger events to update all components
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('requestsUpdated'));
    window.dispatchEvent(new CustomEvent('adminDataCleared'));
    
    toast({
      title: "Pivot Data Applied",
      description: "Monthly analytics will now use the pivot table data from sheet 1."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="w-5 h-5" />
            Pivot Table Upload (Sheet 1)
          </CardTitle>
          <CardDescription>
            Upload an Excel file and use the pivot table data from sheet 1 for monthly analytics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="pivot-upload"
                disabled={isProcessing}
              />
              <label htmlFor="pivot-upload">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2" 
                  asChild
                  disabled={isProcessing}
                >
                  <span>
                    <Upload className="w-4 h-4" />
                    {isProcessing ? "Processing..." : file ? file.name : "Choose Excel File (Sheet 1)"}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={uploadResult.success ? "text-green-700" : "text-red-700"}>
              {uploadResult.message}
            </p>
            
            {uploadResult.success && pivotData.length > 0 && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Pivot Table Preview:</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Found {pivotData.length} rows with columns: {columns.join(', ')}
                  </p>
                  
                  {/* Show first few rows as preview */}
                  <div className="max-h-40 overflow-auto">
                    <table className="w-full text-xs border">
                      <thead>
                        <tr className="bg-gray-100">
                          {columns.slice(0, 5).map(col => (
                            <th key={col} className="border p-1 text-left">{col}</th>
                          ))}
                          {columns.length > 5 && <th className="border p-1">...</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {pivotData.slice(0, 3).map((row, idx) => (
                          <tr key={idx}>
                            {columns.slice(0, 5).map(col => (
                              <td key={col} className="border p-1">{String(row[col] || '')}</td>
                            ))}
                            {columns.length > 5 && <td className="border p-1">...</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Button onClick={usePivotData} className="w-full">
                  Use This Pivot Data for Monthly Analytics
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}