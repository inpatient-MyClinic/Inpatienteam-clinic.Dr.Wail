
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface AdminAnalyticsProps {
  data: any[];
  selectedDates: Date[];
  selectedWeeks: string[];
  selectedMonths: string[];
}

export default function AdminAnalytics({ data, selectedDates, selectedWeeks, selectedMonths }: AdminAnalyticsProps) {
  console.log("AdminAnalytics rendering with data:", data.length, "items");
  
  const [filterBy, setFilterBy] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedHospital, setSelectedHospital] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>("all");

  // Calculate conversion rate (completed requests / total requests)
  const totalRequests = data.length;
  const completedRequests = data.filter(item => item.status === "Completed").length;
  const conversionRate = totalRequests > 0 ? (completedRequests / totalRequests * 100).toFixed(1) : "0";

  // Calculate utilization rate (filtered requests / total requests)
  const filteredData = data.filter(item => {
    const matchesSpecialty = selectedSpecialty === "all" || item.specialty === selectedSpecialty;
    const matchesHospital = selectedHospital === "all" || item.hospital === selectedHospital;
    const matchesDoctor = selectedDoctor === "all" || item.user === selectedDoctor;
    const matchesCoordinator = selectedCoordinator === "all" || item.caseCoordinator === selectedCoordinator;
    
    return matchesSpecialty && matchesHospital && matchesDoctor && matchesCoordinator;
  });
  
  const utilizationRate = totalRequests > 0 ? (filteredData.length / totalRequests * 100).toFixed(1) : "0";

  // Get unique values for filters
  const specialties = [...new Set(data.map(item => item.specialty))];
  const hospitals = [...new Set(data.map(item => item.hospital))];
  const doctors = [...new Set(data.map(item => item.user))];
  const coordinators = [...new Set(data.map(item => item.caseCoordinator))];

  // Calculate Top 5 metrics
  const getTop5 = (field: string) => {
    const counts = data.reduce((acc, item) => {
      const value = item[field];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 5)
      .map(([name, count]) => ({ name, count: count as number }));
  };

  const top5Specialties = getTop5('specialty');
  const top5Hospitals = getTop5('hospital');
  const top5Doctors = getTop5('user');

  // Loss Tree Analysis Data
  const pendingCount = data.filter(item => item.status === "Pending").length;
  const inProgressCount = data.filter(item => item.status === "In Progress").length;
  
  const lossTreeData = [
    { stage: "Received", count: totalRequests, percentage: 100 },
    { stage: "In Progress", count: inProgressCount, percentage: totalRequests > 0 ? Number((inProgressCount / totalRequests * 100).toFixed(1)) : 0 },
    { stage: "Completed", count: completedRequests, percentage: totalRequests > 0 ? Number((completedRequests / totalRequests * 100).toFixed(1)) : 0 },
    { stage: "Pending", count: pendingCount, percentage: totalRequests > 0 ? Number((pendingCount / totalRequests * 100).toFixed(1)) : 0 }
  ];

  // NPS Score calculation (simulated)
  const npsScore = 72; // This would come from actual survey data

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (!data || data.length === 0) {
    return (
      <div className="space-y-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>No admin data found for analytics</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Filters</CardTitle>
          <CardDescription>Filter analytics by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedHospital} onValueChange={setSelectedHospital}>
              <SelectTrigger>
                <SelectValue placeholder="Hospital" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hospitals</SelectItem>
                {hospitals.map(hospital => (
                  <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map(doctor => (
                  <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCoordinator} onValueChange={setSelectedCoordinator}>
              <SelectTrigger>
                <SelectValue placeholder="Coordinator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coordinators</SelectItem>
                {coordinators.map(coordinator => (
                  <SelectItem key={coordinator} value={coordinator}>{coordinator}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedRequests} of {totalRequests} requests completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{utilizationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {filteredData.length} of {totalRequests} requests match filters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{npsScore}</div>
            <p className="text-xs text-muted-foreground">
              Net Promoter Score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              All time requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={top5Specialties}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Hospitals</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={top5Hospitals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={top5Doctors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Loss Tree Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Loss Tree Analysis</CardTitle>
          <CardDescription>Request flow through different stages</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lossTreeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
              <Line type="monotone" dataKey="percentage" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap gap-2">
            {lossTreeData.map((item, index) => (
              <Badge key={index} variant="outline">
                {item.stage}: {item.count} ({item.percentage.toFixed(1)}%)
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Completed", value: completedRequests },
                  { name: "In Progress", value: inProgressCount },
                  { name: "Pending", value: pendingCount }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[1,2,3].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
