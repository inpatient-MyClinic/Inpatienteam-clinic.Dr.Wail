import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle, CheckCircle, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

interface PivotTableUploadProps {
  onPivotDataLoaded: (data: any[]) => void;
  onDataImported?: () => void;
}

export default function PivotTableUpload({ onPivotDataLoaded, onDataImported }: PivotTableUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [showDatabaseError, setShowDatabaseError] = useState(false);
  const { toast } = useToast();

  const parseFileToJSON = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Add __row index (1..N)
    const rowsWithIndex = jsonData.map((row: any, index: number) => ({
      ...row,
      __row: index + 1
    }));
    
    return rowsWithIndex;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    // Validate file type
    if (!uploadedFile.name.endsWith('.xlsx') && !uploadedFile.name.endsWith('.csv')) {
      setUploadResult({
        success: false,
        message: 'Please upload a .xlsx or .csv file only'
      });
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);
    setUploadResult(null);
    setShowDatabaseError(false);
    
    try {
      // Parse file to JSON
      const rowsJson = await parseFileToJSON(uploadedFile);
      
      if (rowsJson.length === 0) {
        throw new Error('No data found in the uploaded file');
      }

      console.log(`📊 Uploading ${rowsJson.length} rows to Supabase...`);

      // Create upload record first - using excel_upload_batches which exists
      const { data: uploadData, error: uploadError } = await supabase
        .from('excel_upload_batches')
        .insert({
          filename: uploadedFile.name,
          total_rows: rowsJson.length,
          status: 'processing',
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (uploadError) {
        throw new Error(`Failed to create upload record: ${uploadError.message}`);
      }

      console.log('📝 Created upload record:', uploadData.id);

      // Try to import rows using the database function (may fail if migration not run)
      try {
        const { data: importResult, error: importError } = await supabase
          .rpc('import_excel_rows' as any, {
            p_upload_id: uploadData.id,
            p_rows: rowsJson
          });

        if (importError) {
          throw new Error(`Failed to import rows: ${importError.message}`);
        }

        const importedCount = (importResult as any)?.imported_count || rowsJson.length;
      } catch (rpcError) {
        // If RPC fails, show database setup error
        console.log('⚠️ import_excel_rows function not available - please run database migration');
        setShowDatabaseError(true);
        setUploadResult({
          success: false,
          message: 'Database setup incomplete. Please run the SQL migration first.'
        });
        return;
      }

      const importedCount = rowsJson.length;
      
      console.log(`✅ Successfully imported ${importedCount} rows`);
      
      setUploadResult({
        success: true,
        message: `Successfully imported ${importedCount} rows to database`,
        count: importedCount
      });

      toast({
        title: "Upload Success",
        description: `Imported ${importedCount} rows to Supabase database`,
        variant: "default"
      });

      onPivotDataLoaded(rowsJson);
      onDataImported?.();
      
    } catch (error) {
      console.error('Error uploading pivot table:', error);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process file'
      });
      
      toast({
        title: "Upload Failed",
        description: "Failed to import data to Supabase",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="w-5 h-5" />
            Pivot Table Upload (Excel → Supabase)
          </CardTitle>
          <CardDescription>
            Upload .xlsx or .csv files to import data directly to Supabase database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
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
                    {isProcessing ? "Processing..." : file ? file.name : "Choose Excel/CSV File"}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Error Banner */}
      {showDatabaseError && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Database setup not found.</p>
                <p className="text-sm">Please run the Pivot-Parity SQL in Supabase (provided earlier).</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
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
          <CardContent>
            <p className={uploadResult.success ? "text-green-700" : "text-red-700"}>
              {uploadResult.message}
            </p>
            
            {uploadResult.success && uploadResult.count && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Data has been imported to Supabase database. Analytics will now use server-side data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}