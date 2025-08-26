import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Building2, Stethoscope, PieChart, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useRPCAnalytics } from "@/hooks/useRPCAnalytics";
import DataSanityWidget from "./DataSanityWidget";
import PivotTableUpload from "./PivotTableUpload";

export default function RPCAnalyticsDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const { data, loading, error, refetch, filters } = useRPCAnalytics(selectedMonth);

  const handleDataImported = () => {
    refetch();
    setShowUpload(false);
  };

  if (showUpload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Data Upload</h2>
          <Button variant="outline" onClick={() => setShowUpload(false)}>
            ← Back to Analytics
          </Button>
        </div>
        <PivotTableUpload onDataImported={handleDataImported} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Pivot Table Upload
            </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {selectedMonth ? format(selectedMonth, 'MMMM yyyy') : 'All time'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedMonth}
                onSelect={setSelectedMonth}
                defaultMonth={selectedMonth || new Date()}
              />
              {selectedMonth && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMonth(null)}
                    className="w-full"
                  >
                    Clear filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Data Sanity Widget */}
      <DataSanityWidget
        startDate={filters.startDate}
        endDate={filters.endDate}
        totalRows={data?.conversion_rate.denominator || 0}
      />

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading analytics: {error}</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MCJ1 Cases</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {data.conversion_rate.mcj1_count.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MCJ2 Cases</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {data.conversion_rate.mcj2_count.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {(data.conversion_rate.mcj1_count + data.conversion_rate.mcj2_count).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <PieChart className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {data.conversion_rate.rate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500">
                  {data.conversion_rate.numerator} / {data.conversion_rate.denominator}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top 5 Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Top 5 Hospitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.top_hospitals.slice(0, 5).map((hospital, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {hospital.hospital_name}
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{hospital.total_cases}</div>
                        <div className="text-xs text-gray-500">{hospital.conversion_rate.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  Top 5 Specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.top_specialties.slice(0, 5).map((specialty, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {specialty.specialty}
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{specialty.total_cases}</div>
                        <div className="text-xs text-gray-500">{specialty.conversion_rate.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loss Tree */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Loss Tree Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.loss_tree.map((item, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="font-bold text-lg">{item.count}</div>
                    <div className="text-sm text-gray-600">{item.status}</div>
                    <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}