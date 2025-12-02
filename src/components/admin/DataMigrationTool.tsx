import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Upload, AlertCircle, CheckCircle, RefreshCw, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedAnalyticsService } from "@/services/enhancedAnalyticsService";

export default function DataMigrationTool() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{
    hasLocalData: boolean;
    hasSupabaseData: boolean;
    localCount: number;
    supabaseCount: number;
    migrationNeeded: boolean;
  } | null>(null);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
  } | null>(null);
  const { toast } = useToast();

  // Check migration status on component mount
  React.useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await EnhancedAnalyticsService.checkMigrationStatus();
      setMigrationStatus(status);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
    setIsCheckingStatus(false);
  };

  const migrateLocalDataToDatabase = async () => {
    setIsLoading(true);
    setMigrationResult(null);

    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to migrate data",
          variant: "destructive"
        });
        setIsLoading(false);
        window.location.href = '/login';
        return;
      }

      // Check multiple possible localStorage keys
      const possibleKeys = ['medical_requests', 'excel_data_imported', 'allData', 'adminData', 'requests', 'excelData'];
      let allData: any[] = [];
      let sourceKey = '';

      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
              allData = parsed;
              sourceKey = key;
              console.log(`Found ${parsed.length} records in localStorage key: ${key}`);
              break;
            }
          } catch (e) {
            console.warn(`Failed to parse localStorage key ${key}:`, e);
          }
        }
      }

      if (allData.length === 0) {
        throw new Error('No data found in localStorage. Checked keys: ' + possibleKeys.join(', '));
      }

      console.log(`Found ${allData.length} records in localStorage under key '${sourceKey}'`);

      // Create upload batch record
      const { data: uploadData, error: uploadError } = await supabase
        .from('excel_upload_batches')
        .insert({
          filename: 'localStorage_migration.xlsx',
          total_rows: allData.length,
          status: 'processing',
          uploaded_by: user.id
        })
        .select()
        .single();

      if (uploadError) {
        throw new Error(`Failed to create upload record: ${uploadError.message}`);
      }

      // Transform localStorage data to match excel_rows_raw format with proper date handling
      const transformedData = allData.map((item: any, index: number) => {
        // Enhanced date parsing to handle various formats
        let dateValue = item.date || item.dateCreated || item.requestDate || item.created_at;
        
        // Handle Excel serial date numbers
        if (typeof dateValue === 'number' && dateValue > 25000) {
          const excelEpoch = new Date(1900, 0, 1);
          const convertedDate = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
          dateValue = convertedDate.toISOString().split('T')[0];
        } else if (typeof dateValue === 'string' && dateValue.includes('/')) {
          // Handle MM/DD/YYYY format
          const parts = dateValue.split('/');
          if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
            dateValue = `${year}-${month}-${day}`;
          }
        }

        return {
          __row: index + 1,
          'Date': dateValue?.toString() || '',
          'Status': item.operationStatus || item.status || 'Pending',
          'Branch': item.clinicBranch || item.referredFrom || item.branchCode || '',
          'Hospital Name': item.hospitalName || item.hospital || '',
          'Specialty': item.specialty || '',
          'Patient Name': item.patientName || '',
          'Patient ID': item.patientMRN || item.patientId || '',
          'Medical Condition': item.serviceDescription || item.medicalCondition || item.description || '',
          'Paid Amount': item.paidAmount?.toString() || '',
          'Currency': item.currency || 'SAR',
          'Notes': item.notes || ''
        };
      });

      // Import directly to excel_rows_raw table instead of using RPC
      const rowsToInsert = transformedData.map((row: any, idx: number) => ({
        batch_id: uploadData.id,
        row_number: idx + 1,
        raw_data: row
      }));

      // Insert in batches of 100 to avoid payload size limits
      const batchSize = 100;
      let insertedCount = 0;
      
      for (let i = 0; i < rowsToInsert.length; i += batchSize) {
        const batch = rowsToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('excel_rows_raw')
          .insert(batch);
        
        if (insertError) {
          console.error('Insert batch error:', insertError);
          throw new Error(`Failed to import rows: ${insertError.message}`);
        }
        insertedCount += batch.length;
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

      // Refresh migration status after successful migration
      await checkMigrationStatus();

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
        
        {/* Migration Status Display */}
        {migrationStatus && (
          <div className={`p-3 rounded-lg border ${
            migrationStatus.migrationNeeded 
              ? 'border-orange-200 bg-orange-50' 
              : migrationStatus.hasSupabaseData
              ? 'border-green-200 bg-green-50'
              : 'border-blue-200 bg-blue-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Migration Status</span>
              </div>
              <Button 
                onClick={checkMigrationStatus}
                disabled={isCheckingStatus}
                size="sm"
                variant="outline"
              >
                {isCheckingStatus ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
            <div className="mt-2 text-sm">
              <p>Local Storage: {migrationStatus.localCount} records</p>
              <p>Database: {migrationStatus.supabaseCount} records</p>
              {migrationStatus.migrationNeeded && (
                <p className="text-orange-700 font-medium mt-1">
                  ⚠️ Migration recommended for complete analytics
                </p>
              )}
              {migrationStatus.hasSupabaseData && !migrationStatus.migrationNeeded && (
                <p className="text-green-700 font-medium mt-1">
                  ✅ Data is synchronized
                </p>
              )}
            </div>
          </div>
        )}
        
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