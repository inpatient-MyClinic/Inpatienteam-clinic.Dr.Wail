
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { PriceComparison, HospitalBillingStatus, VAT_RATE } from '@/types/billing';

interface HospitalMatchStatusTabProps {
  priceComparisons: PriceComparison[];
  hospitalStatuses: HospitalBillingStatus[];
  onIssueVATInvoice: (hospital: string, month: string, year: number) => void;
  onIssueAllVATInvoices: (month: string, year: number) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function HospitalMatchStatusTab({ 
  priceComparisons, 
  hospitalStatuses,
  onIssueVATInvoice,
  onIssueAllVATInvoices 
}: HospitalMatchStatusTabProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const currentYear = new Date().getFullYear();
  const currentMonth = months[new Date().getMonth()];

  // Group comparisons by hospital
  const hospitalData = useMemo(() => {
    const grouped: Record<string, { matched: PriceComparison[]; unmatched: PriceComparison[] }> = {};
    
    priceComparisons.forEach(item => {
      if (!grouped[item.hospital]) {
        grouped[item.hospital] = { matched: [], unmatched: [] };
      }
      if (item.isMatched) {
        grouped[item.hospital].matched.push(item);
      } else {
        grouped[item.hospital].unmatched.push(item);
      }
    });

    return Object.entries(grouped).map(([hospital, data]) => {
      const totalMatched = data.matched.reduce((sum, item) => sum + item.systemPrice, 0);
      const status = hospitalStatuses.find(
        h => h.hospital === hospital && h.month === currentMonth && h.year === currentYear
      );
      
      return {
        hospital,
        matchedCount: data.matched.length,
        unmatchedCount: data.unmatched.length,
        totalMatchedAmount: totalMatched,
        vatAmount: totalMatched * VAT_RATE,
        isVatInvoiceIssued: status?.isVatInvoiceIssued || false,
        vatInvoiceNumber: status?.vatInvoiceNumber
      };
    });
  }, [priceComparisons, hospitalStatuses, currentMonth, currentYear]);

  const filteredData = hospitalData.filter(item => {
    if (statusFilter === 'matched' && item.unmatchedCount > 0) return false;
    if (statusFilter === 'unmatched' && item.unmatchedCount === 0) return false;
    return true;
  });

  const totalMatchedHospitals = hospitalData.filter(h => h.unmatchedCount === 0).length;
  const canIssueVATToAll = filteredData.some(h => h.matchedCount > 0 && !h.isVatInvoiceIssued);

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="matched">Matched Only</SelectItem>
              <SelectItem value="unmatched">Has Unmatched</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button 
            onClick={() => onIssueAllVATInvoices(currentMonth, currentYear)}
            disabled={!canIssueVATToAll}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Issue VAT to All Matched Hospitals
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{totalMatchedHospitals}</div>
            <div className="text-sm text-muted-foreground">Fully Matched Hospitals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">
              {hospitalData.filter(h => h.unmatchedCount > 0).length}
            </div>
            <div className="text-sm text-muted-foreground">Hospitals with Unmatched</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {hospitalData.reduce((sum, h) => sum + h.totalMatchedAmount, 0).toLocaleString()} SAR
            </div>
            <div className="text-sm text-muted-foreground">Total Matched Amount</div>
          </CardContent>
        </Card>
      </div>

      {/* Hospital Status Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hospital Match Status - {currentMonth} {currentYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead className="text-center">Matched</TableHead>
                <TableHead className="text-center">Unmatched</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">VAT (15%)</TableHead>
                <TableHead>Invoice Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.hospital}>
                  <TableCell className="font-medium">{item.hospital}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {item.matchedCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.unmatchedCount > 0 ? (
                      <Badge className="bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        {item.unmatchedCount}
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600">0</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.totalMatchedAmount.toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right">{item.vatAmount.toLocaleString()} SAR</TableCell>
                  <TableCell>
                    {item.isVatInvoiceIssued ? (
                      <Badge className="bg-blue-100 text-blue-800">{item.vatInvoiceNumber}</Badge>
                    ) : (
                      <Badge variant="outline">Not Issued</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!item.isVatInvoiceIssued && item.matchedCount > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onIssueVATInvoice(item.hospital, currentMonth, currentYear)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Issue VAT
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No price comparisons uploaded yet. Go to "Price Review" tab to upload hospital prices.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
