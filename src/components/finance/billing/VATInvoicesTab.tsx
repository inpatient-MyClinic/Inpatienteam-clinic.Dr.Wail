
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye, Printer } from 'lucide-react';
import { VATInvoice } from '@/types/billing';
import { format } from 'date-fns';

interface VATInvoicesTabProps {
  vatInvoices: VATInvoice[];
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function VATInvoicesTab({ vatInvoices }: VATInvoicesTabProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedHospital, setSelectedHospital] = useState<string>('all');

  const hospitals = useMemo(() => {
    return [...new Set(vatInvoices.map(inv => inv.hospital))];
  }, [vatInvoices]);

  const filteredInvoices = useMemo(() => {
    return vatInvoices.filter(inv => {
      if (selectedMonth !== 'all' && inv.month !== selectedMonth) return false;
      if (selectedHospital !== 'all' && inv.hospital !== selectedHospital) return false;
      return true;
    });
  }, [vatInvoices, selectedMonth, selectedHospital]);

  const totalsByMonth = useMemo(() => {
    const totals: Record<string, { count: number; total: number; vat: number }> = {};
    
    filteredInvoices.forEach(inv => {
      const key = `${inv.month} ${inv.year}`;
      if (!totals[key]) {
        totals[key] = { count: 0, total: 0, vat: 0 };
      }
      totals[key].count++;
      totals[key].total += inv.total;
      totals[key].vat += inv.vatAmount;
    });

    return totals;
  }, [filteredInvoices]);

  const handlePrintInvoice = (invoice: VATInvoice) => {
    const printContent = `
      <html>
        <head>
          <title>VAT Invoice - ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .amounts { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px; }
            .total { font-size: 1.2em; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>VAT Invoice</h1>
            <p>Invoice Number: ${invoice.invoiceNumber}</p>
          </div>
          <div class="invoice-details">
            <p><strong>Hospital:</strong> ${invoice.hospital}</p>
            <p><strong>Period:</strong> ${invoice.month} ${invoice.year}</p>
            <p><strong>Issue Date:</strong> ${format(new Date(invoice.issuedAt), 'dd/MM/yyyy')}</p>
          </div>
          <div class="amounts">
            <p>Subtotal: ${invoice.subtotal.toLocaleString()} SAR</p>
            <p>VAT (${invoice.vatRate}%): ${invoice.vatAmount.toLocaleString()} SAR</p>
            <p class="total">Total: ${invoice.total.toLocaleString()} SAR</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'issued': 'bg-blue-100 text-blue-800',
      'paid': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div>
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Filter by hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hospitals</SelectItem>
              {hospitals.map(h => (
                <SelectItem key={h} value={h}>{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
      </div>

      {/* Monthly Summary */}
      {Object.keys(totalsByMonth).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(totalsByMonth).map(([period, data]) => (
            <Card key={period}>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">{period}</div>
                <div className="text-xl font-bold">{data.total.toLocaleString()} SAR</div>
                <div className="text-xs text-muted-foreground">
                  {data.count} invoices | VAT: {data.vat.toLocaleString()} SAR
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">VAT Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">VAT (15%)</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.hospital}</TableCell>
                  <TableCell>{invoice.month} {invoice.year}</TableCell>
                  <TableCell className="text-right">{invoice.subtotal.toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right">{invoice.vatAmount.toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right font-medium">{invoice.total.toLocaleString()} SAR</TableCell>
                  <TableCell>{format(new Date(invoice.issuedAt), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handlePrintInvoice(invoice)}>
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No VAT invoices issued yet. Issue invoices from the "Hospital Match Status" tab.
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
