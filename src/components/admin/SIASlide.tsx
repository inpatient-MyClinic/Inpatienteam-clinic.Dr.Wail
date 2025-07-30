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
    additionalNotes: ""
  });
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
  const mcBranchData = filteredData.filter(item => 
    item.referredFrom && (item.referredFrom.includes("MCJ1") || item.referredFrom.includes("MCJ2"))
  );

  // Calculate IP Cases - MTD
  const ipCases = filteredData.filter(item => item.type === "IP" || item.description?.includes("IP"));
  
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
    acc[item.hospital] = (acc[item.hospital] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const top5Hospitals = Object.entries(hospitalCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count: count as number }));

  // Top 5 Specialties
  const specialtyCounts = filteredData.reduce((acc, item) => {
    acc[item.specialty] = (acc[item.specialty] || 0) + 1;
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
                <p className="text-xs text-gray-500">Referred from MC branches</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">IP Cases - MTD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{ipCases.length}</div>
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
                <div className="text-3xl font-bold text-green-600">{editableData.npsScore}</div>
              )}
              <p className="text-xs text-gray-500">Net Promoter Score</p>
            </CardContent>
          </Card>

          {/* Cancelled/Rejected */}
          <Card>
            <CardHeader>
              <CardTitle>Cancelled/Rejected Cases</CardTitle>
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
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Input
                  type="number"
                  value={editableData.revenue}
                  onChange={(e) => setEditableData({...editableData, revenue: parseInt(e.target.value)})}
                />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  ${editableData.revenue.toLocaleString()}
                </div>
              )}
              <p className="text-xs text-gray-500">Monthly revenue from finance</p>
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