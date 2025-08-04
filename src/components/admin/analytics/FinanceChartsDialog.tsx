import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface FinanceData {
  id: string;
  category: string;
  type: string;
  [key: string]: string | number;
}

interface FinanceChartsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chartType: "achievement" | "growth-ytd";
  data: FinanceData[];
  selectedYears: string[];
}

export default function FinanceChartsDialog({ 
  open, 
  onOpenChange, 
  chartType, 
  data, 
  selectedYears 
}: FinanceChartsDialogProps) {
  const { toast } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);

  // Get filtered month columns based on selected years
  const getFilteredMonthColumns = () => {
    return Object.keys(data[0] || {}).filter(key => {
      if (key === 'id' || key === 'category' || key === 'type') return false;
      const year = key.split('-')[1];
      return year && selectedYears.includes(`20${year}`);
    });
  };

  // Calculate achievement data
  const getAchievementData = () => {
    const columns = getFilteredMonthColumns();
    const actualRow = data.find(row => row.type === "Actual MTD");
    const albatalRow = data.find(row => row.category === "AlBatal");
    const ibnRushdRow = data.find(row => row.category === "Ibn Rushd");
    const forecastRow = data.find(row => row.type === "Forecast MTD");

    return columns.map(column => {
      const actual = actualRow && typeof actualRow[column] === 'number' ? actualRow[column] as number : 0;
      const albatal = albatalRow && typeof albatalRow[column] === 'number' ? albatalRow[column] as number : 0;
      const ibnRushd = ibnRushdRow && typeof ibnRushdRow[column] === 'number' ? ibnRushdRow[column] as number : 0;
      const forecast = forecastRow && typeof forecastRow[column] === 'number' ? forecastRow[column] as number : 0;
      
      const totalWithOptha = actual + albatal + ibnRushd;
      const achievementPercent = forecast > 0 ? Math.round((totalWithOptha / forecast) * 100) : 0;
      const basicAchievement = forecast > 0 ? Math.round((actual / forecast) * 100) : 0;

      return {
        month: column,
        "Achievement": basicAchievement,
        "Achievement with Optha": achievementPercent,
        "Target": 100
      };
    });
  };

  // Calculate growth YTD data
  const getGrowthYTDData = () => {
    const columns = getFilteredMonthColumns();
    
    return columns.map(column => {
      const year = column.split('-')[1];
      const month = column.split('-')[0];
      
      // Get current year total up to this month
      const currentYearMonths = columns.filter(col => 
        col.split('-')[1] === year && 
        getMonthIndex(col.split('-')[0]) <= getMonthIndex(month)
      );
      
      const currentYearTotal = currentYearMonths.reduce((sum, col) => sum + calculateTotal(col), 0);
      
      // Get previous year total for same period
      const prevYear = String(parseInt(`20${year}`) - 1).slice(-2);
      const allColumns = Object.keys(data[0] || {}).filter(key => 
        key !== 'id' && key !== 'category' && key !== 'type'
      );
      const prevYearMonths = allColumns.filter(col => 
        col.split('-')[1] === prevYear && 
        getMonthIndex(col.split('-')[0]) <= getMonthIndex(month)
      );
      
      const prevYearTotal = prevYearMonths.reduce((sum, col) => sum + calculateTotal(col), 0);
      
      const growthPercent = prevYearTotal > 0 ? Math.round(((currentYearTotal - prevYearTotal) / prevYearTotal) * 100) : 0;

      // Calculate growth with Optha
      const currentYearTotalWithOptha = currentYearMonths.reduce((sum, col) => {
        const actualRow = data.find(row => row.type === "Actual MTD");
        const albatalRow = data.find(row => row.category === "AlBatal");
        const ibnRushdRow = data.find(row => row.category === "Ibn Rushd");
        
        const actual = actualRow && typeof actualRow[col] === 'number' ? actualRow[col] as number : 0;
        const albatal = albatalRow && typeof albatalRow[col] === 'number' ? albatalRow[col] as number : 0;
        const ibnRushd = ibnRushdRow && typeof ibnRushdRow[col] === 'number' ? ibnRushdRow[col] as number : 0;
        
        return sum + actual + albatal + ibnRushd;
      }, 0);

      const prevYearTotalWithOptha = prevYearMonths.reduce((sum, col) => {
        const actualRow = data.find(row => row.type === "Actual MTD");
        const albatalRow = data.find(row => row.category === "AlBatal");
        const ibnRushdRow = data.find(row => row.category === "Ibn Rushd");
        
        const actual = actualRow && typeof actualRow[col] === 'number' ? actualRow[col] as number : 0;
        const albatal = albatalRow && typeof albatalRow[col] === 'number' ? albatalRow[col] as number : 0;
        const ibnRushd = ibnRushdRow && typeof ibnRushdRow[col] === 'number' ? ibnRushdRow[col] as number : 0;
        
        return sum + actual + albatal + ibnRushd;
      }, 0);

      const growthWithOpthaPercent = prevYearTotalWithOptha > 0 ? 
        Math.round(((currentYearTotalWithOptha - prevYearTotalWithOptha) / prevYearTotalWithOptha) * 100) : 0;

      return {
        month: column,
        "Growth YTD": growthPercent,
        "Growth YTD with Optha": growthWithOpthaPercent
      };
    });
  };

  const calculateTotal = (column: string) => {
    return data
      .filter(row => row.type === "Actual MTD" || row.category === "AlBatal" || row.category === "Ibn Rushd")
      .reduce((sum, row) => {
        const value = row[column];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
  };

  const getMonthIndex = (month: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(month);
  };

  const downloadChart = async () => {
    if (!chartRef.current) return;

    try {
      // Create a canvas from the chart
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 400;
      
      // Set white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert chart to image (simplified approach)
      const chartTitle = chartType === "achievement" ? "Achievement Chart" : "Growth YTD Chart";
      ctx.fillStyle = 'black';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(chartTitle, canvas.width / 2, 30);

      // Create download link
      const link = document.createElement('a');
      link.download = `${chartTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "Chart Downloaded",
        description: `${chartTitle} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download chart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const chartData = chartType === "achievement" ? getAchievementData() : getGrowthYTDData();
  const title = chartType === "achievement" ? "Achievement Chart" : "Growth YTD Chart";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button onClick={downloadChart} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Chart
            </Button>
          </div>
        </DialogHeader>
        
        <div ref={chartRef} className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "achievement" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Legend />
                <Bar dataKey="Achievement" fill="hsl(var(--primary))" />
                <Bar dataKey="Achievement with Optha" fill="hsl(var(--accent))" />
                <Line 
                  type="monotone" 
                  dataKey="Target" 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="5 5"
                />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Growth YTD" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="Growth YTD with Optha" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}