import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Calendar, Save, History, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SIASlideProps {
  data: any[];
  onClose: () => void;
}

export default function SIASlide({ data, onClose }: SIASlideProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    npsScore: 85,
    revenue: 250000,
    ytdRevenue: 12000000,
    revenueGrowthPercent: 15.5,
    achievement: 0,
    ytdGrowth: 0,
    mtdGrowth: 0,
    additionalNotes: ""
  });
  const [financeData, setFinanceData] = useState<any[]>([]);

  // Load finance data from localStorage when component mounts
  useEffect(() => {
    const savedFinanceData = localStorage.getItem('financeAnalyticsData');
    if (savedFinanceData) {
      try {
        const data = JSON.parse(savedFinanceData);
        setFinanceData(data);
        // Calculate revenue and metrics from finance data
        if (data.length > 0) {
          const currentMonthKey = `${months.find(m => m.value === selectedMonth)?.label?.substring(0, 3)}-${selectedYear.toString().substring(2)}`;
          
          // Find relevant rows
          const actualRow = data.find((row: any) => row.type === "Actual MTD");
          const albatalRow = data.find((row: any) => row.category === "AlBatal");
          const ibnRushdRow = data.find((row: any) => row.category === "Ibn Rushd");
          const forecastRow = data.find((row: any) => row.type === "Forecast MTD");

          // Calculate current month total (Actual + AlBatal + Ibn Rushd)
          const currentActual = actualRow && typeof actualRow[currentMonthKey] === 'number' ? actualRow[currentMonthKey] : 0;
          const currentAlbatal = albatalRow && typeof albatalRow[currentMonthKey] === 'number' ? albatalRow[currentMonthKey] : 0;
          const currentIbnRushd = ibnRushdRow && typeof ibnRushdRow[currentMonthKey] === 'number' ? ibnRushdRow[currentMonthKey] : 0;
          const monthTotal = currentActual + currentAlbatal + currentIbnRushd;

          // Calculate Achievement (Actual vs Forecast)
          let achievement = 0;
          if (actualRow && forecastRow) {
            const actual = typeof actualRow[currentMonthKey] === 'number' ? actualRow[currentMonthKey] : 0;
            const forecast = typeof forecastRow[currentMonthKey] === 'number' ? forecastRow[currentMonthKey] : 0;
            achievement = forecast > 0 ? Math.round((actual / forecast) * 100) : 0;
          }

          // Calculate YTD Growth (only Actual MTD)
          const currentYear = selectedYear.toString().substring(2);
          const prevYear = (selectedYear - 1).toString().substring(2);
          
          // Get all months up to selected month for current year
          const currentYearMonths = Object.keys(data[0] || {}).filter(key => 
            key !== 'id' && key !== 'category' && key !== 'type' && 
            key.split('-')[1] === currentYear &&
            getMonthIndex(key.split('-')[0]) <= selectedMonth - 1
          );
          
          // Get all months up to selected month for previous year
          const prevYearMonths = Object.keys(data[0] || {}).filter(key => 
            key !== 'id' && key !== 'category' && key !== 'type' && 
            key.split('-')[1] === prevYear &&
            getMonthIndex(key.split('-')[0]) <= selectedMonth - 1
          );
          
          // Calculate YTD Growth with Optha (Actual + AlBatal + Ibn Rushd)
          const currentYearTotalWithOptha = currentYearMonths.reduce((sum, month) => {
            const actual = actualRow && typeof actualRow[month] === 'number' ? actualRow[month] : 0;
            const albatal = albatalRow && typeof albatalRow[month] === 'number' ? albatalRow[month] : 0;
            const ibnRushd = ibnRushdRow && typeof ibnRushdRow[month] === 'number' ? ibnRushdRow[month] : 0;
            return sum + actual + albatal + ibnRushd;
          }, 0);
          
          const prevYearTotalWithOptha = prevYearMonths.reduce((sum, month) => {
            const actual = actualRow && typeof actualRow[month] === 'number' ? actualRow[month] : 0;
            const albatal = albatalRow && typeof albatalRow[month] === 'number' ? albatalRow[month] : 0;
            const ibnRushd = ibnRushdRow && typeof ibnRushdRow[month] === 'number' ? ibnRushdRow[month] : 0;
            return sum + actual + albatal + ibnRushd;
          }, 0);
          
          const ytdGrowthWithOptha = prevYearTotalWithOptha > 0 ? Math.round(((currentYearTotalWithOptha - prevYearTotalWithOptha) / prevYearTotalWithOptha) * 100) : 0;

          // Calculate MTD Growth (current month Actual vs previous month Actual)
          const monthIndex = selectedMonth - 1;
          const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
          const prevMonthYear = monthIndex === 0 ? (selectedYear - 1).toString().substring(2) : currentYear;
          const prevMonthKey = `${months[prevMonthIndex].label.substring(0, 3)}-${prevMonthYear}`;
          
          const prevMonthActual = actualRow && typeof actualRow[prevMonthKey] === 'number' ? actualRow[prevMonthKey] : 0;
          const mtdGrowth = prevMonthActual > 0 ? Math.round(((currentActual - prevMonthActual) / prevMonthActual) * 100) : 0;

          // Calculate YTD Revenue with Optha (Actual + AlBatal + Ibn Rushd for all months YTD)
          const ytdRevenueWithOptha = currentYearMonths.reduce((sum, month) => {
            const actual = actualRow && typeof actualRow[month] === 'number' ? actualRow[month] : 0;
            const albatal = albatalRow && typeof albatalRow[month] === 'number' ? albatalRow[month] : 0;
            const ibnRushd = ibnRushdRow && typeof ibnRushdRow[month] === 'number' ? ibnRushdRow[month] : 0;
            return sum + actual + albatal + ibnRushd;
          }, 0);

          setEditableData(prev => ({
            ...prev,
            revenue: monthTotal * 1000, // Convert to display currency
            ytdRevenue: ytdRevenueWithOptha * 1000, // YTD Revenue with Optha
            revenueGrowthPercent: ytdGrowthWithOptha, // Use YTD Growth with Optha as main growth metric
            achievement,
            ytdGrowth: ytdGrowthWithOptha,
            mtdGrowth
          }));
        }
      } catch (error) {
        console.error('Error loading finance data:', error);
      }
    }
  }, [selectedMonth, selectedYear]);

  // Helper function to get month index
  const getMonthIndex = (month: string) => {
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return monthMap[month] || 0;
  };

  // Editable table data
  const [tableData, setTableData] = useState([
    { currentStatus: "Complete", actionPlan: "Resume OB/GYN case referrals to DSAH as they have now started offering a split-share model", priority: "High", timeline: "Jun - 2025" },
    { currentStatus: "In Progress (90%)", actionPlan: "Implement operations with PHS with 3 contracted hospitals. Complete with 3 out of 3 hospitals (CMO support)", priority: "Medium", timeline: "Sep-2025" },
    { currentStatus: "Complete", actionPlan: "Expand the hospital network with IMC and KCH.", priority: "Medium", timeline: "May-2025" },
    { currentStatus: "In Progress 90%", actionPlan: "All payments from Q1 2024 & Q1 2025 have been received from Al Salamah. However, no payments have been recovered from April 2025 to date.", priority: "High", timeline: "Jun-2025" },
    { currentStatus: "In Progress", actionPlan: "Conducted a financial performance review by specialty to guide redirection to the highest revenue-generating partner hospitals. (Revenue concentration)", priority: "High", timeline: "Ongoing" },
    { currentStatus: "In Progress 90%", actionPlan: "Contracts with IMC and KCH have been signed. Operations have been finalized and tested. Privilege approval will currently be processed.", priority: "High", timeline: "Apr-May 2025" },
    { currentStatus: "In Progress 90%", actionPlan: "A proposal has been received from DSAH and is currently under discussion.", priority: "High", timeline: "Jun 2025" },
    { currentStatus: "In Progress 90%", actionPlan: "The CRM initiative shifted to building a customized platform to manage patient journey and coordination.", priority: "High", timeline: "Development Phase – Jun 2025" },
    { currentStatus: "In Progress", actionPlan: "To add the Ophthalmology revenue from the Finance & to add it with the In-Patient revenue( Finance)", priority: "High", timeline: "July - 2025" },
    { currentStatus: "In Progress", actionPlan: "Introduction presentation in general for In-patient and another one per specialty", priority: "High", timeline: "Aug- 2025" }
  ]);
  const { toast } = useToast();

  // Generate month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  // Filter data by selected month
  const filteredData = data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() + 1 === selectedMonth && itemDate.getFullYear() === selectedYear;
  });

  // Calculate MC branch data
  const mcj1Data = filteredData.filter(item => 
    item.referredFrom && item.referredFrom.includes("MCJ1")
  );
  const mcj2Data = filteredData.filter(item => 
    item.referredFrom && item.referredFrom.includes("MCJ2")
  );
  const mcBranchData = [...mcj1Data, ...mcj2Data];

  // Calculate IP Cases - MTD
  const ipCases = filteredData.filter(item => item.type === "IP" || (item.description && item.description.includes("IP")));
  
  // Calculate Done Cases (Done + Scheduled + Planned NVD)
  const doneCases = filteredData.filter(item => 
    item.status === "Completed" || item.status === "Scheduled" || item.status === "Planned NVD"
  );

  // Calculate previous month data (Month -25 concept)
  const previousMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const previousYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const previousMonthData = data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() + 1 === previousMonth && itemDate.getFullYear() === previousYear;
  });

  // Top 5 Hospitals
  const hospitalCounts = filteredData.reduce((acc, item) => {
    if (item.hospital) {
      acc[item.hospital] = (acc[item.hospital] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const top5Hospitals = Object.entries(hospitalCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count: count as number }));

  // Top 5 Specialties
  const specialtyCounts = filteredData.reduce((acc, item) => {
    if (item.specialty) {
      acc[item.specialty] = (acc[item.specialty] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const top5Specialties = Object.entries(specialtyCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count: count as number }));

  // Conversion Rate
  const totalReferred = filteredData.length;
  const conversionRate = totalReferred > 0 ? ((doneCases.length / totalReferred) * 100).toFixed(1) : "0";

  // Conversion rate chart data
  const conversionChartData = [
    { name: 'Converted', value: doneCases.length, color: '#10B981' },
    { name: 'Not Converted', value: totalReferred - doneCases.length, color: '#EF4444' }
  ];

  // Cancelled/Rejected data
  const cancelledData = filteredData.filter(item => item.status === "Cancelled");
  const rejectedData = filteredData.filter(item => item.status === "Rejected");
  const pendingData = filteredData.filter(item => item.status === "Pending");

  // Failure categories (simulated)
  const failureCategories = [
    { category: "Documentation Issues", count: Math.floor(cancelledData.length * 0.4) },
    { category: "Medical Criteria", count: Math.floor(cancelledData.length * 0.3) },
    { category: "Insurance Issues", count: Math.floor(cancelledData.length * 0.2) },
    { category: "Other", count: Math.floor(cancelledData.length * 0.1) }
  ];

  const handleSave = () => {
    const savedData = {
      month: selectedMonth,
      year: selectedYear,
      data: editableData,
      timestamp: new Date().toISOString(),
      stats: {
        mcBranch: mcBranchData.length,
        ipCases: ipCases.length,
        doneCases: doneCases.length,
        conversionRate,
        top5Hospitals,
        top5Specialties
      }
    };

    // Save to localStorage (in real app, this would be saved to backend)
    const existingHistory = JSON.parse(localStorage.getItem('siaSlideHistory') || '[]');
    existingHistory.push(savedData);
    localStorage.setItem('siaSlideHistory', JSON.stringify(existingHistory));

    toast({
      title: "SIA Slide Saved",
      description: `Data for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} has been saved.`
    });

    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">SIA Performance Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
            {isEditing ? "Cancel Edit" : "Edit"}
          </Button>
          
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Version
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Main Metrics */}
        <div className="col-span-8 space-y-6">
          {/* Top Row - Key Numbers */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">MC Branch Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{mcBranchData.length}</div>
                <div className="flex justify-between text-xs mt-2">
                  <span>MCJ1: {mcj1Data.length}</span>
                  <span>MCJ2: {mcj2Data.length}</span>
                </div>
                <p className="text-xs text-gray-500">Referred from MC branches</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">IP Cases - MTD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{ipCases.length}</div>
                <div className="text-sm mt-2">
                  <div>Done: {doneCases.length} / Total: {totalReferred}</div>
                </div>
                <p className="text-xs text-gray-500">In-patient cases this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Done Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{doneCases.length}</div>
                <p className="text-xs text-gray-500">Completed + Scheduled + Planned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Previous Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{previousMonthData.length}</div>
                <p className="text-xs text-gray-500">{months.find(m => m.value === previousMonth)?.label} total cases</p>
              </CardContent>
            </Card>
          </div>

          {/* Middle Row - Top 5 Lists */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Hospitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {top5Hospitals.map((hospital, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{hospital.name}</span>
                      <Badge variant="secondary">{hospital.count.toString()}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {top5Specialties.map((specialty, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{specialty.name}</span>
                      <Badge variant="secondary">{specialty.count.toString()}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Row - Editable Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Action Plan Status</CardTitle>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setTableData([...tableData, { currentStatus: "", actionPlan: "", priority: "", timeline: "" }])}
                >
                  Add Row
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setTableData(tableData.slice(0, -1))}
                  disabled={tableData.length <= 1}
                >
                  Remove Row
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-teal-600 text-white text-sm">Current Status</th>
                      <th className="border border-gray-300 p-2 bg-teal-600 text-white text-sm">Action Plan</th>
                      <th className="border border-gray-300 p-2 bg-teal-600 text-white text-sm">Priority</th>
                      <th className="border border-gray-300 p-2 bg-teal-600 text-white text-sm">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.currentStatus}
                              onChange={(e) => {
                                const newData = [...tableData];
                                newData[index].currentStatus = e.target.value;
                                setTableData(newData);
                              }}
                              className="w-full p-1 text-xs bg-transparent"
                            />
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded ${
                              row.currentStatus.includes('Complete') ? 'bg-green-100' :
                              row.currentStatus.includes('In Progress') ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                              {row.currentStatus}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-1">
                          {isEditing ? (
                            <textarea
                              value={row.actionPlan}
                              onChange={(e) => {
                                const newData = [...tableData];
                                newData[index].actionPlan = e.target.value;
                                setTableData(newData);
                              }}
                              className="w-full p-1 text-xs bg-transparent resize-none"
                              rows={2}
                            />
                          ) : (
                            <span className="text-xs">{row.actionPlan}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-1 text-center">
                          {isEditing ? (
                            <select
                              value={row.priority}
                              onChange={(e) => {
                                const newData = [...tableData];
                                newData[index].priority = e.target.value;
                                setTableData(newData);
                              }}
                              className="w-full p-1 text-xs bg-transparent"
                            >
                              <option value="">Select</option>
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded text-white ${
                              row.priority === 'High' ? 'bg-red-500' :
                              row.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                              {row.priority}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.timeline}
                              onChange={(e) => {
                                const newData = [...tableData];
                                newData[index].timeline = e.target.value;
                                setTableData(newData);
                              }}
                              className="w-full p-1 text-xs bg-transparent"
                            />
                          ) : (
                            <span className="text-xs">{row.timeline}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Row - Conversion Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate: {conversionRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conversionChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {conversionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Metrics */}
        <div className="col-span-4 space-y-6">
          {/* NPS Score */}
          <Card>
            <CardHeader>
              <CardTitle>In-Patient NPS</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Input
                  type="number"
                  value={editableData.npsScore}
                  onChange={(e) => setEditableData({...editableData, npsScore: parseInt(e.target.value)})}
                />
              ) : (
                <div>
                  <div className="text-3xl font-bold text-green-600">{editableData.npsScore}</div>
                  <div className="mt-2 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                    Chart can be added here
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">Net Promoter Score</p>
            </CardContent>
          </Card>

          {/* Loss Tree */}
          <Card>
            <CardHeader>
              <CardTitle>Loss Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Cancelled:</span>
                  <Badge variant="destructive">{cancelledData.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Rejected:</span>
                  <Badge variant="destructive">{rejectedData.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <Badge variant="outline">{pendingData.length}</Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Failure Categories:</p>
                  {failureCategories.map((category, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{category.category}:</span>
                      <span>{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingData.length}</div>
              <p className="text-xs text-gray-500">Awaiting processing</p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Revenue & Performance
                <Badge variant="secondary" className="text-xs">
                  {financeData.length > 0 ? 'Live Data' : 'Manual'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="YTD Achievement"
                    value={editableData.ytdRevenue}
                    onChange={(e) => setEditableData({...editableData, ytdRevenue: parseInt(e.target.value)})}
                  />
                  <Input
                    type="number"
                    placeholder="Growth %"
                    value={editableData.revenueGrowthPercent}
                    onChange={(e) => setEditableData({...editableData, revenueGrowthPercent: parseFloat(e.target.value)})}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-lg font-bold text-green-600">
                    YTD: ${editableData.ytdRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Growth: {editableData.revenueGrowthPercent}% vs. last year
                  </div>
                  
                  {/* Finance Analytics Metrics */}
                  {financeData.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {editableData.achievement}%
                        </div>
                        <div className="text-xs text-gray-600">Achievement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {editableData.ytdGrowth > 0 ? '+' : ''}{editableData.ytdGrowth}%
                        </div>
                        <div className="text-xs text-gray-600">YTD Growth</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {editableData.mtdGrowth > 0 ? '+' : ''}{editableData.mtdGrowth}%
                        </div>
                        <div className="text-xs text-gray-600">MTD Growth</div>
                      </div>
                    </div>
                  )}
                  
                  {financeData.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                      <strong>📊 Live Finance Data:</strong> Metrics auto-calculated from Finance Analytics Table for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {financeData.length > 0 ? 
                  'Achievement (Actual vs Forecast) • YTD Growth (vs Previous Year) • MTD Growth (vs Previous Month)' : 
                  'YTD Achievement - Revenue Growth'
                }
              </p>
            </CardContent>
          </Card>

          {/* Editable Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  className="w-full h-20 p-2 border rounded"
                  value={editableData.additionalNotes}
                  onChange={(e) => setEditableData({...editableData, additionalNotes: e.target.value})}
                  placeholder="Add notes about this month's performance..."
                />
              ) : (
                <p className="text-sm text-gray-600">
                  {editableData.additionalNotes || "No additional notes"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}