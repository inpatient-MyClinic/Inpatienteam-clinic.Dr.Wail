import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, BarChart3, Calendar, FileSpreadsheet, Table2, Bug } from "lucide-react";
import { useSIAFilters } from "@/hooks/useSIAFilters";
import { DataExcelMigrationService } from "@/services/dataExcelMigration";
import EnhancedSIAFilters from "./EnhancedSIAFilters";
import ExcelDataAnalyzer from "./ExcelDataAnalyzer";
import ExcelPivotTable from "./ExcelPivotTable";
import DataAnalysisDebugger from "./DataAnalysisDebugger";
import SIAConfigurationModal from "./SIAConfigurationModal";
import SIALossTreeModal from "./SIALossTreeModal";
import MonthlyAnalyticsDashboard from "./MonthlyAnalyticsDashboard";
import { useToast } from "@/hooks/use-toast";

// NEW: Excel-only monthly analytics
import { useExcelMonthlyAnalytics } from "@/hooks/useExcelMonthlyAnalytics";
import { mapExcelSliceToMetrics } from "@/lib/mapExcelSliceToMetrics";

export default function SIADashboard() {
  const { filters, updateFilter, clearFilters } = useSIAFilters();

  // Derive year/month from filters (fallback to now)
  const now = new Date();
  const year = filters.month ? filters.month.getFullYear() : now.getFullYear();
  const month = filters.month ? (filters.month.getMonth() + 1) : (now.getMonth() + 1); // 1..12

  // nonce lets us "refetch" manually
  const [nonce, setNonce] = useState(0);
  const { data: excelSlice, loading, error } = useExcelMonthlyAnalytics(year, month, nonce);
  const metrics = mapExcelSliceToMetrics(excelSlice);
  const refetch = () => setNonce(n => n + 1);
  const [showConversionConfig, setShowConversionConfig] = useState(false);
  const [showLossTreeConfig, setShowLossTreeConfig] = useState(false);
  const [showMonthlyAnalytics, setShowMonthlyAnalytics] = useState(false);
  const [showExcelAnalyzer, setShowExcelAnalyzer] = useState(false);
  const [showPivotTable, setShowPivotTable] = useState(false);
  const [showDataDebugger, setShowDataDebugger] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const status = await DataExcelMigrationService.checkMigrationStatus();
      console.log('📊 Migration Status Check:', status);
      
      if (status.hasLocalData && !status.hasSupabaseData) {
        setMigrationStatus(`Found ${status.localCount} records in localStorage. Click to migrate to database for Excel analytics.`);
      } else if (status.hasSupabaseData) {
        setMigrationStatus(`✅ ${status.supabaseCount} records available in database. Excel analytics ready.`);
      } else if (!status.hasLocalData && !status.hasSupabaseData) {
        setMigrationStatus('No Excel data found. Upload Excel files through Admin Excel Upload to enable analytics.');
      }
    } catch (error) {
      console.error('Error checking migration status:', error);
      setMigrationStatus('Error checking data status.');
    }
  };

  const handleMigration = async () => {
    try {
      setMigrationStatus('Migrating data...');
      const result = await DataExcelMigrationService.migrateLocalStorageToSupabase();
      if (result.success) {
        toast({
          title: "Migration Successful",
          description: `Migrated ${result.migratedCount} records to database. Excel analytics now available.`,
        });
        await checkMigrationStatus();
        refetch(); // This will refresh the Excel analytics
      } else {
        toast({
          title: "Migration Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
        setMigrationStatus('Migration failed. Please try again.');
      }
    } catch (error) {
      toast({
        title: "Migration Error",
        description: error instanceof Error ? error.message : "Failed to migrate data",
        variant: "destructive"
      });
      setMigrationStatus('Migration error occurred.');
    }
  };

  if (showMonthlyAnalytics) {
    return <MonthlyAnalyticsDashboard onClose={() => setShowMonthlyAnalytics(false)} />;
  }

  if (showExcelAnalyzer) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Excel Data Analyzer</h1>
          <Button variant="outline" onClick={() => setShowExcelAnalyzer(false)}>
            Back to SIA Dashboard
          </Button>
        </div>
        <ExcelDataAnalyzer />
      </div>
    );
  }

  if (showDataDebugger) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Data Analysis Debugger</h1>
          <Button variant="outline" onClick={() => setShowDataDebugger(false)}>
            Back to SIA Dashboard
          </Button>
        </div>
        <DataAnalysisDebugger />
      </div>
    );
  }

  if (showPivotTable) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Excel Pivot Table Analyzer</h1>
          <Button variant="outline" onClick={() => setShowPivotTable(false)}>
            Back to SIA Dashboard
          </Button>
        </div>
        <ExcelPivotTable />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Error loading SIA dashboard: {error}</p>
            <Button onClick={refetch} variant="outline">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Migration Status */}
      {migrationStatus && (
        <Card className="border-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">{migrationStatus}</p>
              {migrationStatus.includes('localStorage') && (
                <Button onClick={handleMigration} size="sm">
                  Migrate Data
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <Button 
          variant="outline" 
          onClick={() => {
            console.log('🐛 Opening Data Debugger...');
            setShowDataDebugger(true);
          }} 
          className="flex items-center gap-2"
        >
          <Bug className="h-4 w-4" />
          Data Debugger
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            console.log('🎯 Opening Pivot Table...');
            setShowPivotTable(true);
          }} 
          className="flex items-center gap-2"
        >
          <Table2 className="h-4 w-4" />
          Pivot Table
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            console.log('📊 Opening Excel Analyzer...');
            setShowExcelAnalyzer(true);
          }} 
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Excel Analyzer
        </Button>
        <Button onClick={() => {
          console.log('📅 Opening Monthly Analytics...');
          setShowMonthlyAnalytics(true);
        }} className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Monthly Analytics
        </Button>
      </div>

      {/* Enhanced Filters */}
      <Card className="p-4">
        <EnhancedSIAFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
          onAnalyze={(analysis) => {
            console.log('SIA Analysis Result:', analysis);
            toast({
              title: "Analysis Complete",
              description: analysis?.selectedMonth
                ? `Found ${analysis.monthData.totalCases} cases for ${analysis.selectedMonth}`
                : `Analysis updated`,
            });
            // Force refresh to update dashboard with new filter selection
            setNonce(n => n + 1);
          }}
        />
      </Card>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCases.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              MCJ1: {metrics.mcj1Cases} + MCJ2: {metrics.mcj2Cases}
            </div>
          </CardContent>
        </Card>

        {/* MCJ1 Cases */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              MCJ1 Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.mcj1Cases.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.totalCases > 0 ? Math.round((metrics.mcj1Cases / metrics.totalCases) * 100) : 0}% of total
            </div>
          </CardContent>
        </Card>

        {/* MCJ2 Cases */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              MCJ2 Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.mcj2Cases.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.totalCases > 0 ? Math.round((metrics.mcj2Cases / metrics.totalCases) * 100) : 0}% of total
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="cursor-pointer hover:bg-accent/5" onClick={() => setShowConversionConfig(true)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Conversion Rate
              <Settings className="h-3 w-3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.doneCases} of {metrics.totalCases} cases
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Hospitals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Hospitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topHospitals.length > 0 ? (
                metrics.topHospitals.map((hospital, index) => (
                  <div key={hospital.name} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{hospital.name}</span>
                    <Badge variant="secondary">{hospital.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Specialties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topSpecialties.length > 0 ? (
                metrics.topSpecialties.map((specialty, index) => (
                  <div key={specialty.name} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1">{specialty.name}</span>
                    <Badge variant="secondary">{specialty.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loss Tree */}
        <Card className="cursor-pointer hover:bg-accent/5" onClick={() => setShowLossTreeConfig(true)}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Loss Tree
              <Settings className="h-3 w-3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-destructive">Cancelled/Rejected</span>
                  <span className="font-medium">{metrics.lossTree.cancelledTotal}</span>
                </div>
                <div className="text-xs text-muted-foreground ml-4 mt-1 space-y-1">
                  {Object.entries(metrics.lossTree.cancelledBreakdown).map(([reason, count]) => 
                    count > 0 ? (
                      <div key={reason} className="flex justify-between">
                        <span>{reason}:</span>
                        <span>{count}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-warning">Pending</span>
                  <span className="font-medium">{metrics.lossTree.pendingTotal}</span>
                </div>
                <div className="text-xs text-muted-foreground ml-4 mt-1 space-y-1">
                  {Object.entries(metrics.lossTree.pendingBreakdown).map(([reason, count]) => 
                    count > 0 ? (
                      <div key={reason} className="flex justify-between">
                        <span>{reason}:</span>
                        <span>{count}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.revenue.paidCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.revenue.paidPercentage}% of total cases
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              SAR {metrics.revenue.paidSum.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total payment amount
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Historical Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.conversionHistory.length > 0 ? (
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-5 w-5" />
                  <span>
                    {metrics.conversionHistory[metrics.conversionHistory.length - 1]?.conversionRate || 0}%
                  </span>
                </div>
              ) : (
                'N/A'
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Last 6 months avg
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Modals */}
      <SIAConfigurationModal 
        open={showConversionConfig}
        onOpenChange={setShowConversionConfig}
        onSettingsUpdate={refetch}
      />
      
      <SIALossTreeModal 
        open={showLossTreeConfig}
        onOpenChange={setShowLossTreeConfig}
        onSettingsUpdate={refetch}
      />
    </div>
  );
}