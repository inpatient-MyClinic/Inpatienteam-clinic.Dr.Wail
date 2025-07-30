import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from "recharts";

interface AdminIPOperationsPerformanceProps {
  data: any[];
  selectedMonths: string[];
}

export default function AdminIPOperationsPerformance({ data, selectedMonths }: AdminIPOperationsPerformanceProps) {
  // Get current month or selected month
  const currentMonth = selectedMonths.length > 0 ? selectedMonths[0] : new Date().toLocaleString('default', { month: 'long' }).toLowerCase();
  const currentYear = new Date().getFullYear();
  const monthYear = `${currentMonth}-${currentYear.toString().slice(-2)}`;
  
  // Filter data by selected month
  const monthlyData = data.filter(item => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    const itemMonth = itemDate.toLocaleString('default', { month: 'long' }).toLowerCase();
    return selectedMonths.length === 0 || selectedMonths.includes(itemMonth);
  });

  // MC Branches data (simulated for MCJ1 and MCJ2)
  const mcj1Cases = Math.floor(monthlyData.length * 0.85); // 85% to MCJ1
  const mcj2Cases = monthlyData.length - mcj1Cases; // remaining to MCJ2

  // IP Cases - MTD
  const doneCases = monthlyData.filter(item => 
    item.status === "Done" || 
    item.status === "Completed" || 
    item.status === "Scheduled" || 
    item.status === "Planned NVD"
  ).length;
  const currentMonthTotal = monthlyData.length;

  // Get top 5 hospitals with cases referred to them
  const hospitalCounts = monthlyData.reduce((acc, item) => {
    const hospital = item.hospital || item.referredToHospital || "Unknown Hospital";
    acc[hospital] = (acc[hospital] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top5Hospitals = Object.entries(hospitalCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([name, cases]) => ({ name, cases: cases as number }));

  // Get top 5 specialties
  const specialtyCounts = monthlyData.reduce((acc, item) => {
    const specialty = item.specialty || "General";
    acc[specialty] = (acc[specialty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top5Specialties = Object.entries(specialtyCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5)
    .map(([name, cases]) => ({ name, cases: cases as number }));

  // Conversion rate data for chart (simulated monthly data)
  const conversionRateData = [
    { month: 'JAN', rate: 75 },
    { month: 'FEB', rate: 82 },
    { month: 'MAR', rate: 68 },
    { month: 'APR', rate: 45 },
    { month: 'MAY', rate: 78 },
    { month: 'JUN', rate: 85 },
  ];

  // NPS data for bar chart (simulated)
  const npsData = [
    { month: 'JAN', score: 71 },
    { month: 'FEB', score: 73 },
    { month: 'MAR', score: 69 },
    { month: 'APR', score: 72 },
    { month: 'MAY', score: 74 },
    { month: 'JUN', score: 76 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Left Column - MC Branches and IP Cases */}
      <div className="space-y-6">
        {/* MC Branches */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <span className="text-blue-600 text-sm">📊</span>
              </div>
              MC Branches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">MCJ1</div>
                <div className="text-2xl font-bold text-blue-600">{mcj1Cases}</div>
              </div>
              <div className="text-center border-l pl-4">
                <div className="text-xs text-gray-500 mb-1">MCJ2</div>
                <div className="text-2xl font-bold text-blue-600">{mcj2Cases}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IP Cases - MTD */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                <span className="text-green-600 text-sm">📈</span>
              </div>
              IP Cases - MTD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Done Cases</div>
                <div className="text-2xl font-bold text-green-600">{doneCases}</div>
              </div>
              <div className="text-center border-l pl-4">
                <div className="text-xs text-gray-500 mb-1">{monthYear} Cases</div>
                <div className="text-2xl font-bold text-green-600">{currentMonthTotal}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hospitals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">HOSPITALS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {top5Hospitals.map((hospital, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{hospital.name}</span>
                  <Badge variant="outline">{hospital.cases}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Specialties */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Specialities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {top5Specialties.map((specialty, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{specialty.name}</span>
                  <Badge variant="outline">{specialty.cases}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Column - Conversion Rate Chart */}
      <div>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - In-Patient NPS Chart */}
      <div>
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">In-Patient NPS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={npsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}