import React, { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Download, Upload, TrendingUp, Users, Building, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import SIAConfigurationModal from "./SIAConfigurationModal";
import SIALossTreeModal from "./SIALossTreeModal";
import SIAFiltersBar from "./SIAFiltersBar";
import { useSIAFilters } from "@/hooks/useSIAFilters";

interface ServerSIADashboardProps {
  onBack: () => void;
}

export default function ServerSIADashboard({ onBack }: ServerSIADashboardProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showLossTreeModal, setShowLossTreeModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kpiData, setKpiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { filters, updateFilter, clearFilters } = useSIAFilters();

  // Fetch KPI data from Supabase using server-side aggregation
  const fetchKPIData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // Calculate date range from filters
      let startDate = '1900-01-01';
      let endDate = new Date().toISOString().split('T')[0];
      
      if (filters.month) {
        const monthDate = new Date(filters.month);
        startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().split('T')[0];
      }

      // Prepare filter arrays (null = no filter)
      const statuses = filters.statuses.length > 0 ? filters.statuses : null;
      const hospitals = filters.hospitals.length > 0 ? filters.hospitals : null;
      const specialties = filters.specialties.length > 0 ? filters.specialties : null;
      const branches = filters.branches.length > 0 ? filters.branches.map(b => b.toUpperCase()) : null;

      // Call all KPI functions in parallel
      const [conversionData, branchData, topHospitalsData, topSpecialtiesData, lossTreeData] = await Promise.all([
        supabase.rpc('kpi_conversion_rate', {
          p_start: startDate,
          p_end: endDate,
          p_statuses: statuses,
          p_hospitals: hospitals,
          p_specs: specialties,
          p_branches: branches
        }),
        supabase.rpc('kpi_branch_counts', {
          p_start: startDate,
          p_end: endDate,
          p_statuses: statuses,
          p_hospitals: hospitals,
          p_specs: specialties,
          p_branches: branches
        }),
        supabase.rpc('kpi_top_hospitals', {
          p_start: startDate,
          p_end: endDate,
          p_statuses: statuses,
          p_hospitals: hospitals,
          p_specs: specialties,
          p_branches: branches
        }),
        supabase.rpc('kpi_top_specialties', {
          p_start: startDate,
          p_end: endDate,
          p_statuses: statuses,
          p_hospitals: hospitals,
          p_specs: specialties,
          p_branches: branches
        }),
        supabase.rpc('kpi_loss_tree', {
          p_start: startDate,
          p_end: endDate,
          p_statuses: statuses,
          p_hospitals: hospitals,
          p_specs: specialties,
          p_branches: branches
        })
      ]);

      if (conversionData.error) throw conversionData.error;
      if (branchData.error) throw branchData.error;
      if (topHospitalsData.error) throw topHospitalsData.error;
      if (topSpecialtiesData.error) throw topSpecialtiesData.error;
      if (lossTreeData.error) throw lossTreeData.error;

      // Process branch data for MCJ1/MCJ2
      const mcj1Cases = branchData.data?.find(b => b.branch_code === 'MCJ1')?.cnt || 0;
      const mcj2Cases = branchData.data?.find(b => b.branch_code === 'MCJ2')?.cnt || 0;

      const analytics = {
        totalCases: conversionData.data?.[0]?.denominator || 0,
        mcj1Cases,
        mcj2Cases,
        conversionRate: conversionData.data?.[0]?.conversion_rate || 0,
        topHospitals: topHospitalsData.data?.map(h => ({ name: h.hospital_name, count: h.cnt })) || [],
        topSpecialties: topSpecialtiesData.data?.map(s => ({ name: s.specialty, count: s.cnt })) || [],
        paidCases: 0, // TODO: Add revenue calculation if needed
        revenue: 0,
        lossTreeData: {
          cancelled: lossTreeData.data?.[0]?.cancelled_total || 0,
          pending: lossTreeData.data?.[0]?.pending_total || 0,
          cancelledBreakdown: {
            documentation: lossTreeData.data?.[0]?.cancelled_doc || 0,
            medical: lossTreeData.data?.[0]?.cancelled_medical || 0,
            insurance: lossTreeData.data?.[0]?.cancelled_ins || 0,
            other: lossTreeData.data?.[0]?.cancelled_other || 0
          },
          pendingBreakdown: {
            documentation: lossTreeData.data?.[0]?.pending_doc || 0,
            medical: lossTreeData.data?.[0]?.pending_medical || 0,
            insurance: lossTreeData.data?.[0]?.pending_ins || 0,
            other: lossTreeData.data?.[0]?.pending_other || 0
          }
        }
      };

      setKpiData(analytics);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [filters, loading]);

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchKPIData();
  }, [fetchKPIData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Read from Sheet1 (index 0) which contains the pivot table data
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Add __row index for each row (required by import function)
      const rowsWithIndex = jsonData.map((row, index) => ({
        ...row,
        __row: index + 1
      }));
      
      // Import to Supabase using the new RPC function
      const { data: importResult, error } = await supabase.rpc('import_excel_rows', {
        p_source_file: file.name,
        p_rows: rowsWithIndex
      });
      
      if (error) throw error;
      
      toast.success(`Successfully imported ${importResult} records to Supabase`);
      
      // Refresh KPI data to show the new data
      fetchKPIData();
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process Excel file');
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  // Show loading state
  if (loading && !kpiData) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">SIA Analytics Dashboard</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentAnalytics = kpiData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">SIA Analytics Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload"
          />
          <Button
            onClick={() => document.getElementById('excel-upload')?.click()}
            disabled={uploading}
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Bulk Upload Excel'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <SIAFiltersBar
        filters={filters}
        onUpdateFilter={updateFilter}
        onClearFilters={clearFilters}
      />

      {currentAnalytics ? (
        <>
          {/* Primary KPIs Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentAnalytics.totalCases}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">MCJ1 Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{currentAnalytics.mcj1Cases}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">MCJ2 Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{currentAnalytics.mcj2Cases}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfigModal(true)}
                    className="ml-2 p-0 h-auto text-xs"
                  >
                    Configure
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{currentAnalytics.conversionRate}%</div>
                <Progress value={currentAnalytics.conversionRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top 5 Hospitals */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Top 5 Hospitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalytics.topHospitals.slice(0, 5).map((hospital: any, index: number) => (
                    <div key={hospital.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{hospital.name}</span>
                      </div>
                      <span className="font-bold text-blue-600">{hospital.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Specialties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Top 5 Specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalytics.topSpecialties.slice(0, 5).map((specialty: any, index: number) => (
                    <div key={specialty.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{specialty.name}</span>
                      </div>
                      <span className="font-bold text-green-600">{specialty.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Loss Tree */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Loss Tree Analysis
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLossTreeModal(true)}
                    className="ml-2 p-0 h-auto text-xs"
                  >
                    Configure
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-red-600">Cancelled/Rejected</span>
                      <span className="font-bold text-red-600">{currentAnalytics.lossTreeData.cancelled}</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground ml-4">
                      <div className="flex justify-between">
                        <span>Documentation:</span>
                        <span>{currentAnalytics.lossTreeData.cancelledBreakdown.documentation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical:</span>
                        <span>{currentAnalytics.lossTreeData.cancelledBreakdown.medical}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance:</span>
                        <span>{currentAnalytics.lossTreeData.cancelledBreakdown.insurance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other:</span>
                        <span>{currentAnalytics.lossTreeData.cancelledBreakdown.other}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-yellow-600">Pending</span>
                      <span className="font-bold text-yellow-600">{currentAnalytics.lossTreeData.pending}</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground ml-4">
                      <div className="flex justify-between">
                        <span>Documentation:</span>
                        <span>{currentAnalytics.lossTreeData.pendingBreakdown.documentation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical:</span>
                        <span>{currentAnalytics.lossTreeData.pendingBreakdown.medical}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insurance:</span>
                        <span>{currentAnalytics.lossTreeData.pendingBreakdown.insurance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other:</span>
                        <span>{currentAnalytics.lossTreeData.pendingBreakdown.other}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No data available</p>
            <p className="text-sm text-muted-foreground">Upload an Excel file to see analytics</p>
          </div>
        </div>
      )}

      {/* Configuration Modals */}
      <SIAConfigurationModal
        open={showConfigModal}
        onOpenChange={setShowConfigModal}
        onSettingsUpdate={fetchKPIData}
      />

      <SIALossTreeModal
        open={showLossTreeModal}
        onOpenChange={setShowLossTreeModal}
        onSettingsUpdate={fetchKPIData}
      />
    </div>
  );
}