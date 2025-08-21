import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bug, Database, Filter, Calendar as CalendarIcon, RefreshCw, Download } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RawDataRow {
  id?: string;
  Date: any;
  Status: any;
  Branch: any;
  'Hospital Name': any;
  Specialty: any;
  'Paid Amount': any;
  upload_id?: string;
  row_no?: number;
}

interface ProcessedDataRow {
  originalDate: any;
  parsedDate: Date | null;
  dateString: string;
  month: string;
  status: string;
  branch: string;
  hospital: string;
  specialty: string;
  paidAmount: number;
  rowIndex: number;
  isValid: boolean;
  parseErrors: string[];
}

interface AnalysisResults {
  totalRawRows: number;
  totalProcessedRows: number;
  totalValidRows: number;
  uniqueMonths: string[];
  uniqueStatuses: string[];
  uniqueBranches: string[];
  monthlyBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  branchBreakdown: Record<string, number>;
}

export default function DataAnalysisDebugger() {
  const [rawData, setRawData] = useState<RawDataRow[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedDataRow[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [filteredData, setFilteredData] = useState<ProcessedDataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Load and analyze data
  const loadAndAnalyzeData = async () => {
    setLoading(true);
    console.log('🔍 === DATA ANALYSIS DEBUGGER STARTED ===');
    
    try {
      // Step 1: Load raw data
      console.log('📊 Step 1: Loading raw data from excel_rows_raw...');
      const { data: rawRows, error: rawError } = await supabase
        .from('excel_rows_raw')
        .select('*');

      if (rawError) throw rawError;

      console.log(`✅ Raw data loaded: ${rawRows?.length || 0} rows`);
      console.log('📝 Sample raw rows:', rawRows?.slice(0, 3));
      
      setRawData(rawRows || []);

      // Step 2: Process data
      console.log('🔄 Step 2: Processing data...');
      const processed = processRawData(rawRows || []);
      setProcessedData(processed);

      // Step 3: Analyze data
      console.log('📈 Step 3: Analyzing processed data...');
      const analysis = analyzeProcessedData(processed);
      setAnalysisResults(analysis);

      // Step 4: Filter by selected month if any
      if (selectedMonth) {
        console.log('🎯 Step 4: Filtering by selected month...');
        filterDataByMonth(processed, selectedMonth);
      }

      toast({
        title: "Analysis Complete",
        description: `Processed ${processed.length} rows, ${analysis.totalValidRows} valid`,
      });

    } catch (error) {
      console.error('❌ Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Process raw data with detailed logging
  const processRawData = (rawRows: RawDataRow[]): ProcessedDataRow[] => {
    console.log('🔄 Processing raw data rows...');
    
    return rawRows.map((row, index) => {
      const errors: string[] = [];
      
      // Parse Excel date with comprehensive logging
      const parseExcelDate = (dateValue: any): { date: Date | null; error: string | null } => {
        if (!dateValue) {
          return { date: null, error: 'Empty date value' };
        }

        console.log(`📅 Parsing date for row ${index + 1}: "${dateValue}" (type: ${typeof dateValue})`);

        let parsedDate: Date | null = null;

        // Method 1: Excel serial number (string)
        if (typeof dateValue === 'string' && dateValue.match(/^\d+$/)) {
          const serialNumber = parseInt(dateValue);
          if (serialNumber > 25000) {
            parsedDate = new Date((serialNumber - 25569) * 86400 * 1000);
            console.log(`✅ Excel serial (string) ${serialNumber} -> ${parsedDate}`);
          } else {
            return { date: null, error: `Serial number too small: ${serialNumber}` };
          }
        }

        // Method 2: Excel serial number (number)
        if (!parsedDate && typeof dateValue === 'number' && dateValue > 25000) {
          parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
          console.log(`✅ Excel serial (number) ${dateValue} -> ${parsedDate}`);
        }

        // Method 3: Date string formats
        if (!parsedDate && typeof dateValue === 'string') {
          // Try direct parsing
          parsedDate = new Date(dateValue);
          if (!isNaN(parsedDate.getTime())) {
            console.log(`✅ Direct date parsing: "${dateValue}" -> ${parsedDate}`);
          } else {
            // Try MM/DD/YYYY format
            const parts = dateValue.split('/');
            if (parts.length === 3) {
              const [month, day, year] = parts;
              parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
              if (!isNaN(parsedDate.getTime())) {
                console.log(`✅ MM/DD/YYYY parsing: "${dateValue}" -> ${parsedDate}`);
              } else {
                return { date: null, error: `Could not parse date format: ${dateValue}` };
              }
            } else {
              return { date: null, error: `Invalid date format: ${dateValue}` };
            }
          }
        }

        if (!parsedDate || isNaN(parsedDate.getTime())) {
          return { date: null, error: `Failed to parse date: ${dateValue}` };
        }

        return { date: parsedDate, error: null };
      };

      const { date: parsedDate, error: dateError } = parseExcelDate(row.Date);
      if (dateError) errors.push(dateError);

      // Get month name
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = parsedDate ? monthNames[parsedDate.getMonth()] : '';

      // Clean and validate other fields
      const status = (row.Status || '').toString().trim();
      const branch = (row.Branch || '').toString().trim();
      const hospital = (row['Hospital Name'] || '').toString().trim();
      const specialty = (row.Specialty || '').toString().trim();

      if (!status) errors.push('Empty status');
      if (!branch) errors.push('Empty branch');

      const processedRow: ProcessedDataRow = {
        originalDate: row.Date,
        parsedDate,
        dateString: parsedDate ? parsedDate.toISOString().split('T')[0] : '',
        month,
        status,
        branch,
        hospital,
        specialty,
        paidAmount: parseFloat(row['Paid Amount'] || '0'),
        rowIndex: index + 1,
        isValid: parsedDate !== null && status !== '' && month !== '',
        parseErrors: errors
      };

      if (processedRow.isValid) {
        console.log(`✅ Row ${index + 1} processed successfully:`, {
          date: processedRow.dateString,
          month: processedRow.month,
          status: processedRow.status,
          branch: processedRow.branch
        });
      } else {
        console.log(`❌ Row ${index + 1} has errors:`, processedRow.parseErrors);
      }

      return processedRow;
    });
  };

  // Analyze processed data
  const analyzeProcessedData = (processedRows: ProcessedDataRow[]): AnalysisResults => {
    const validRows = processedRows.filter(row => row.isValid);
    
    const monthlyBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};
    const branchBreakdown: Record<string, number> = {};

    validRows.forEach(row => {
      // Count by month
      monthlyBreakdown[row.month] = (monthlyBreakdown[row.month] || 0) + 1;
      
      // Count by status
      statusBreakdown[row.status] = (statusBreakdown[row.status] || 0) + 1;
      
      // Count by branch
      if (row.branch) {
        branchBreakdown[row.branch] = (branchBreakdown[row.branch] || 0) + 1;
      }
    });

    const analysis: AnalysisResults = {
      totalRawRows: processedRows.length,
      totalProcessedRows: processedRows.length,
      totalValidRows: validRows.length,
      uniqueMonths: [...new Set(validRows.map(row => row.month))].sort(),
      uniqueStatuses: [...new Set(validRows.map(row => row.status))].sort(),
      uniqueBranches: [...new Set(validRows.map(row => row.branch).filter(Boolean))].sort(),
      monthlyBreakdown,
      statusBreakdown,
      branchBreakdown
    };

    console.log('📊 Analysis Results:', analysis);
    return analysis;
  };

  // Filter data by month
  const filterDataByMonth = (processedRows: ProcessedDataRow[], month: Date) => {
    const monthName = format(month, 'MMM');
    console.log(`🎯 Filtering data for month: ${monthName}`);
    
    const filtered = processedRows.filter(row => row.isValid && row.month === monthName);
    console.log(`✅ Filtered ${filtered.length} rows for ${monthName}`);
    
    setFilteredData(filtered);
  };

  // Load data on component mount
  useEffect(() => {
    loadAndAnalyzeData();
  }, []);

  // Filter when month changes
  useEffect(() => {
    if (selectedMonth && processedData.length > 0) {
      filterDataByMonth(processedData, selectedMonth);
    } else {
      setFilteredData([]);
    }
  }, [selectedMonth, processedData]);

  // Export debug data
  const exportDebugData = () => {
    const debugData = {
      rawData: rawData.slice(0, 10), // First 10 raw rows
      processedData: processedData.slice(0, 10), // First 10 processed rows
      analysisResults,
      filteredData: filteredData.slice(0, 10), // First 10 filtered rows
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-analysis-debug-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Analyzing data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Data Analysis Debugger
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadAndAnalyzeData}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportDebugData}>
                <Download className="h-4 w-4 mr-1" />
                Export Debug Data
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      {analysisResults && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{analysisResults.totalRawRows}</div>
              <div className="text-sm text-muted-foreground">Raw Rows</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{analysisResults.totalValidRows}</div>
              <div className="text-sm text-muted-foreground">Valid Rows</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {analysisResults.totalRawRows - analysisResults.totalValidRows}
              </div>
              <div className="text-sm text-muted-foreground">Invalid Rows</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{filteredData.length}</div>
              <div className="text-sm text-muted-foreground">Filtered Rows</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Month Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter by Month:</span>
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
                />
              </PopoverContent>
            </Popover>
            {selectedMonth && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedMonth(null)}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
              <TabsTrigger value="processed">Processed Data</TabsTrigger>
              <TabsTrigger value="filtered">Filtered Data</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {analysisResults && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Monthly Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Monthly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analysisResults.monthlyBreakdown)
                          .sort(([,a], [,b]) => b - a)
                          .map(([month, count]) => (
                            <div key={month} className="flex justify-between">
                              <span>{month}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analysisResults.statusBreakdown)
                          .sort(([,a], [,b]) => b - a)
                          .map(([status, count]) => (
                            <div key={status} className="flex justify-between">
                              <span className="truncate">{status}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Branch Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Branch Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analysisResults.branchBreakdown)
                          .sort(([,a], [,b]) => b - a)
                          .map(([branch, count]) => (
                            <div key={branch} className="flex justify-between">
                              <span className="truncate">{branch}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="raw">
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Date (Raw)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Specialty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawData.slice(0, 50).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{JSON.stringify(row.Date)}</TableCell>
                        <TableCell>{row.Status}</TableCell>
                        <TableCell>{row.Branch}</TableCell>
                        <TableCell>{row['Hospital Name']}</TableCell>
                        <TableCell>{row.Specialty}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="processed">
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Original Date</TableHead>
                      <TableHead>Parsed Date</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Valid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.slice(0, 50).map((row, index) => (
                      <TableRow key={index} className={!row.isValid ? 'bg-red-50' : ''}>
                        <TableCell>{row.rowIndex}</TableCell>
                        <TableCell className="font-mono text-xs">{JSON.stringify(row.originalDate)}</TableCell>
                        <TableCell className="font-mono text-xs">{row.dateString}</TableCell>
                        <TableCell>{row.month}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.branch}</TableCell>
                        <TableCell>
                          <Badge variant={row.isValid ? "default" : "destructive"}>
                            {row.isValid ? "✓" : "✗"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="filtered">
              <div className="space-y-4">
                {selectedMonth ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Showing {filteredData.length} records for {format(selectedMonth, 'MMM yyyy')}
                      </Badge>
                    </div>
                    <ScrollArea className="h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Hospital</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredData.slice(0, 50).map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.rowIndex}</TableCell>
                              <TableCell>{row.dateString}</TableCell>
                              <TableCell>{row.status}</TableCell>
                              <TableCell>{row.branch}</TableCell>
                              <TableCell>{row.hospital}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a month to see filtered data
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="errors">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {processedData
                    .filter(row => !row.isValid)
                    .map((row, index) => (
                      <Card key={index} className="border-red-200">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge variant="destructive" className="mb-2">Row {row.rowIndex}</Badge>
                              <div className="text-sm">
                                <div><strong>Original Date:</strong> {JSON.stringify(row.originalDate)}</div>
                                <div><strong>Status:</strong> {row.status || '(empty)'}</div>
                                <div><strong>Branch:</strong> {row.branch || '(empty)'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-red-600">
                                {row.parseErrors.map((error, i) => (
                                  <div key={i}>{error}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}