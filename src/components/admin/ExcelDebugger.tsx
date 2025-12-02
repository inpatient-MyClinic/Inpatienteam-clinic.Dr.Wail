import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bug, Calendar, Database, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DebugData {
  raw_data_sample: any;
  date_parsing_stats: any;
  status_mapping: any;
  total_by_method: any;
}

export function ExcelDebugger() {
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(7);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);

  const runDebugAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('debug_excel_data_for_month', {
        p_year: year,
        p_month: month
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setDebugData(data[0]);
        toast.success('Debug analysis completed');
      } else {
        toast.error('No debug data returned');
      }
    } catch (error: any) {
      console.error('Debug analysis error:', error);
      toast.error('Debug analysis failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-destructive" />
            Excel Data Debugger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-20"
              />
            </div>
            <Button 
              onClick={runDebugAnalysis}
              disabled={loading}
              className="mt-6"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Analyzing...' : 'Run Debug'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {debugData && (
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="status">Status Analysis</TabsTrigger>
            <TabsTrigger value="sample">Sample Data</TabsTrigger>
            <TabsTrigger value="comparison">Method Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Date Parsing Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {debugData.date_parsing_stats?.total_rows || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {debugData.date_parsing_stats?.has_date_of_request || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Has Date Field</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {debugData.date_parsing_stats?.parseable_dates || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Parseable Dates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {debugData.date_parsing_stats?.target_month_year || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Target Month/Year</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution for {month}/{year}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debugData.status_mapping && Object.entries(debugData.status_mapping).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{status}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sample" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sample Raw Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {debugData.raw_data_sample?.map((sample: any, index: number) => (
                    <div key={index} className="p-4 border rounded bg-muted">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Row:</strong> {sample.row_number}</div>
                        <div><strong>Date Raw:</strong> {sample.date_of_request}</div>
                        <div><strong>Parsed Date:</strong> {sample.parsed_date}</div>
                        <div><strong>Status:</strong> {sample.status_of_operation}</div>
                        <div><strong>Branch:</strong> {sample.branch}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Counting Method Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-3xl font-bold text-green-600">
                      {debugData.total_by_method?.raw_data_method || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Raw Data Method</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Using raw_data-&gt;&gt;'Date of Request:'
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-3xl font-bold text-red-600">
                      {debugData.total_by_method?.old_column_method || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Old Column Method</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Using "Date" column
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Expected:</strong> The raw data method should match your manual count of 209 for July 2025.
                    The old column method will likely show 0 because those columns are mostly NULL.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}