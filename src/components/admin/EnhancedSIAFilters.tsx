import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Calendar as CalendarIcon, Filter, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedSIAFiltersProps {
  filters: any;
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
  onAnalyze?: (analysis: AnalysisResult) => void;
}

interface AnalysisResult {
  monthData: {
    totalCases: number;
    statusBreakdown: Record<string, number>;
    branchBreakdown: Record<string, number>;
  };
  selectedMonth: string;
}

export default function EnhancedSIAFilters({ 
  filters, 
  onUpdateFilter, 
  onClearFilters,
  onAnalyze 
}: EnhancedSIAFiltersProps) {
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (filters.month) {
      performAnalysis();
    }
  }, [filters.month]);

  const loadFilterOptions = async () => {
    try {
      // Get unique statuses and branches from both tables
      const [medicalData, excelData] = await Promise.all([
        supabase
          .from('medical_requests')
          .select('status, branch_code')
          .not('status', 'is', null)
          .not('branch_code', 'is', null),
        
        supabase
          .from('excel_requests')
          .select('status, branch_code')
          .not('status', 'is', null)
          .not('branch_code', 'is', null)
      ]);

      if (medicalData.error) throw medicalData.error;
      if (excelData.error) throw excelData.error;

      const allData = [...(medicalData.data || []), ...(excelData.data || [])];
      
      const statuses = [...new Set(allData.map(item => item.status).filter(Boolean))];
      const branches = [...new Set(allData.map(item => item.branch_code).filter(Boolean))];

      setAvailableStatuses(statuses.sort());
      setAvailableBranches(branches.sort());
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const performAnalysis = async () => {
    if (!filters.month) return;

    try {
      const startOfMonth = new Date(filters.month.getFullYear(), filters.month.getMonth(), 1);
      const endOfMonth = new Date(filters.month.getFullYear(), filters.month.getMonth() + 1, 0);

      // Get data for the selected month from both tables
      const [medicalData, excelData] = await Promise.all([
        supabase
          .from('medical_requests')
          .select('status, branch_code, created_at')
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString()),
        
        supabase
          .from('excel_requests')
          .select('status, branch_code, created_at')
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString())
      ]);

      if (medicalData.error) throw medicalData.error;
      if (excelData.error) throw excelData.error;

      const monthData = [...(medicalData.data || []), ...(excelData.data || [])];

      // Calculate status breakdown
      const statusBreakdown: Record<string, number> = {};
      monthData.forEach(item => {
        if (item.status) {
          statusBreakdown[item.status] = (statusBreakdown[item.status] || 0) + 1;
        }
      });

      // Calculate branch breakdown
      const branchBreakdown: Record<string, number> = {};
      monthData.forEach(item => {
        if (item.branch_code) {
          branchBreakdown[item.branch_code] = (branchBreakdown[item.branch_code] || 0) + 1;
        }
      });

      const result: AnalysisResult = {
        monthData: {
          totalCases: monthData.length,
          statusBreakdown,
          branchBreakdown
        },
        selectedMonth: format(filters.month, 'MMM yyyy')
      };

      setAnalysisResult(result);
      onAnalyze?.(result);
    } catch (error) {
      console.error('Error performing analysis:', error);
    }
  };

  const hasActiveFilters = filters.month || 
    filters.statuses?.length > 0 || 
    filters.hospitals?.length > 0 || 
    filters.specialties?.length > 0 || 
    filters.branches?.length > 0;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">Filters:</span>
        
        {/* Month Filter - Primary */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {filters.month ? format(filters.month, 'MMM yyyy') : 'Select Month'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.month}
              onSelect={(date) => onUpdateFilter('month', date)}
              defaultMonth={filters.month || new Date()}
            />
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Select value="" onValueChange={(value) => {
          if (!filters.statuses?.includes(value)) {
            onUpdateFilter('statuses', [...(filters.statuses || []), value]);
          }
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Add Status Filter" />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map(status => (
              <SelectItem key={status} value={status} disabled={filters.statuses?.includes(status)}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Branch Filter */}
        <Select value="" onValueChange={(value) => {
          if (!filters.branches?.includes(value)) {
            onUpdateFilter('branches', [...(filters.branches || []), value]);
          }
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Add Branch Filter" />
          </SelectTrigger>
          <SelectContent>
            {availableBranches.map(branch => (
              <SelectItem key={branch} value={branch} disabled={filters.branches?.includes(branch)}>
                {branch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Show Analysis Toggle */}
        {filters.month && (
          <Button
            variant={showAnalysis ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {showAnalysis ? 'Hide' : 'Show'} Analysis
          </Button>
        )}
      </div>

      {/* Active Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.month && (
          <Badge variant="secondary" className="gap-1">
            Month: {format(filters.month, 'MMM yyyy')}
            <X className="h-3 w-3 cursor-pointer" onClick={() => onUpdateFilter('month', null)} />
          </Badge>
        )}
        
        {filters.statuses?.map((status: string) => (
          <Badge key={status} variant="secondary" className="gap-1">
            Status: {status}
            <X className="h-3 w-3 cursor-pointer" onClick={() => 
              onUpdateFilter('statuses', filters.statuses.filter((s: string) => s !== status))
            } />
          </Badge>
        ))}

        {filters.branches?.map((branch: string) => (
          <Badge key={branch} variant="secondary" className="gap-1">
            Branch: {branch}
            <X className="h-3 w-3 cursor-pointer" onClick={() => 
              onUpdateFilter('branches', filters.branches.filter((b: string) => b !== branch))
            } />
          </Badge>
        ))}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Analysis Results */}
      {showAnalysis && analysisResult && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            Excel Analysis for {analysisResult.selectedMonth}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Cases */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Total Cases</h4>
              <div className="text-2xl font-bold text-primary">
                {analysisResult.monthData.totalCases}
              </div>
            </div>

            {/* Status Breakdown */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Status Breakdown</h4>
              <div className="space-y-1">
                {Object.entries(analysisResult.monthData.statusBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="truncate">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Branch Breakdown */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Branch Breakdown</h4>
              <div className="space-y-1">
                {Object.entries(analysisResult.monthData.branchBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([branch, count]) => (
                    <div key={branch} className="flex justify-between text-sm">
                      <span className="truncate">{branch}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Analysis Workflow:</strong> 
              1. Month selected → 2. Status counts calculated → 3. Branch distribution shown → 4. Filters applied to SIA dashboard
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}