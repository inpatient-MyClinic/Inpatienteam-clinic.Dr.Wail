import React, { useState, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Download, Upload, Save, Edit3, Filter, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with empty structure or sample data
  const [financeData, setFinanceData] = useState<FinanceData[]>([
    {
      id: "1",
      category: "External",
      type: "Actual MTD",
      "Jan-23": "", "Feb-23": "", "Mar-23": "", "Apr-23": "", "May-23": "", "Jun-23": "",
      "Jul-23": "", "Aug-23": "", "Sep-23": "", "Oct-23": "", "Nov-23": "", "Dec-23": "",
      "Jan-24": "", "Feb-24": "", "Mar-24": "", "Apr-24": "", "May-24": "", "Jun-24": "",
      "Jul-24": "", "Aug-24": "", "Sep-24": "", "Oct-24": "", "Nov-24": "", "Dec-24": "",
      "Jan-25": "", "Feb-25": "", "Mar-25": "", "Apr-25": "", "May-25": "", "Jun-25": "",
      "Jul-25": "", "Aug-25": "", "Sep-25": "", "Oct-25": "", "Nov-25": "", "Dec-25": ""
    },
    {
      id: "forecast-1",
      category: "External",
      type: "Forecast MTD",
      "Jan-23": "", "Feb-23": "", "Mar-23": "", "Apr-23": "", "May-23": "", "Jun-23": "",
      "Jul-23": "", "Aug-23": "", "Sep-23": "", "Oct-23": "", "Nov-23": "", "Dec-23": "",
      "Jan-24": "", "Feb-24": "", "Mar-24": "", "Apr-24": "", "May-24": "", "Jun-24": "",
      "Jul-24": "", "Aug-24": "", "Sep-24": "", "Oct-24": "", "Nov-24": "", "Dec-24": "",
      "Jan-25": "", "Feb-25": "", "Mar-25": "", "Apr-25": "", "May-25": "", "Jun-25": "",
      "Jul-25": "", "Aug-25": "", "Sep-25": "", "Oct-25": "", "Nov-25": "", "Dec-25": ""
    },
    {
      id: "2",
      category: "AlBatal",
      type: "",
      "Jan-23": "", "Feb-23": "", "Mar-23": "", "Apr-23": "", "May-23": "", "Jun-23": "",
      "Jul-23": "", "Aug-23": "", "Sep-23": "", "Oct-23": "", "Nov-23": "", "Dec-23": "",
      "Jan-24": "", "Feb-24": "", "Mar-24": "", "Apr-24": "", "May-24": "", "Jun-24": "",
      "Jul-24": "", "Aug-24": "", "Sep-24": "", "Oct-24": "", "Nov-24": "", "Dec-24": "",
      "Jan-25": "", "Feb-25": "", "Mar-25": "", "Apr-25": "", "May-25": "", "Jun-25": "",
      "Jul-25": "", "Aug-25": "", "Sep-25": "", "Oct-25": "", "Nov-25": "", "Dec-25": ""
    },
    {
      id: "3",
      category: "Ibn Rushd",
      type: "",
      "Jan-23": "", "Feb-23": "", "Mar-23": "", "Apr-23": "", "May-23": "", "Jun-23": "",
      "Jul-23": "", "Aug-23": "", "Sep-23": "", "Oct-23": "", "Nov-23": "", "Dec-23": "",
      "Jan-24": "", "Feb-24": "", "Mar-24": "", "Apr-24": "", "May-24": "", "Jun-24": "",
      "Jul-24": "", "Aug-24": "", "Sep-24": "", "Oct-24": "", "Nov-24": "", "Dec-24": "",
      "Jan-25": "", "Feb-25": "", "Mar-25": "", "Apr-25": "", "May-25": "", "Jun-25": "",
      "Jul-25": "", "Aug-25": "", "Sep-25": "", "Oct-25": "", "Nov-25": "", "Dec-25": ""
    }
  ]);

  // Get all available years from data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    Object.keys(financeData[0] || {}).forEach(key => {
      if (key !== 'id' && key !== 'category' && key !== 'type') {
        const year = key.split('-')[1];
        if (year) years.add(`20${year}`);
      }
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
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year].sort()
    );
  };

  const handleCellChange = useCallback((rowId: string, column: string, value: string) => {
    setFinanceData(prev => prev.map(row => 
      row.id === rowId 
        ? { ...row, [column]: value === '' ? '' : (isNaN(Number(value)) ? value : Number(value)) }
        : row
    ));
  }, []);

  const addRow = () => {
    const newRow: FinanceData = {
      id: Date.now().toString(),
      category: "New Category",
      type: "New Type",
      ...allMonthColumns.reduce((acc, month) => ({ ...acc, [month]: "" }), {})
    };
    setFinanceData(prev => [...prev, newRow]);
  };

  const addColumn = () => {
    const newMonth = prompt("Enter new month (e.g., Jul-25):");
    if (newMonth && !allMonthColumns.includes(newMonth)) {
      setFinanceData(prev => prev.map(row => ({ ...row, [newMonth]: "" })));
      toast({
        title: "Column Added",
        description: `Added column: ${newMonth}`,
      });
    }
  };

  const calculateTotal = (column: string) => {
    const total = financeData.reduce((sum, row) => {
      const value = row[column];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
    return total;
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

  // Calculate YTD Growth
  const calculateYTDGrowth = (column: string) => {
    const year = column.split('-')[1];
    const month = column.split('-')[0];
    
    // Get current year total up to this month
    const currentYearMonths = filteredMonthColumns.filter(col => 
      col.split('-')[1] === year && 
      getMonthIndex(col.split('-')[0]) <= getMonthIndex(month)
    );
    
    const currentYearTotal = currentYearMonths.reduce((sum, col) => sum + calculateTotal(col), 0);
    
    // Get previous year total for same period
    const prevYear = String(parseInt(`20${year}`) - 1).slice(-2);
    const prevYearMonths = allMonthColumns.filter(col => 
      col.split('-')[1] === prevYear && 
      getMonthIndex(col.split('-')[0]) <= getMonthIndex(month)
    );
    
    const prevYearTotal = prevYearMonths.reduce((sum, col) => sum + calculateTotal(col), 0);
    
    if (prevYearTotal === 0) return "";
    return Math.round(((currentYearTotal - prevYearTotal) / prevYearTotal) * 100) + "%";
  };

  // Calculate MTD Growth (Forecast Month vs Previous Month Forecast)
  const calculateMTDGrowth = (column: string) => {
    const forecastRow = financeData.find(row => row.type === "Forecast MTD");
    if (!forecastRow) return "";
    
    const currentValue = typeof forecastRow[column] === 'number' ? forecastRow[column] as number : 0;
    const prevMonth = getPreviousMonth(column);
    
    if (!prevMonth) return "";
    
    const prevValue = typeof forecastRow[prevMonth] === 'number' ? forecastRow[prevMonth] as number : 0;
    if (prevValue === 0) return "";
    
    return Math.round(((currentValue - prevValue) / prevValue) * 100) + "%";
  };

  // Calculate % Change vs Last Year
  const calculateYearOverYearChange = (column: string) => {
    const year = column.split('-')[1];
    const month = column.split('-')[0];
    const prevYear = String(parseInt(`20${year}`) - 1).slice(-2);
    const prevYearColumn = `${month}-${prevYear}`;
    
    const currentValue = calculateTotal(column);
    const prevYearValue = calculateTotal(prevYearColumn);
    
    if (prevYearValue === 0) return "";
    return Math.round(((currentValue - prevYearValue) / prevYearValue) * 100) + "%";
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

  const saveData = () => {
    // Save to localStorage and notify parent
    localStorage.setItem('financeAnalyticsData', JSON.stringify(financeData));
    onDataChange?.(financeData);
    setIsEditing(false);
    toast({
      title: "Data Saved",
      description: "Finance analytics data has been saved successfully.",
    });
  };

  const handleExcelImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
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
          toast({
            title: "Excel Import Successful",
            description: `Imported ${newData.length} rows from Excel file.`,
          });
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
    toast({
      title: "Sample Data Loaded",
      description: "Loaded sample finance data with forecast data for testing.",
    });
  };

  const exportToExcel = () => {
    toast({
      title: "Export Started",
      description: "Exporting finance data to Excel...",
    });
  };

  const importFromExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Import Started",
          description: `Importing data from ${file.name}...`,
        });
      }
    };
    input.click();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Finance Analytics Table</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Editable revenue tracking with automatic calculations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? "View Mode" : "Edit Mode"}
            </Button>
            {isEditing && (
              <Button
                onClick={saveData}
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={importFromExcel}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Year Filter Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <Label className="font-semibold text-gray-700">Filter by Year:</Label>
          </div>
          <div className="flex flex-wrap gap-3">
            {availableYears.map(year => (
              <div key={year} className="flex items-center space-x-2">
                <Checkbox
                  id={`year-${year}`}
                  checked={selectedYears.includes(year)}
                  onCheckedChange={() => handleYearToggle(year)}
                />
                <Label 
                  htmlFor={`year-${year}`}
                  className="text-sm font-medium cursor-pointer hover:text-primary"
                >
                  {year}
                </Label>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Showing {filteredMonthColumns.length} months from {selectedYears.length} selected year(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addColumn}
                        className="w-full"
                      >
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
                    <Badge variant="secondary">Total</Badge>
                  </td>
                  {filteredMonthColumns.map(month => (
                    <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm">
                      {calculateTotal(month) || ''}
                    </td>
                  ))}
                  {isEditing && <td className="border border-gray-300 p-2"></td>}
                </tr>

                {/* Forecast MTD Row */}
                <tr className="bg-indigo-50 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>
                    <Badge variant="outline" className="text-indigo-700 border-indigo-300">Forecast MTD</Badge>
                  </td>
                  {filteredMonthColumns.map(month => {
                    const forecastRow = financeData.find(row => row.type === "Forecast MTD");
                    const forecastValue = forecastRow ? forecastRow[month] : "";
                    console.log('Forecast row found:', forecastRow ? 'yes' : 'no', 'for month:', month);
                    return (
                      <td key={month} className="border border-gray-300 p-2 text-center">
                        {isEditing && forecastRow ? (
                          <Input
                            value={forecastValue?.toString() || ''}
                            onChange={(e) => {
                              console.log('Forecast value changing:', e.target.value, 'for month:', month);
                              handleCellChange(forecastRow.id, month, e.target.value);
                            }}
                            className="border-0 bg-transparent p-1 text-center text-indigo-700 font-mono text-sm"
                            type="text"
                          />
                        ) : (
                          <span className="font-mono text-sm text-indigo-700">
                            {forecastValue || ''}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {isEditing && <td className="border border-gray-300 p-2"></td>}
                </tr>

                {/* Achievement Row */}
                <tr className="bg-green-50 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>
                    <Badge variant="outline" className="text-green-700 border-green-300">Achievement</Badge>
                  </td>
                  {filteredMonthColumns.map(month => (
                    <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm text-green-700">
                      {calculateAchievement(month)}
                    </td>
                  ))}
                  {isEditing && <td className="border border-gray-300 p-2"></td>}
                </tr>

                {/* YTD Growth Row */}
                <tr className="bg-yellow-50 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">YTD Growth</Badge>
                  </td>
                  {filteredMonthColumns.map(month => (
                    <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm text-yellow-700">
                      {calculateYTDGrowth(month)}
                    </td>
                  ))}
                  {isEditing && <td className="border border-gray-300 p-2"></td>}
                </tr>

                {/* MTD Growth Row */}
                <tr className="bg-purple-50 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>
                    <Badge variant="outline" className="text-purple-700 border-purple-300">MTD Growth</Badge>
                  </td>
                  {filteredMonthColumns.map(month => (
                    <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm text-purple-700">
                      {calculateMTDGrowth(month)}
                    </td>
                  ))}
                  {isEditing && <td className="border border-gray-300 p-2"></td>}
                </tr>

                {/* % Change vs Last Year Row */}
                <tr className="bg-orange-50 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>
                    <Badge variant="outline" className="text-orange-700 border-orange-300">% Change vs Last Year</Badge>
                  </td>
                  {filteredMonthColumns.map(month => (
                    <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm text-orange-700">
                      {calculateYearOverYearChange(month)}
                    </td>
                  ))}
                  {isEditing && <td className="border border-gray-300 p-2"></td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-4 flex justify-start">
            <Button
              variant="outline"
              onClick={addRow}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Row
            </Button>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Revenue Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Latest Month Total:</span>
              <span className="ml-2 font-mono font-bold">
                {filteredMonthColumns.length > 0 ? calculateTotal(filteredMonthColumns[filteredMonthColumns.length - 1]) : 0}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Selected Years Total:</span>
              <span className="ml-2 font-mono font-bold">
                {filteredMonthColumns.reduce((sum, month) => sum + calculateTotal(month), 0)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Filtered Columns:</span>
              <span className="ml-2 font-mono font-bold">{filteredMonthColumns.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}