import React, { useState, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Download, Upload, Save, Edit3, Filter, FileSpreadsheet, BarChart3, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import FinanceChartsDialog from "./FinanceChartsDialog";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with empty structure or sample data, load from localStorage if available
  const [financeData, setFinanceData] = useState<FinanceData[]>(() => {
    const savedData = localStorage.getItem('financeAnalyticsData');
    console.log('Loading data from localStorage:', savedData); // Debug log
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('Parsed data:', parsedData); // Debug log
        return parsedData;
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
    console.log('Using default data'); // Debug log
    return [
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
    ];
  });

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
    // Save to localStorage immediately
    localStorage.setItem('financeAnalyticsData', JSON.stringify(updatedData));
    
    // Dispatch event to notify finance dashboard of updates
    window.dispatchEvent(new CustomEvent('financeAnalyticsUpdated'));
    
    console.log('Data saved to localStorage:', localStorage.getItem('financeAnalyticsData')); // Debug log
  }, [financeData]);

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

  // Calculate Achievement with Optha (Actual MTD + AlBatal + Ibn Rushd) / Forecast
  const calculateAchievementWithOptha = (column: string) => {
    const actualRow = financeData.find(row => row.type === "Actual MTD");
    const albatalRow = financeData.find(row => row.category === "AlBatal");
    const ibnRushdRow = financeData.find(row => row.category === "Ibn Rushd");
    const forecastRow = financeData.find(row => row.type === "Forecast MTD");
    
    if (!actualRow || !forecastRow) return "";
    
    const actual = typeof actualRow[column] === 'number' ? actualRow[column] as number : 0;
    const albatal = albatalRow && typeof albatalRow[column] === 'number' ? albatalRow[column] as number : 0;
    const ibnRushd = ibnRushdRow && typeof ibnRushdRow[column] === 'number' ? ibnRushdRow[column] as number : 0;
    const forecast = typeof forecastRow[column] === 'number' ? forecastRow[column] as number : 0;
    
    const totalWithOptha = actual + albatal + ibnRushd;
    
    if (forecast === 0) return "#DIV/0!";
    return Math.round((totalWithOptha / forecast) * 100) + "%";
  };

  // Calculate YTD Growth (Only Actual MTD)
  const calculateYTDGrowth = (column: string) => {
    const year = column.split('-')[1];
    const month = column.split('-')[0];
    
    // Get current year total up to this month (only Actual MTD)
    const currentYearMonths = allMonthColumns.filter(col => 
      col.split('-')[1] === year && 
      getMonthIndex(col.split('-')[0]) <= getMonthIndex(month)
    );
    
    const actualRow = financeData.find(row => row.type === "Actual MTD");
    if (!actualRow) return "";
    
    const currentYearTotal = currentYearMonths.reduce((sum, col) => {
      const value = typeof actualRow[col] === 'number' ? actualRow[col] as number : 0;
      return sum + value;
    }, 0);
    
    // Get previous year total for same period (only Actual MTD)
    const prevYear = String(parseInt(`20${year}`) - 1).slice(-2);
    const prevYearMonths = allMonthColumns.filter(col => 
      col.split('-')[1] === prevYear && 
      getMonthIndex(col.split('-')[0]) <= getMonthIndex(month)
    );
    
    const prevYearTotal = prevYearMonths.reduce((sum, col) => {
      const value = typeof actualRow[col] === 'number' ? actualRow[col] as number : 0;
      return sum + value;
    }, 0);
    
    if (prevYearTotal === 0) return "";
    return Math.round(((currentYearTotal - prevYearTotal) / prevYearTotal) * 100) + "%";
  };

  // Calculate MTD Growth (Only Actual MTD)
  const calculateMTDGrowth = (column: string) => {
    const actualRow = financeData.find(row => row.type === "Actual MTD");
    if (!actualRow) return "";
    
    const currentValue = typeof actualRow[column] === 'number' ? actualRow[column] as number : 0;
    const prevMonth = getPreviousMonth(column);
    
    if (!prevMonth) return "";
    
    const prevValue = typeof actualRow[prevMonth] === 'number' ? actualRow[prevMonth] as number : 0;
    if (prevValue === 0) return "";
    
    return Math.round(((currentValue - prevValue) / prevValue) * 100) + "%";
  };

  // Calculate YTD Growth with Optha (Actual MTD + AlBatal + Ibn Rushd)
  const calculateYTDGrowthWithOptha = (column: string) => {
    const year = column.split('-')[1];
    const month = column.split('-')[0];
    
    // Get current year total up to this month (including Optha)
    const currentYearMonths = allMonthColumns.filter(col => 
      col.split('-')[1] === year && 
      getMonthIndex(col.split('-')[0]) <= getMonthIndex(month)
    );
    
    const actualRow = financeData.find(row => row.type === "Actual MTD");
    const albatalRow = financeData.find(row => row.category === "AlBatal");
    const ibnRushdRow = financeData.find(row => row.category === "Ibn Rushd");
    
    if (!actualRow) return "";
    
    const currentYearTotal = currentYearMonths.reduce((sum, col) => {
      const actual = typeof actualRow[col] === 'number' ? actualRow[col] as number : 0;
      const albatal = albatalRow && typeof albatalRow[col] === 'number' ? albatalRow[col] as number : 0;
      const ibnRushd = ibnRushdRow && typeof ibnRushdRow[col] === 'number' ? ibnRushdRow[col] as number : 0;
      
      return sum + actual + albatal + ibnRushd;
    }, 0);
    
    // Get previous year total for same period (including Optha)
    const prevYear = String(parseInt(`20${year}`) - 1).slice(-2);
    const prevYearMonths = allMonthColumns.filter(col => 
      col.split('-')[1] === prevYear && 
      getMonthIndex(col.split('-')[0]) <= getMonthIndex(month)
    );
    
    const prevYearTotal = prevYearMonths.reduce((sum, col) => {
      const actual = typeof actualRow[col] === 'number' ? actualRow[col] as number : 0;
      const albatal = albatalRow && typeof albatalRow[col] === 'number' ? albatalRow[col] as number : 0;
      const ibnRushd = ibnRushdRow && typeof ibnRushdRow[col] === 'number' ? ibnRushdRow[col] as number : 0;
      
      return sum + actual + albatal + ibnRushd;
    }, 0);
    
    if (prevYearTotal === 0) return "";
    return Math.round(((currentYearTotal - prevYearTotal) / prevYearTotal) * 100) + "%";
  };

  // Calculate MTD Growth with Optha
  const calculateMTDGrowthWithOptha = (column: string) => {
    const actualRow = financeData.find(row => row.type === "Actual MTD");
    const albatalRow = financeData.find(row => row.category === "AlBatal");
    const ibnRushdRow = financeData.find(row => row.category === "Ibn Rushd");
    
    if (!actualRow) return "";
    
    const currentActual = typeof actualRow[column] === 'number' ? actualRow[column] as number : 0;
    const currentAlbatal = albatalRow && typeof albatalRow[column] === 'number' ? albatalRow[column] as number : 0;
    const currentIbnRushd = ibnRushdRow && typeof ibnRushdRow[column] === 'number' ? ibnRushdRow[column] as number : 0;
    const currentTotal = currentActual + currentAlbatal + currentIbnRushd;
    
    const prevMonth = getPreviousMonth(column);
    if (!prevMonth) return "";
    
    const prevActual = typeof actualRow[prevMonth] === 'number' ? actualRow[prevMonth] as number : 0;
    const prevAlbatal = albatalRow && typeof albatalRow[prevMonth] === 'number' ? albatalRow[prevMonth] as number : 0;
    const prevIbnRushd = ibnRushdRow && typeof ibnRushdRow[prevMonth] === 'number' ? ibnRushdRow[prevMonth] as number : 0;
    const prevTotal = prevActual + prevAlbatal + prevIbnRushd;
    
    if (prevTotal === 0) return "";
    return Math.round(((currentTotal - prevTotal) / prevTotal) * 100) + "%";
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
    
    // Dispatch event to notify finance dashboard of updates
    window.dispatchEvent(new CustomEvent('financeAnalyticsUpdated'));
    
    toast({
      title: "Data Saved",
      description: "Finance analytics data has been saved successfully and finance dashboard updated.",
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
              onClick={() => {
                setChartType("achievement");
                setChartDialogOpen(true);
              }}
              className="flex items-center gap-2"
              title="View Achievement Chart"
            >
              <BarChart3 className="h-4 w-4" />
              Achievement Chart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChartType("growth-ytd");
                setChartDialogOpen(true);
              }}
              className="flex items-center gap-2"
              title="View Growth YTD Chart"
            >
              <TrendingUp className="h-4 w-4" />
              Growth YTD Chart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? "View Mode" : "Edit Mode"}
            </Button>
            <Button
              onClick={saveData}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
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

                {/* Achievement with Optha Row */}
                <tr className="bg-teal-50 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>
                    <Badge variant="outline" className="text-teal-700 border-teal-300">Achievement with Optha</Badge>
                  </td>
                  {filteredMonthColumns.map(month => (
                    <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm text-teal-700">
                      {calculateAchievementWithOptha(month)}
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

                {/* YTD Growth with Optha Row */}
                <tr className="bg-indigo-50 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>
                    <Badge variant="outline" className="text-indigo-700 border-indigo-300">YTD Growth with Optha</Badge>
                  </td>
                  {filteredMonthColumns.map(month => (
                    <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm text-indigo-700">
                      {calculateYTDGrowthWithOptha(month)}
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

                {/* MTD Growth with Optha Row */}
                <tr className="bg-pink-50 font-semibold">
                  <td className="border border-gray-300 p-2" colSpan={2}>
                    <Badge variant="outline" className="text-pink-700 border-pink-300">MTD Growth with Optha</Badge>
                  </td>
                  {filteredMonthColumns.map(month => (
                    <td key={month} className="border border-gray-300 p-2 text-center font-mono text-sm text-pink-700">
                      {calculateMTDGrowthWithOptha(month)}
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

      <FinanceChartsDialog
        open={chartDialogOpen}
        onOpenChange={setChartDialogOpen}
        chartType={chartType}
        data={financeData}
        selectedYears={selectedYears}
      />
    </Card>
  );
}