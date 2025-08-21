import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter, RotateCcw, Download, Table2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PivotData {
  date: string;
  month: string;
  status: string;
  branch: string;
  hospital: string;
  specialty: string;
  paidAmount: number;
  patientMRN: string;
}

interface PivotFilters {
  months: string[];
  statuses: string[];
  branches: string[];
  hospitals: string[];
  specialties: string[];
}

interface PivotSummary {
  grandTotal: number;
  statusBreakdown: Record<string, number>;
  branchBreakdown: Record<string, number>;
  hospitalBreakdown: Record<string, number>;
  specialtyBreakdown: Record<string, number>;
}

export default function ExcelPivotTable() {
  const [rawData, setRawData] = useState<PivotData[]>([]);
  const [filters, setFilters] = useState<PivotFilters>({
    months: [],
    statuses: [],
    branches: [],
    hospitals: [],
    specialties: []
  });
  const [availableFilters, setAvailableFilters] = useState<{
    months: string[];
    statuses: string[];
    branches: string[];
    hospitals: string[];
    specialties: string[];
  }>({
    months: [],
    statuses: [],
    branches: [],
    hospitals: [],
    specialties: []
  });
  const [loading, setLoading] = useState(false);
  const [pivotView, setPivotView] = useState<'status' | 'branch' | 'hospital'>('status');
  const { toast } = useToast();

  // Load raw Excel data
  useEffect(() => {
    loadExcelData();
  }, []);

  const loadExcelData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('excel_rows_raw')
        .select('*')
        .not('Status', 'is', null)
        .not('Date', 'is', null);

      if (error) throw error;

      const processedData: PivotData[] = (data || []).map((row, index) => {
        // Parse Excel date
        const parseExcelDate = (dateValue: any): { date: string; month: string } => {
          if (!dateValue) return { date: '', month: '' };
          
          let parsedDate: Date | null = null;
          
          // Handle Excel serial numbers
          if (typeof dateValue === 'string' && dateValue.match(/^\d+$/)) {
            const serialNumber = parseInt(dateValue);
            if (serialNumber > 25000) {
              parsedDate = new Date((serialNumber - 25569) * 86400 * 1000);
            }
          }
          
          // Handle date strings
          if (!parsedDate && typeof dateValue === 'string') {
            parsedDate = new Date(dateValue);
            if (isNaN(parsedDate.getTime())) {
              // Try MM/DD/YYYY format
              const parts = dateValue.split('/');
              if (parts.length === 3) {
                parsedDate = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
              }
            }
          }
          
          if (!parsedDate || isNaN(parsedDate.getTime())) {
            return { date: '', month: '' };
          }
          
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          
          return {
            date: parsedDate.toISOString().split('T')[0],
            month: monthNames[parsedDate.getMonth()]
          };
        };

        const { date, month } = parseExcelDate(row.Date);
        
        return {
          date,
          month,
          status: row.Status || '',
          branch: row.Branch || '',
          hospital: row['Hospital Name'] || '',
          specialty: row.Specialty || '',
          paidAmount: parseFloat(row['Paid Amount'] || '0'),
          patientMRN: `MRN-${index + 1}` // Generate MRN for counting
        };
      }).filter(item => item.date && item.month); // Only include valid dates

      setRawData(processedData);

      // Extract unique values for filters
      const months = [...new Set(processedData.map(item => item.month))].sort();
      const statuses = [...new Set(processedData.map(item => item.status))].filter(Boolean).sort();
      const branches = [...new Set(processedData.map(item => item.branch))].filter(Boolean).sort();
      const hospitals = [...new Set(processedData.map(item => item.hospital))].filter(Boolean).sort();
      const specialties = [...new Set(processedData.map(item => item.specialty))].filter(Boolean).sort();

      setAvailableFilters({
        months,
        statuses,
        branches,
        hospitals,
        specialties
      });

      toast({
        title: "Data Loaded",
        description: `Loaded ${processedData.length} records from Excel`
      });

    } catch (error) {
      console.error('Error loading Excel data:', error);
      toast({
        title: "Error",
        description: "Failed to load Excel data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return rawData.filter(item => {
      if (filters.months.length > 0 && !filters.months.includes(item.month)) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) return false;
      if (filters.branches.length > 0 && !filters.branches.includes(item.branch)) return false;
      if (filters.hospitals.length > 0 && !filters.hospitals.includes(item.hospital)) return false;
      if (filters.specialties.length > 0 && !filters.specialties.includes(item.specialty)) return false;
      return true;
    });
  }, [rawData, filters]);

  // Calculate pivot summary
  const pivotSummary: PivotSummary = useMemo(() => {
    const statusBreakdown: Record<string, number> = {};
    const branchBreakdown: Record<string, number> = {};
    const hospitalBreakdown: Record<string, number> = {};
    const specialtyBreakdown: Record<string, number> = {};

    filteredData.forEach(item => {
      // Count by status
      statusBreakdown[item.status] = (statusBreakdown[item.status] || 0) + 1;
      
      // Count by branch
      if (item.branch) {
        branchBreakdown[item.branch] = (branchBreakdown[item.branch] || 0) + 1;
      }
      
      // Count by hospital
      if (item.hospital) {
        hospitalBreakdown[item.hospital] = (hospitalBreakdown[item.hospital] || 0) + 1;
      }
      
      // Count by specialty
      if (item.specialty) {
        specialtyBreakdown[item.specialty] = (specialtyBreakdown[item.specialty] || 0) + 1;
      }
    });

    return {
      grandTotal: filteredData.length,
      statusBreakdown,
      branchBreakdown,
      hospitalBreakdown,
      specialtyBreakdown
    };
  }, [filteredData]);

  // Update filter
  const updateFilter = (filterType: keyof PivotFilters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      months: [],
      statuses: [],
      branches: [],
      hospitals: [],
      specialties: []
    });
  };

  // Get active filter count
  const activeFilterCount = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table2 className="h-5 w-5" />
              Excel Pivot Table Analyzer
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredData.length} of {rawData.length} records
              </Badge>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear Filters ({activeFilterCount})
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Pivot Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Month Filter */}
            <div>
              <h4 className="font-medium text-sm mb-2">Month</h4>
              <ScrollArea className="h-32 border rounded p-2">
                {availableFilters.months.map(month => (
                  <div key={month} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`month-${month}`}
                      checked={filters.months.includes(month)}
                      onCheckedChange={(checked) => updateFilter('months', month, !!checked)}
                    />
                    <label htmlFor={`month-${month}`} className="text-sm font-medium cursor-pointer">
                      {month}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="font-medium text-sm mb-2">Status (Column AI)</h4>
              <ScrollArea className="h-32 border rounded p-2">
                {availableFilters.statuses.map(status => (
                  <div key={status} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.statuses.includes(status)}
                      onCheckedChange={(checked) => updateFilter('statuses', status, !!checked)}
                    />
                    <label htmlFor={`status-${status}`} className="text-sm font-medium cursor-pointer">
                      {status}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Branch Filter */}
            <div>
              <h4 className="font-medium text-sm mb-2">My Clinic Branch</h4>
              <ScrollArea className="h-24 border rounded p-2">
                {availableFilters.branches.map(branch => (
                  <div key={branch} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`branch-${branch}`}
                      checked={filters.branches.includes(branch)}
                      onCheckedChange={(checked) => updateFilter('branches', branch, !!checked)}
                    />
                    <label htmlFor={`branch-${branch}`} className="text-sm font-medium cursor-pointer">
                      {branch}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Pivot Table Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* View Selector */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Pivot View:</span>
                <Select value={pivotView} onValueChange={(value: 'status' | 'branch' | 'hospital') => setPivotView(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Count by Status</SelectItem>
                    <SelectItem value="branch">Count by Branch</SelectItem>
                    <SelectItem value="hospital">Count by Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Grand Total */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {pivotSummary.grandTotal}
              </div>
              <div className="text-sm text-muted-foreground">
                Grand Total - Count of Patient's MRN
              </div>
            </CardContent>
          </Card>

          {/* Pivot Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {pivotView === 'status' && 'Count of Patient\'s MRN by Status'}
                {pivotView === 'branch' && 'Count of Patient\'s MRN by Branch'}
                {pivotView === 'hospital' && 'Count of Patient\'s MRN by Hospital'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row Labels</TableHead>
                    <TableHead className="text-right">Count of Patient's MRN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(
                    pivotView === 'status' ? pivotSummary.statusBreakdown :
                    pivotView === 'branch' ? pivotSummary.branchBreakdown :
                    pivotSummary.hospitalBreakdown
                  )
                    .sort(([,a], [,b]) => b - a)
                    .map(([label, count]) => (
                      <TableRow key={label}>
                        <TableCell className="font-medium">{label}</TableCell>
                        <TableCell className="text-right font-bold">{count}</TableCell>
                      </TableRow>
                    ))}
                  <TableRow className="bg-primary/10 font-bold">
                    <TableCell>Grand Total</TableCell>
                    <TableCell className="text-right">{pivotSummary.grandTotal}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}