import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dataIntegrationService } from "@/services/dataIntegrationService";
import { requestStorage } from "@/services/requestStorage";

export function DataDebugger() {
  const analyticsData = dataIntegrationService.getAnalyticsData();
  const rawRequests = requestStorage.getAllRequests();
  const excelImported = localStorage.getItem('excel_data_imported') === 'true';

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">Data Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs">Excel Data:</span>
          <Badge variant={excelImported ? "default" : "secondary"}>
            {excelImported ? "Imported" : "Not Imported"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">Raw Requests:</span>
          <Badge variant="outline">{rawRequests.length}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">Analytics Data:</span>
          <Badge variant="outline">{analyticsData.length}</Badge>
        </div>
        
        {analyticsData.length > 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            Last Request: {analyticsData[analyticsData.length - 1]?.date}
          </div>
        )}
      </CardContent>
    </Card>
  );
}