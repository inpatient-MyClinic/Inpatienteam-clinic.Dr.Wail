import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileSpreadsheet, Plus, Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import UnifiedRequestsTable from './UnifiedRequestsTable';
import UnifiedExcelImport from './UnifiedExcelImport';
import UnifiedFilters from './UnifiedFilters';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--accent))'];

export default function UnifiedDashboard() {
  const {
    currentUser,
    requests,
    analytics,
    isLoading,
    error,
    canCreateRequests,
    canViewAnalytics,
    canImportData,
    refreshData
  } = useUnifiedData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const statusData = analytics ? [
    { name: 'Completed', value: analytics.completedRequests, color: COLORS[0] },
    { name: 'Pending', value: analytics.pendingRequests, color: COLORS[1] },
    { name: 'Rejected', value: analytics.rejectedRequests, color: COLORS[2] }
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Medical Request Management</h1>
              <p className="text-muted-foreground">
                Welcome back, {currentUser.full_name || currentUser.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{currentUser.role}</Badge>
              {currentUser.hospital_code && (
                <Badge variant="secondary">{currentUser.hospital_code}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            {canViewAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
            {canImportData && <TabsTrigger value="import">Import Data</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            {analytics && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalRequests}</div>
                    <p className="text-xs text-muted-foreground">
                      {requests.length} visible to you
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.completedRequests}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.conversionRate.toFixed(1)}% success rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat('en-SA', {
                        style: 'currency',
                        currency: 'SAR'
                      }).format(analytics.totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total revenue generated
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.pendingRequests}</div>
                    <p className="text-xs text-muted-foreground">
                      Awaiting action
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Status Distribution Chart */}
            {analytics && statusData.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Request Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Hospitals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.hospitalStats.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hospital_code" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total_cases" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>
                  Latest medical requests in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnifiedRequestsTable 
                  requests={requests.slice(0, 10)} 
                  showPagination={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Medical Requests</h2>
                <p className="text-muted-foreground">
                  Manage and track medical requests
                </p>
              </div>
              {canCreateRequests && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              )}
            </div>

            <UnifiedFilters />
            <UnifiedRequestsTable requests={requests} />
          </TabsContent>

          {canViewAnalytics && (
            <TabsContent value="analytics" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Analytics & Reports</h2>
                <p className="text-muted-foreground">
                  Detailed insights and performance metrics
                </p>
              </div>

              {analytics && (
                <div className="grid gap-6">
                  {/* Monthly Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={analytics.monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="requests" 
                            stroke="hsl(var(--primary))" 
                            name="Total Requests"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="completed" 
                            stroke="hsl(var(--secondary))" 
                            name="Completed"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Specialty Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Specialty Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analytics.specialtyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="specialty" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="case_count" fill="hsl(var(--primary))" name="Total Cases" />
                          <Bar dataKey="success_rate" fill="hsl(var(--secondary))" name="Success Rate %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          )}

          {canImportData && (
            <TabsContent value="import" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Data Import</h2>
                <p className="text-muted-foreground">
                  Import medical requests from Excel files
                </p>
              </div>

              <UnifiedExcelImport />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}