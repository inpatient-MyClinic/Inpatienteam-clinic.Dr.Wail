import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Eye, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DataSanityWidgetProps {
  startDate: string;
  endDate: string;
  totalRows: number;
}

export default function DataSanityWidget({ startDate, endDate, totalRows }: DataSanityWidgetProps) {
  const [showRowsDialog, setShowRowsDialog] = useState(false);
  const [sampleRows, setSampleRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatDate = (dateStr: string) => {
    if (dateStr === '1900-01-01') return 'All time';
    return new Date(dateStr).toLocaleDateString();
  };

  const loadSampleRows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('unified_requests')
        .select(`
          request_date,
          patient_name,
          specialty,
          hospital_name,
          status,
          branch_code
        `)
        .gte('request_date', startDate)
        .lte('request_date', endDate)
        .order('request_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      setSampleRows(data || []);
      setShowRowsDialog(true);
    } catch (error: any) {
      console.error('Error loading sample rows:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Database className="w-4 h-4" />
            Data Sanity Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Period:</span>
            <span className="font-medium">
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-600">Total rows:</span>
              <span className="font-bold text-lg ml-2">{totalRows.toLocaleString()}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleRows}
              disabled={loading || totalRows === 0}
              className="flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View rows
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRowsDialog} onOpenChange={setShowRowsDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Sample Data Rows ({sampleRows.length} of {totalRows})</DialogTitle>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Branch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">
                      {row.request_date}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {row.patient_name}
                    </TableCell>
                    <TableCell>{row.specialty}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {row.hospital_name}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        row.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        row.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell>{row.branch_code}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {sampleRows.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data found for the selected period
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}