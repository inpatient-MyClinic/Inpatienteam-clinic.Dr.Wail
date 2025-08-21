import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, FileSpreadsheet, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExcelAnalysisResult {
  totalCases: number;
  statusBreakdown: Record<string, number>;
  branchBreakdown: Record<string, number>;
  rawData: any[];
}

export default function ExcelDataAnalyzer() {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ExcelAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const performExcelAnalysis = async () => {
    if (!selectedMonth) {
      toast({
        title: "Month Required",
        description: "Please select a month to analyze",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const targetMonth = selectedMonth.getMonth() + 1; // JavaScript months are 0-indexed
      const targetYear = selectedMonth.getFullYear();

      console.log(`Analyzing Excel data for ${targetMonth}/${targetYear}`);

      const { data, error: queryError } = await supabase
        .rpc('analyze_excel_data_by_month', {
          target_month: targetMonth,
          target_year: targetYear
        });

      if (queryError) throw queryError;

      if (data && data.length > 0) {
        const result = data[0];
        const analysisData: ExcelAnalysisResult = {
          totalCases: Number(result.total_cases) || 0,
          statusBreakdown: (result.status_breakdown as Record<string, number>) || {},
          branchBreakdown: (result.branch_breakdown as Record<string, number>) || {},
          rawData: (result.raw_data as any[]) || []
        };

        setAnalysisResult(analysisData);
        
        console.log('Excel Analysis Result:', analysisData);
        
        toast({
          title: "Analysis Complete",
          description: `Found ${analysisData.totalCases} cases in Excel data for ${format(selectedMonth, 'MMM yyyy')}`,
        });
      } else {
        setAnalysisResult({
          totalCases: 0,
          statusBreakdown: {},
          branchBreakdown: {},
          rawData: []
        });
        
        toast({
          title: "No Data Found",
          description: `No Excel data found for ${format(selectedMonth, 'MMM yyyy')}`,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Excel analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed');
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : 'Failed to analyze Excel data',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Excel Data Analyzer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Direct analysis from uploaded Excel sheets (Column AP = Date, Column AI = Status)
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedMonth ? format(selectedMonth, 'MMM yyyy') : 'Select Month'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={setSelectedMonth}
                  defaultMonth={selectedMonth || new Date()}
                />
              </PopoverContent>
            </Popover>

            <Button 
              onClick={performExcelAnalysis} 
              disabled={!selectedMonth || loading}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              {loading ? 'Analyzing...' : 'Analyze Excel Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="grid gap-6">
          {/* Grand Total - Excel Style */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Excel Analysis for {selectedMonth ? format(selectedMonth, 'MMM yyyy') : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {analysisResult.totalCases}
                </div>
                <div className="text-sm text-muted-foreground">
                  Grand Total (Count of Patient's MRN)
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown - Column AI */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Distribution (Column AI)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analysisResult.statusBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center py-2 px-3 hover:bg-muted/50 rounded">
                        <span className="font-medium">{status}</span>
                        <Badge variant="secondary" className="font-bold">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  
                  {Object.keys(analysisResult.statusBreakdown).length > 0 && (
                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between items-center py-2 px-3 bg-primary/10 rounded font-bold">
                        <span>Grand Total</span>
                        <Badge variant="default">
                          {analysisResult.totalCases}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Branch Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">My Clinic Branch Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analysisResult.branchBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([branch, count]) => (
                      <div key={branch} className="flex justify-between items-center py-2 px-3 hover:bg-muted/50 rounded">
                        <span className="font-medium">{branch}</span>
                        <Badge variant="outline" className="font-bold">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  
                  {Object.keys(analysisResult.branchBreakdown).length > 0 && (
                    <div className="border-t pt-2 mt-3">
                      <div className="text-xs text-muted-foreground text-center">
                        Total across all branches: {analysisResult.totalCases}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Information */}
          {analysisResult.rawData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sample Data (Debug)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {analysisResult.rawData.slice(0, 5).map((item, index) => (
                    <div key={index} className="text-xs bg-muted p-2 rounded">
                      <div>Status: {item.status} | Branch: {item.branch}</div>
                      <div>Date Raw: {item.date_raw} | Parsed: {item.date_parsed}</div>
                      <div>Hospital: {item.hospital} | Specialty: {item.specialty}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}