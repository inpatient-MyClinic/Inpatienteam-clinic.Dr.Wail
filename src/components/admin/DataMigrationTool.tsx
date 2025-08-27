import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Upload, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function DataMigrationTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
  } | null>(null);
  const { toast } = useToast();

  const migrateLocalDataToDatabase = async () => {
    setIsLoading(true);
    setMigrationResult(null);

    try {
      // Get data from localStorage
      const localStorageData = localStorage.getItem('allData');
      if (!localStorageData) {
        throw new Error('No data found in localStorage');
      }

      const allData = JSON.parse(localStorageData);
      if (!Array.isArray(allData) || allData.length === 0) {
        throw new Error('No valid data found in localStorage');
      }

      console.log(`Found ${allData.length} records in localStorage`);

      // Create upload batch record
      const { data: uploadData, error: uploadError } = await supabase
        .from('excel_upload_batches')
        .insert({
          filename: 'localStorage_migration.xlsx',
          total_rows: allData.length,
          status: 'processing',
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (uploadError) {
        throw new Error(`Failed to create upload record: ${uploadError.message}`);
      }

      // Transform localStorage data to match excel_rows_raw format
      const transformedData = allData.map((item: any, index: number) => ({
        __row: index + 1,
        'Date': item.date?.toString() || item.requestDate || '',
        'Status': item.operationStatus || item.status || '',
        'Branch': item.clinicBranch || item.referredFrom || '',
        'Hospital Name': item.hospitalName || item.hospital || '',
        'Specialty': item.specialty || '',
        'Patient Name': item.patientName || '',
        'Patient ID': item.patientMRN || item.patientId || '',
        'Medical Condition': item.serviceDescription || item.medicalCondition || item.description || '',
        'Paid Amount': item.paidAmount?.toString() || '',
        'Currency': item.currency || 'SAR',
        'Notes': item.notes || ''
      }));

      // Import to database using RPC function
      const { error: importError } = await supabase
        .rpc('import_excel_rows', {
          batch_id: uploadData.id,
          rows_data: transformedData
        });

      if (importError) {
        throw new Error(`Failed to import rows: ${importError.message}`);
      }

      // Update batch status
      await supabase
        .from('excel_upload_batches')
        .update({
          status: 'completed',
          processed_rows: allData.length,
          success_count: allData.length
        })
        .eq('id', uploadData.id);

      setMigrationResult({
        success: true,
        message: `Successfully migrated ${allData.length} records to Supabase database`,
        imported: allData.length
      });

      toast({
        title: "Migration Success",
        description: `Migrated ${allData.length} records to database`,
        variant: "default"
      });

    } catch (error) {
      console.error('Migration error:', error);
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Migration failed'
      });

      toast({
        title: "Migration Failed",
        description: "Failed to migrate data to database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Migration Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Migrate existing localStorage data to Supabase database for accurate analytics.
        </div>
        
        <Button 
          onClick={migrateLocalDataToDatabase}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isLoading ? 'Migrating...' : 'Migrate localStorage to Database'}
        </Button>

        {migrationResult && (
          <div className={`p-3 rounded-lg border ${
            migrationResult.success 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-2">
              {migrationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={
                migrationResult.success ? 'text-green-800' : 'text-red-800'
              }>
                {migrationResult.message}
              </span>
            </div>
            {migrationResult.success && migrationResult.imported && (
              <div className="mt-2">
                <Badge variant="secondary">
                  {migrationResult.imported} records imported
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}