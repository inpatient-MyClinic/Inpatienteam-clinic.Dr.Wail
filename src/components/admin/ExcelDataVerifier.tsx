// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertCircle, RefreshCw, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VerificationData {
  month: string;
  year: number;
  expectedTotal: number;
  actualTotal: number;
  statusBreakdown: Record<string, number>;
  matches: boolean;
}

export default function ExcelDataVerifier() {
  const [verificationData, setVerificationData] = useState<VerificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const expectedResults = {
    'July 2024': {
      total: 209,
      breakdown: {
        'Case Canceled': 18,
        'Done': 153,
        'Pending': 13,
        'Planned NVD': 2,
        'Scheduled': 9,
        'Under Process': 13
      }
    },
    'June 2024': {
      total: 160,
      breakdown: {
        'Case Canceled': 16,
        'Done': 121,
        'Pending': 8,
        'Scheduled': 4,
        'Under Process': 11
      }
    }
  };

  const verifyData = async () => {
    setLoading(true);
    const results: VerificationData[] = [];

    for (const [monthYear, expected] of Object.entries(expectedResults)) {
      const [monthName, year] = monthYear.split(' ');
      const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

      try {
        const { data, error } = await supabase.rpc('analyze_excel_cases_monthly', {
          p_year: parseInt(year),
          p_month: monthNum
        });

        if (error) throw error;

        const result = data?.[0];
        const actualTotal = Number(result?.total_cases) || 0;
        const statusBreakdown = (result?.status_breakdown as Record<string, number>) || {};

        results.push({
          month: monthYear,
          year: parseInt(year),
          expectedTotal: expected.total,
          actualTotal,
          statusBreakdown,
          matches: actualTotal === expected.total
        });
      } catch (error) {
        console.error(`Error verifying ${monthYear}:`, error);
        results.push({
          month: monthYear,
          year: parseInt(year),
          expectedTotal: expected.total,
          actualTotal: 0,
          statusBreakdown: {},
          matches: false
        });
      }
    }

    setVerificationData(results);
    setLoading(false);
  };

  useEffect(() => {
    verifyData();
  }, []);

  const getStatusColor = (matches: boolean) => {
    return matches ? "text-green-600" : "text-red-600";
  };

  const viewDetails = (month: string) => {
    setSelectedMonth(selectedMonth === month ? null : month);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Excel Data Verification
            <Button variant="ghost" size="sm" onClick={verifyData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationData.map((data) => (
              <div key={data.month} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{data.month}</h3>
                    {data.matches ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => viewDetails(data.month)}>
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Expected Total</div>
                    <div className="font-medium">{data.expectedTotal}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Actual Total</div>
                    <div className={`font-medium ${getStatusColor(data.matches)}`}>
                      {data.actualTotal}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Difference</div>
                    <div className={`font-medium ${getStatusColor(data.matches)}`}>
                      {data.actualTotal - data.expectedTotal}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <Badge variant={data.matches ? "default" : "destructive"}>
                      {data.matches ? "Match" : "Mismatch"}
                    </Badge>
                  </div>
                </div>

                {selectedMonth === data.month && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Status Breakdown Comparison</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Expected</TableHead>
                          <TableHead>Actual</TableHead>
                          <TableHead>Difference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(expectedResults[data.month as keyof typeof expectedResults]?.breakdown || {}).map(([status, expected]) => {
                          const actual = data.statusBreakdown[status] || 0;
                          const diff = actual - expected;
                          return (
                            <TableRow key={status}>
                              <TableCell>{status}</TableCell>
                              <TableCell>{expected}</TableCell>
                              <TableCell className={diff === 0 ? "" : "text-red-600"}>
                                {actual}
                              </TableCell>
                              <TableCell className={diff === 0 ? "text-green-600" : "text-red-600"}>
                                {diff > 0 ? `+${diff}` : diff}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}