import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DataExcelMigrationService } from '@/services/dataExcelMigration';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorageAnalytics } from '@/hooks/useLocalStorageAnalytics';

export function DataMigrationDebugger() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const currentYear = new Date().getFullYear();
  
  // Test July 2024 specifically since user mentioned 209 cases
  const localStorageJuly = useLocalStorageAnalytics(2024, 7);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const status = await DataExcelMigrationService.checkMigrationStatus();
      setMigrationStatus(status);
      
      // Also check database July 2024 data
      const { data, error } = await supabase.rpc('analyze_excel_cases_monthly', {
        p_year: 2024,
        p_month: 7
      });
      
      setDebugInfo({
        dbJuly2024: data?.[0] || null,
        dbError: error?.message || null
      });
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  const runMigration = async () => {
    setLoading(true);
    try {
      const result = await DataExcelMigrationService.migrateLocalStorageToSupabase();
      
      if (result.success) {
        toast({
          title: "Migration Successful",
          description: `Migrated ${result.migratedCount} records. ${result.validationResults?.julyRecords || 0} July records found.`,
        });
        
        console.log('Migration validation results:', result.validationResults);
      } else {
        toast({
          title: "Migration Failed",
          description: result.error,
          variant: "destructive",
        });
      }
      
      // Refresh status
      await checkStatus();
    } catch (error) {
      toast({
        title: "Migration Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const testDatabaseFunction = async () => {
    try {
      console.log('🧪 Testing database function for July 2024...');
      const { data, error } = await supabase.rpc('analyze_excel_cases_monthly', {
        p_year: 2024,
        p_month: 7
      });
      
      console.log('Database response:', { data, error });
      
      toast({
        title: "Database Test",
        description: error 
          ? `Error: ${error.message}` 
          : `Success: ${data?.[0]?.total_cases || 0} July 2024 cases found`,
        variant: error ? "destructive" : "default",
      });
      
      setDebugInfo(prev => ({
        ...prev,
        lastTest: { data, error, timestamp: new Date().toISOString() }
      }));
    } catch (error) {
      console.error('Database test failed:', error);
      toast({
        title: "Database Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Data Migration & Analytics Debugger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Migration Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">📦 LocalStorage Status</h4>
              <Badge variant={migrationStatus?.hasLocalData ? "default" : "secondary"}>
                {migrationStatus?.localCount || 0} records
              </Badge>
            </div>
            <div>
              <h4 className="font-medium mb-2">🗄️ Database Status</h4>
              <Badge variant={migrationStatus?.hasSupabaseData ? "default" : "secondary"}>
                {migrationStatus?.supabaseCount || 0} records
              </Badge>
            </div>
          </div>

          {/* July 2024 Comparison */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">🎯 July 2024 Analysis (User Expected: 209 cases)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">LocalStorage July 2024:</p>
                <Badge variant="outline" className="text-lg">
                  {localStorageJuly.loading ? "Loading..." : localStorageJuly.metrics.totalCases}
                </Badge>
                {!localStorageJuly.loading && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Status breakdown: {Object.entries(localStorageJuly.metrics.byStatus).map(([status, count]) => `${status}: ${count}`).join(', ')}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Database July 2024:</p>
                <Badge variant="outline" className="text-lg">
                  {debugInfo?.dbJuly2024?.total_cases || 0}
                </Badge>
                {debugInfo?.dbError && (
                  <div className="text-xs text-destructive mt-1">
                    Error: {debugInfo.dbError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={runMigration} 
              disabled={loading || !migrationStatus?.hasLocalData}
              variant={migrationStatus?.hasLocalData && !migrationStatus?.hasSupabaseData ? "default" : "outline"}
            >
              {loading ? "Migrating..." : "🚀 Run Migration"}
            </Button>
            
            <Button onClick={testDatabaseFunction} variant="outline">
              🧪 Test Database Function
            </Button>
            
            <Button onClick={checkStatus} variant="outline">
              🔄 Refresh Status
            </Button>
          </div>

          {/* Debug Info */}
          {debugInfo?.lastTest && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">🔍 Last Database Test</h4>
              <div className="text-xs bg-muted p-2 rounded font-mono">
                <div>Time: {new Date(debugInfo.lastTest.timestamp).toLocaleString()}</div>
                <div>Data: {JSON.stringify(debugInfo.lastTest.data, null, 2)}</div>
                {debugInfo.lastTest.error && (
                  <div className="text-destructive">Error: {JSON.stringify(debugInfo.lastTest.error, null, 2)}</div>
                )}
              </div>
            </div>
          )}

          {/* LocalStorage Breakdown */}
          {!localStorageJuly.loading && localStorageJuly.metrics.totalCases > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">📋 LocalStorage July 2024 Breakdown</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>Status:</strong>
                  {Object.entries(localStorageJuly.metrics.byStatus).map(([status, count]) => (
                    <div key={status} className="ml-2">{status}: {count}</div>
                  ))}
                </div>
                <div>
                  <strong>Branch:</strong>
                  {Object.entries(localStorageJuly.metrics.byBranch).map(([branch, count]) => (
                    <div key={branch} className="ml-2">{branch}: {count}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}