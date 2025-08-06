import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, LineChart, Edit, Save, Upload, Download, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import FinanceChartsDialog from "./FinanceChartsDialog";
import { saveFinanceAnalyticsData, loadFinanceAnalyticsData, deleteFinanceAnalyticsRow } from "@/services/financeAnalyticsService";

interface FinanceData {
  id: string;
  category: string;
  type: string;
  [key: string]: string | number; // For dynamic month columns
}

interface FinanceAnalyticsTableProps {
  onDataChange?: (data: FinanceData[]) => void;
}

export default function FinanceAnalyticsTable({ onDataChange }: FinanceAnalyticsTableProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>(["2023", "2024", "2025"]);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [chartType, setChartType] = useState<"achievement" | "growth-ytd">("achievement");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with empty structure or load from Supabase
  const [financeData, setFinanceData] = useState<FinanceData[]>([]);

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading finance analytics data...');
        const data = await loadFinanceAnalyticsData();
        console.log('Loaded data:', data);
        
        if (data.length === 0) {
          console.log('No data found, loading sample data');
          // Load sample data if no data exists
          loadSampleData();
        } else {
          setFinanceData(data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Loading from Sample Data",
          description: "Using sample data - save your changes to persist them.",
        });
        loadSampleData();
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get available years from the data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    financeData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'id' && key !== 'category' && key !== 'type') {
          const parts = key.split('-');
          const year = parts[1];
          if (year) years.add(`20${year}`);
        }
      });
    });
    return Array.from(years).sort();
  }, [financeData]);

  // Get filtered month columns based on selected years
  const filteredMonthColumns = useMemo(() => {
    return Object.keys(financeData[0] || {}).filter(key => {
      if (key === 'id' || key === 'category' || key === 'type') return false;
      const year = key.split('-')[1];
      return year && selectedYears.includes(`20${year}`);
    });
  }, [financeData, selectedYears]);

  // Get all month columns for adding new columns
  const allMonthColumns = Object.keys(financeData[0] || {}).filter(key => 
    key !== 'id' && key !== 'category' && key !== 'type'
  );

  const handleYearToggle = (year: string) => {
    setSelectedYears(prev => {
      const newSelection = prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year].sort();
      
      // Ensure at least one year is always selected
      const finalSelection = newSelection.length === 0 ? [year] : newSelection;
      
      // Save selected years to localStorage for sync with finance dashboard
      localStorage.setItem('financeSelectedYears', JSON.stringify(finalSelection));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('financeYearsUpdated'));
      
      return finalSelection;
    });
  };

  const handleCellChange = useCallback((rowId: string, column: string, value: string) => {
    console.log('Cell change:', { rowId, column, value }); // Debug log
    const updatedData = financeData.map(row => 
      row.id === rowId 
        ? { ...row, [column]: value === '' ? '' : (isNaN(Number(value)) ? value : Number(value)) }
        : row
    );
    console.log('Updated data:', updatedData); // Debug log
    setFinanceData(updatedData);
  }, [financeData]);

  const addRow = () => {
    const newRow: FinanceData = {
      id: Date.now().toString(),
      category: "New Category",
      type: "New Type",
      ...allMonthColumns.reduce((acc, month) => ({ ...acc, [month]: "" }), {})
    };
    
    const updatedData = [...financeData, newRow];
    setFinanceData(updatedData);
  };

  const calculateTotal = (column: string) => {
    // Only sum Actual MTD, AlBatal, and Ibn Rushd (exclude Forecast MTD)
    const actualRow = financeData.find(row => row.type === "Actual MTD");
    const albatalRow = financeData.find(row => row.category === "AlBatal");
    const ibnRushdRow = financeData.find(row => row.category === "Ibn Rushd");
    
    const actual = actualRow && typeof actualRow[column] === 'number' ? actualRow[column] as number : 0;
    const albatal = albatalRow && typeof albatalRow[column] === 'number' ? albatalRow[column] as number : 0;
    const ibnRushd = ibnRushdRow && typeof ibnRushdRow[column] === 'number' ? ibnRushdRow[column] as number : 0;
    
    return actual + albatal + ibnRushd;
  };

  // Calculate Achievement (Actual vs Forecast)
  const calculateAchievement = (column: string) => {
    const actualRow = financeData.find(row => row.type === "Actual MTD");
    const forecastRow = financeData.find(row => row.type === "Forecast MTD");
    
    if (!actualRow || !forecastRow) return "";
    
    const actual = typeof actualRow[column] === 'number' ? actualRow[column] as number : 0;
    const forecast = typeof forecastRow[column] === 'number' ? forecastRow[column] as number : 0;
    
    if (forecast === 0) return "#DIV/0!";
    return Math.round((actual / forecast) * 100) + "%";
  };

  // Helper functions
  const getMonthIndex = (month: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(month);
  };

  const getPreviousMonth = (column: string) => {
    const [month, year] = column.split('-');
    const monthIndex = getMonthIndex(month);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (monthIndex === 0) {
      // January, go to December of previous year
      const prevYear = String(parseInt(`20${year}`) - 1).slice(-2);
      return `Dec-${prevYear}`;
    } else {
      // Previous month same year
      return `${months[monthIndex - 1]}-${year}`;
    }
  };

  const saveData = async () => {
    try {
      setIsLoading(true);
      console.log('Saving finance analytics data...', financeData);
      await saveFinanceAnalyticsData(financeData);
      onDataChange?.(financeData);
      setIsEditing(false);
      
      // Also save to localStorage for immediate sync
      localStorage.setItem('financeAnalyticsData', JSON.stringify(financeData));
      localStorage.setItem('financeSelectedYears', JSON.stringify(selectedYears));
      
      // Dispatch events to notify other components
      window.dispatchEvent(new CustomEvent('financeAnalyticsUpdated'));
      window.dispatchEvent(new CustomEvent('financeYearsUpdated'));
      
      toast({
        title: "Data Saved",
        description: "Finance analytics data has been saved successfully.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Data Saved Locally",
        description: "Data saved to browser storage. Database save failed but data is preserved.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Convert Excel data to our format
        if (jsonData.length > 1) {
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          const newData: FinanceData[] = rows.map((row, index) => {
            const rowData: FinanceData = {
              id: (index + 1).toString(),
              category: row[0] || "",
              type: row[1] || "",
            };
            
            // Map remaining columns to month headers
            headers.slice(2).forEach((header, colIndex) => {
              rowData[header] = row[colIndex + 2] || "";
            });
            
            return rowData;
          });

          setFinanceData(newData);
          
          // Save to database immediately after import
          try {
            await saveFinanceAnalyticsData(newData);
            localStorage.setItem('financeAnalyticsData', JSON.stringify(newData));
            window.dispatchEvent(new CustomEvent('financeAnalyticsUpdated'));
            
            toast({
              title: "Excel Import Successful",
              description: `Imported ${newData.length} rows from Excel file and saved to database.`,
            });
          } catch (error) {
            toast({
              title: "Import Error",
              description: "Data imported but failed to save to database. Please save manually.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to import Excel file. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const loadSampleData = () => {
    const sampleData: FinanceData[] = [
      {
        id: "1",
        category: "External",
        type: "Actual MTD",
        "Jan-23": 250, "Feb-23": 278, "Mar-23": 284, "Apr-23": 211, "May-23": 151, "Jun-23": 206,
        "Jul-23": 419, "Aug-23": 181, "Sep-23": 250, "Oct-23": 455, "Nov-23": 192, "Dec-23": 340,
        "Jan-24": 187, "Feb-24": 248, "Mar-24": 321, "Apr-24": 365, "May-24": 405, "Jun-24": 403,
        "Jul-24": 195, "Aug-24": 307, "Sep-24": 428, "Oct-24": 337, "Nov-24": 282, "Dec-24": 337,
        "Jan-25": 350, "Feb-25": 350, "Mar-25": 136, "Apr-25": 583, "May-25": 341, "Jun-25": 166
      },
      {
        id: "2",
        category: "External",
        type: "Forecast MTD",
        "Jan-23": 322, "Feb-23": 283, "Mar-23": 243, "Apr-23": 221, "May-23": 358, "Jun-23": 285,
        "Jul-23": 313, "Aug-23": 386, "Sep-23": 366, "Oct-23": 418, "Nov-23": 406, "Dec-23": 351,
        "Jan-24": 281, "Feb-24": 262, "Mar-24": 257, "Apr-24": 213, "May-24": 303, "Jun-24": 252,
        "Jul-24": 297, "Aug-24": 284, "Sep-24": 292, "Oct-24": 319, "Nov-24": 256, "Dec-24": 283,
        "Jan-25": 191, "Feb-25": 254, "Mar-25": 329, "Apr-25": 374, "May-25": 415, "Jun-25": 414
      },
      {
        id: "3",
        category: "AlBatal",
        type: "",
        "Jan-23": "", "Feb-23": "", "Mar-23": "", "Apr-23": "", "May-23": "", "Jun-23": "",
        "Jul-23": "", "Aug-23": 77, "Sep-23": 161, "Oct-23": 148, "Nov-23": 124, "Dec-23": 165,
        "Jan-24": 153, "Feb-24": 163, "Mar-24": 111, "Apr-24": 138, "May-24": 151, "Jun-24": 94,
        "Jul-24": 117, "Aug-24": 105, "Sep-24": 115, "Oct-24": 28, "Nov-24": 88, "Dec-24": 95,
        "Jan-25": "", "Feb-25": "", "Mar-25": "", "Apr-25": "", "May-25": "", "Jun-25": ""
      },
      {
        id: "4",
        category: "Ibn Rushd",
        type: "",
        "Jan-23": "", "Feb-23": "", "Mar-23": "", "Apr-23": "", "May-23": "", "Jun-23": "",
        "Jul-23": "", "Aug-23": 62, "Sep-23": 68, "Oct-23": 92, "Nov-23": 26, "Dec-23": 92,
        "Jan-24": 24, "Feb-24": 46, "Mar-24": 59, "Apr-24": 47, "May-24": 127, "Jun-24": 146,
        "Jul-24": 50, "Aug-24": 68, "Sep-24": 96, "Oct-24": 39, "Nov-24": 23, "Dec-24": 82,
        "Jan-25": 24, "Feb-25": "", "Mar-25": "", "Apr-25": "", "May-25": "", "Jun-25": ""
      }
    ];
    
    setFinanceData(sampleData);
  };

  const exportToExcel = () => {
    console.log("Exporting finance data to Excel");
  };

  const importFromExcel = () => {
    handleExcelImport();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Finance Analytics Table</CardTitle>
          <CardDescription>Loading finance analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">Loading data from database...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Finance Analytics Table</CardTitle>
            <CardDescription>
              Track and analyze financial data with automatic calculations
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChartType("achievement");
                setChartDialogOpen(true);
              }}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Achievement Chart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChartType("growth-ytd");
                setChartDialogOpen(true);
              }}
            >
              <LineChart className="h-4 w-4 mr-2" />
              Growth YTD Chart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "View" : "Edit"}
            </Button>
            <Button 
              onClick={saveData} 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!isEditing || isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save to Database"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={importFromExcel}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button 
              onClick={loadSampleData} 
              variant="outline"
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? "Loading..." : "Load Sample Data"}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Year Filter Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-semibold">Filter by Year:</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {availableYears.map(year => (
              <div key={year} className="flex items-center space-x-2">
                <Checkbox
                  id={`year-${year}`}
                  checked={selectedYears.includes(year)}
                  onCheckedChange={() => handleYearToggle(year)}
                />
                <label htmlFor={`year-${year}`} className="text-sm cursor-pointer">
                  {year}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Showing {filteredMonthColumns.length} months from {selectedYears.length} selected year(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left font-semibold">Category</th>
                <th className="border border-gray-300 p-2 text-left font-semibold">Type</th>
                {filteredMonthColumns.map(month => (
                  <th key={month} className="border border-gray-300 p-2 text-center font-semibold min-w-[80px]">
                    {month}
                  </th>
                ))}
                {isEditing && (
                  <th className="border border-gray-300 p-2">
                    <Button variant="ghost" size="sm" onClick={addRow}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {financeData.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 p-2">
                    {isEditing ? (
                      <Input
                        value={row.category}
                        onChange={(e) => handleCellChange(row.id, 'category', e.target.value)}
                        className="border-0 bg-transparent p-1"
                      />
                    ) : (
                      <span className="font-medium">{row.category}</span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {isEditing ? (
                      <Input
                        value={row.type}
                        onChange={(e) => handleCellChange(row.id, 'type', e.target.value)}
                        className="border-0 bg-transparent p-1"
                      />
                    ) : (
                      <span className="text-sm">{row.type}</span>
                    )}
                  </td>
                  {filteredMonthColumns.map(month => (
                    <td key={month} className="border border-gray-300 p-2 text-center">
                      {isEditing ? (
                        <Input
                          value={row[month]?.toString() || ''}
                          onChange={(e) => handleCellChange(row.id, month, e.target.value)}
                          className="border-0 bg-transparent p-1 text-center"
                          type="text"
                        />
                      ) : (
                        <span className="font-mono text-sm">
                          {row[month] || ''}
                        </span>
                      )}
                    </td>
                  ))}
                  {isEditing && <td className="border border-gray-300 p-2"></td>}
                </tr>
              ))}
              
              {/* Total Row */}
              <tr className="bg-blue-50 font-bold">
                <td className="border border-gray-300 p-2" colSpan={2}>
                  Total
                </td>
                {filteredMonthColumns.map(month => (
                  <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm">
                    {calculateTotal(month) || ''}
                  </td>
                ))}
                {isEditing && <td className="border border-gray-300 p-2"></td>}
              </tr>

              {/* Achievement Row */}
              <tr className="bg-green-50 font-semibold">
                <td className="border border-gray-300 p-2" colSpan={2}>
                  Achievement
                </td>
                {filteredMonthColumns.map(month => (
                  <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm text-green-700">
                    {calculateAchievement(month)}
                  </td>
                ))}
                {isEditing && <td className="border border-gray-300 p-2"></td>}
              </tr>
            </tbody>
          </table>
        </div>
        
        {isEditing && (
          <div className="mt-4 flex justify-start">
            <Button variant="outline" onClick={addRow}>
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </div>
        )}
      </CardContent>

      <FinanceChartsDialog
        open={chartDialogOpen}
        onOpenChange={setChartDialogOpen}
        chartType={chartType}
        data={financeData}
        selectedYears={selectedYears}
      />

      {/* Hidden file input for Excel import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
    </Card>
  );
}