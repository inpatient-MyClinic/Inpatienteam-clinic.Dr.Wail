import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bug, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ValidationResult {
  raw_data_sample: any;
  date_parsing_stats: any;
  status_mapping: any;
  total_by_method: any;
}

export const ExcelDataValidator: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('7');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runValidation = async () => {
    setLoading(true);
    try {
      // Run the debug function
      const { data: debugData, error: debugError } = await supabase.rpc(
        'debug_excel_data_for_month',
        {
          p_year: parseInt(selectedYear),
          p_month: parseInt(selectedMonth)
        }
      );

      if (debugError) {
        throw debugError;
      }

      // Get the analytics data for comparison
      const { data: analyticsData, error: analyticsError } = await supabase.rpc(
        'analyze_excel_cases_monthly',
        {
          p_year: parseInt(selectedYear),
          p_month: parseInt(selectedMonth)
        }
      );

      if (analyticsError) {
        throw analyticsError;
      }

      if (debugData && debugData.length > 0) {
        setValidationResult(debugData[0]);
        
        const totalCases = analyticsData?.[0]?.total_cases || 0;
        const statusBreakdown = analyticsData?.[0]?.status_breakdown || {};
        
        toast({
          title: "Validation Complete",
          description: `Found ${totalCases} cases for ${selectedMonth}/${selectedYear}`,
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = ['2024', '2025', '2026'];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Excel Data Validator
          </CardTitle>
          <CardDescription>
            Debug and validate Excel data processing for specific months
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={runValidation} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Bug className="mr-2 h-4 w-4" />
                Run Validation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {validationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Date Parsing Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>Total Rows: {validationResult.date_parsing_stats?.total_rows || 0}</div>
                <div>Has Date Field: {validationResult.date_parsing_stats?.has_date_of_request || 0}</div>
                <div>Parseable Dates: {validationResult.date_parsing_stats?.parseable_dates || 0}</div>
                <div className="font-medium text-primary">
                  Target Month/Year: {validationResult.date_parsing_stats?.target_month_year || 0}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Method Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>Raw Data Method: {validationResult.total_by_method?.raw_data_method || 0}</div>
                <div>Old Column Method: {validationResult.total_by_method?.old_column_method || 0}</div>
                <div className="text-xs text-muted-foreground">
                  Raw Data Method should be used (uses correct Excel columns)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Status Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                {validationResult.status_mapping && Object.entries(validationResult.status_mapping).map(([status, count]) => (
                  <div key={status} className="bg-muted p-2 rounded">
                    <div className="font-medium">{status}</div>
                    <div className="text-muted-foreground">{count as number}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Sample Raw Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(validationResult.raw_data_sample, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};