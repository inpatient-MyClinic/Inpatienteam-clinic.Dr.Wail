import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Mail, Eye, ChevronDown, ChevronUp, Download, FileText, Loader2 } from 'lucide-react';
import { VATInvoice } from '@/types/billing';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import VATInvoicePrintView from './VATInvoicePrintView';
import { supabase } from '@/integrations/supabase/client';

interface VATInvoicesTabProps {
  vatInvoices: VATInvoice[];
  onSendEmail: (invoiceId: string) => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Hospital email mapping (in real app, this would come from database)
const hospitalEmails: Record<string, string> = {
  'Hospital A': 'hospital.a@example.com',
  'Hospital B': 'hospital.b@example.com',
  'Hospital C': 'hospital.c@example.com',
};

export default function VATInvoicesTab({ vatInvoices, onSendEmail }: VATInvoicesTabProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedHospital, setSelectedHospital] = useState<string>('all');
  const [expandedHospital, setExpandedHospital] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<VATInvoice | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const { toast } = useToast();

  const hospitals = useMemo(() => [...new Set(vatInvoices.map(inv => inv.hospital))], [vatInvoices]);

  const filteredInvoices = useMemo(() => {
    return vatInvoices.filter(inv => {
      if (selectedMonth !== 'all' && inv.month !== selectedMonth) return false;
      if (selectedHospital !== 'all' && inv.hospital !== selectedHospital) return false;
      return true;
    });
  }, [vatInvoices, selectedMonth, selectedHospital]);

  const invoicesByHospital = useMemo(() => {
    const grouped: Record<string, VATInvoice[]> = {};
    filteredInvoices.forEach(inv => {
      if (!grouped[inv.hospital]) grouped[inv.hospital] = [];
      grouped[inv.hospital].push(inv);
    });
    Object.values(grouped).forEach(invoices => invoices.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()));
    return grouped;
  }, [filteredInvoices]);

  const monthlyTotals = useMemo(() => {
    const totals: Record<string, { count: number; total: number; vat: number }> = {};
    filteredInvoices.forEach(inv => {
      const key = `${inv.month} ${inv.year}`;
      if (!totals[key]) totals[key] = { count: 0, total: 0, vat: 0 };
      totals[key].count++;
      totals[key].total += inv.total;
      totals[key].vat += inv.vatAmount;
    });
    return totals;
  }, [filteredInvoices]);

  const handlePrint = (invoice: VATInvoice) => {
    setViewingInvoice(invoice);
    setTimeout(() => window.print(), 100);
  };

  const exportInvoicePDF = (invoice: VATInvoice) => {
    // For PDF export, we'll open print dialog with the invoice
    setViewingInvoice(invoice);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleSendEmail = async (invoice: VATInvoice) => {
    setSendingEmail(invoice.id);
    
    try {
      const hospitalEmail = hospitalEmails[invoice.hospital] || `billing@${invoice.hospital.toLowerCase().replace(/\s+/g, '')}.com`;
      
      const { data, error } = await supabase.functions.invoke('send-vat-invoice-email', {
        body: {
          hospitalEmail,
          hospitalName: invoice.hospital,
          invoiceNumber: invoice.invoiceNumber,
          invoiceMonth: invoice.month,
          invoiceYear: invoice.year,
          subtotal: invoice.subtotal,
          vatAmount: invoice.vatAmount,
          total: invoice.total,
        }
      });

      if (error) throw error;

      onSendEmail(invoice.id);
      toast({ 
        title: "Email Sent", 
        description: `Invoice ${invoice.invoiceNumber} sent to ${hospitalEmail}` 
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({ 
        title: "Email Failed", 
        description: error.message || "Failed to send email. Please check SMTP configuration.",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = { 
      'issued': 'bg-blue-100 text-blue-800', 
      'sent': 'bg-green-100 text-green-800', 
      'paid': 'bg-emerald-100 text-emerald-800', 
      'cancelled': 'bg-red-100 text-red-800' 
    };
    return <Badge className={colors[status] || 'bg-gray-100'}>{status}</Badge>;
  };

  if (viewingInvoice) {
    return (
      <div className="p-4">
        <div className="flex gap-2 mb-4 print:hidden">
          <Button variant="outline" onClick={() => setViewingInvoice(null)}>← Back</Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />Print / Save as PDF
          </Button>
          <Button 
            onClick={() => handleSendEmail(viewingInvoice)}
            disabled={sendingEmail === viewingInvoice.id}
          >
            {sendingEmail === viewingInvoice.id ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Send Email
          </Button>
        </div>
        <VATInvoicePrintView invoice={viewingInvoice} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex gap-4 items-center">
        <Select value={selectedHospital} onValueChange={setSelectedHospital}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Hospital" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hospitals</SelectItem>
            {hospitals.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {Object.keys(monthlyTotals).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(monthlyTotals).map(([period, data]) => (
            <Card key={period}>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">{period}</div>
                <div className="text-xl font-bold">{data.total.toLocaleString()} SAR</div>
                <div className="text-xs text-muted-foreground">{data.count} invoices | VAT: {data.vat.toLocaleString()} SAR</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {Object.entries(invoicesByHospital).map(([hospital, invoices]) => (
        <Collapsible key={hospital} open={expandedHospital === hospital || selectedHospital !== 'all'} onOpenChange={() => setExpandedHospital(expandedHospital === hospital ? null : hospital)}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{hospital}</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">{invoices.length} invoices | {invoices.reduce((s, i) => s + i.total, 0).toLocaleString()} SAR</div>
                    {(expandedHospital === hospital || selectedHospital !== 'all') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">VAT</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.month} {invoice.year}</TableCell>
                        <TableCell className="text-right">{invoice.subtotal.toLocaleString()} SAR</TableCell>
                        <TableCell className="text-right">{invoice.vatAmount.toLocaleString()} SAR</TableCell>
                        <TableCell className="text-right font-medium">{invoice.total.toLocaleString()} SAR</TableCell>
                        <TableCell>{format(new Date(invoice.issuedAt), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setViewingInvoice(invoice)} title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handlePrint(invoice)} title="Print">
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => exportInvoicePDF(invoice)} title="Export PDF">
                              <Download className="w-4 h-4" />
                            </Button>
                            {invoice.status !== 'sent' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleSendEmail(invoice)}
                                disabled={sendingEmail === invoice.id}
                                title="Send Email"
                              >
                                {sendingEmail === invoice.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Mail className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      {Object.keys(invoicesByHospital).length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No VAT invoices issued yet.</CardContent></Card>
      )}
    </div>
  );
}
