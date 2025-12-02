import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CheckCircle, XCircle, Clock, Mail, History, ChevronDown, ChevronUp } from 'lucide-react';
import { PriceComparison, VATInvoice, VAT_RATE } from '@/types/billing';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface HospitalMatchStatusTabProps {
  priceComparisons: PriceComparison[];
  vatInvoices: VATInvoice[];
  onIssueVATInvoice: (hospital: string, month: string, year: number) => void;
  onIssueAllVATInvoices: (month: string, year: number) => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function HospitalMatchStatusTab({ priceComparisons, vatInvoices, onIssueVATInvoice, onIssueAllVATInvoices }: HospitalMatchStatusTabProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedHospital, setExpandedHospital] = useState<string | null>(null);

  const hospitalData = useMemo(() => {
    const grouped: Record<string, { agreed: PriceComparison[]; matched: PriceComparison[]; notAgreed: PriceComparison[]; pending: PriceComparison[] }> = {};
    
    priceComparisons.forEach(item => {
      if (!grouped[item.hospital]) grouped[item.hospital] = { agreed: [], matched: [], notAgreed: [], pending: [] };
      if (item.status === 'agreed') grouped[item.hospital].agreed.push(item);
      else if (item.status === 'matched') grouped[item.hospital].matched.push(item);
      else if (item.status === 'not_agreed') grouped[item.hospital].notAgreed.push(item);
      else grouped[item.hospital].pending.push(item);
    });

    return Object.entries(grouped).map(([hospital, data]) => {
      const readyItems = [...data.agreed, ...data.matched];
      const totalReadyAmount = readyItems.reduce((sum, item) => sum + item.amountAfterDiscount, 0);
      const existingInvoice = vatInvoices.find(inv => inv.hospital === hospital && inv.month === selectedMonth && inv.year === selectedYear);
      
      return {
        hospital,
        agreedCount: data.agreed.length,
        matchedCount: data.matched.length,
        notAgreedCount: data.notAgreed.length,
        pendingCount: data.pending.length,
        totalReadyAmount,
        vatAmount: totalReadyAmount * VAT_RATE,
        isVatInvoiceIssued: !!existingInvoice,
        vatInvoiceNumber: existingInvoice?.invoiceNumber,
        vatInvoiceStatus: existingInvoice?.status
      };
    });
  }, [priceComparisons, vatInvoices, selectedMonth, selectedYear]);

  const filteredData = hospitalData.filter(item => {
    if (statusFilter === 'ready' && (item.agreedCount + item.matchedCount) === 0) return false;
    if (statusFilter === 'pending' && item.pendingCount === 0) return false;
    if (statusFilter === 'not_agreed' && item.notAgreedCount === 0) return false;
    return true;
  });

  const totalReadyHospitals = hospitalData.filter(h => (h.agreedCount + h.matchedCount) > 0 && !h.isVatInvoiceIssued).length;

  const invoicesByHospital = useMemo(() => {
    const grouped: Record<string, VATInvoice[]> = {};
    vatInvoices.forEach(inv => {
      if (!grouped[inv.hospital]) grouped[inv.hospital] = [];
      grouped[inv.hospital].push(inv);
    });
    return grouped;
  }, [vatInvoices]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex gap-4 items-center flex-wrap">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>{[2024, 2025, 2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready for VAT</SelectItem>
            <SelectItem value="pending">Has Pending</SelectItem>
            <SelectItem value="not_agreed">Has Not Agreed</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => onIssueAllVATInvoices(selectedMonth, selectedYear)} disabled={totalReadyHospitals === 0} className="ml-auto bg-green-600 hover:bg-green-700">
          <FileText className="w-4 h-4 mr-2" />Issue VAT to All ({totalReadyHospitals})
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-green-600">{hospitalData.reduce((sum, h) => sum + h.agreedCount + h.matchedCount, 0)}</div><div className="text-sm text-muted-foreground">Ready Items</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-yellow-600">{hospitalData.reduce((sum, h) => sum + h.pendingCount, 0)}</div><div className="text-sm text-muted-foreground">Pending</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold text-red-600">{hospitalData.reduce((sum, h) => sum + h.notAgreedCount, 0)}</div><div className="text-sm text-muted-foreground">Not Agreed</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{hospitalData.reduce((sum, h) => sum + h.totalReadyAmount, 0).toLocaleString()} SAR</div><div className="text-sm text-muted-foreground">Total Ready</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Hospital Status - {selectedMonth} {selectedYear}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead className="text-center">Ready</TableHead>
                <TableHead className="text-center">Pending</TableHead>
                <TableHead className="text-center">Not Agreed</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">VAT (15%)</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.hospital}>
                  <TableCell className="font-medium">{item.hospital}</TableCell>
                  <TableCell className="text-center"><Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{item.agreedCount + item.matchedCount}</Badge></TableCell>
                  <TableCell className="text-center">{item.pendingCount > 0 ? <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />{item.pendingCount}</Badge> : <Badge className="bg-gray-100 text-gray-600">0</Badge>}</TableCell>
                  <TableCell className="text-center">{item.notAgreedCount > 0 ? <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />{item.notAgreedCount}</Badge> : <Badge className="bg-gray-100 text-gray-600">0</Badge>}</TableCell>
                  <TableCell className="text-right">{item.totalReadyAmount.toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right">{item.vatAmount.toLocaleString()} SAR</TableCell>
                  <TableCell>{item.isVatInvoiceIssued ? <div className="flex items-center gap-1"><Badge className="bg-blue-100 text-blue-800">{item.vatInvoiceNumber}</Badge>{item.vatInvoiceStatus === 'sent' && <Mail className="w-3 h-3 text-green-600" />}</div> : <Badge variant="outline">Not Issued</Badge>}</TableCell>
                  <TableCell>{!item.isVatInvoiceIssued && (item.agreedCount + item.matchedCount) > 0 && <Button size="sm" variant="outline" onClick={() => onIssueVATInvoice(item.hospital, selectedMonth, selectedYear)}><FileText className="w-4 h-4 mr-1" />Issue</Button>}</TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No data. Upload prices in "Price Review" tab.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {Object.keys(invoicesByHospital).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4" />Invoice History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(invoicesByHospital).map(([hospital, invoices]) => (
              <Collapsible key={hospital} open={expandedHospital === hospital} onOpenChange={() => setExpandedHospital(expandedHospital === hospital ? null : hospital)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <div className="font-medium">{hospital}</div>
                    <div className="flex items-center gap-2"><Badge variant="secondary">{invoices.length} invoices</Badge>{expandedHospital === hospital ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 ml-4 space-y-1">
                    {invoices.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                        <span className="font-mono">{inv.invoiceNumber}</span>
                        <span>{inv.month} {inv.year}</span>
                        <span className="font-medium">{inv.total.toLocaleString()} SAR</span>
                        <Badge className={inv.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>{inv.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}