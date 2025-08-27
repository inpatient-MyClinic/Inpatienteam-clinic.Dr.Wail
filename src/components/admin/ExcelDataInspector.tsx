import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, Calendar, TrendingUp, Database, ExternalLink } from "lucide-react";
import { useExcelDataAnalytics } from "@/hooks/useExcelDataAnalytics";

export default function ExcelDataInspector() {
  const { analytics, refetch } = useExcelDataAnalytics();

  if (analytics.loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Loading Excel data...</div>
        </CardContent>
      </Card>
    );
  }

  if (analytics.error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="text-destructive text-center">
            Error: {analytics.error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analytics.totalUploads === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Excel Data Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            No Excel data uploaded yet. Please upload Excel files to see analytics.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Excel Data Overview
            <Button variant="ghost" size="sm" onClick={refetch}>
              <TrendingUp className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analytics.totalUploads}</div>
              <div className="text-sm text-muted-foreground">Excel Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analytics.totalRows.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analytics.availableMonths.length}</div>
              <div className="text-sm text-muted-foreground">Active Months</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Object.keys(analytics.statusBreakdown).length}
              </div>
              <div className="text-sm text-muted-foreground">Status Types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Upload */}
      {analytics.latestUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Table className="h-4 w-4" />
              Latest Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{analytics.latestUpload.filename}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(analytics.latestUpload.uploaded_at).toLocaleString()} • {analytics.latestUpload.total_rows} rows
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`https://supabase.com/dashboard/project/ixivawgjdoahqzlghtcz/editor?id=${analytics.latestUpload.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View in Supabase
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Months */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Available Data by Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.availableMonths.map(month => (
              <Badge key={`${month.year}-${month.month}`} variant="secondary">
                {month.monthName} {month.year} ({month.count})
              </Badge>
            ))}
          </div>
          {analytics.availableMonths.length === 0 && (
            <div className="text-muted-foreground text-sm">
              No processed data available. Ensure Excel files contain valid date columns.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Status Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.statusBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className="text-sm">{status}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.branchBreakdown)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([branch, count]) => (
                  <div key={branch} className="flex justify-between items-center">
                    <span className="text-sm">{branch}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}