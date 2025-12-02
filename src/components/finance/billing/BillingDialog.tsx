
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt } from 'lucide-react';
import PriceReviewTab from './PriceReviewTab';
import HospitalMatchStatusTab from './HospitalMatchStatusTab';
import VATInvoicesTab from './VATInvoicesTab';
import { PriceComparison, UploadBatch, VATInvoice, VATInvoiceLineItem, VAT_RATE } from '@/types/billing';
import { useToast } from '@/hooks/use-toast';

export default function BillingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>([]);
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>([]);
  const [vatInvoices, setVatInvoices] = useState<VATInvoice[]>([]);
  const { toast } = useToast();

  const handlePriceComparisonUpdate = (comparisons: PriceComparison[]) => {
    setPriceComparisons(comparisons);
  };

  const handleAddBatch = (batch: UploadBatch) => {
    setUploadBatches(prev => [...prev, batch]);
  };

  const handleStatusChange = (id: string, status: 'agreed' | 'not_agreed') => {
    setPriceComparisons(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status, acceptedAt: status === 'agreed' ? new Date().toISOString() : undefined } : item
      )
    );
  };

  const handleIssueVATInvoice = (hospital: string, month: string, year: number) => {
    // Get ready items (agreed or matched)
    const readyItems = priceComparisons.filter(
      p => p.hospital === hospital && (p.status === 'agreed' || p.status === 'matched')
    );

    if (readyItems.length === 0) {
      toast({
        title: "No ready items",
        description: "No agreed or matched items to invoice",
        variant: "destructive"
      });
      return;
    }

    const lineItems: VATInvoiceLineItem[] = readyItems.map(item => ({
      code: item.serviceCode,
      natureOfService: item.serviceName,
      details: `${item.serviceName} - ${month} ${year}`,
      quantity: item.quantity,
      grossUnitPrice: item.uploadedPrice,
      grossAmount: item.grossAmount,
      discount: item.discount,
      amountAfterDiscount: item.amountAfterDiscount,
      patientShare: item.patientShare,
      insuranceShare: item.insuranceShare,
      vatRate: VAT_RATE * 100,
      vatAmount: item.insuranceShare * VAT_RATE,
      itemSubtotal: item.insuranceShare * (1 + VAT_RATE),
      vatCategoryCode: 'S'
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + item.insuranceShare, 0);
    const vatAmount = subtotal * VAT_RATE;
    
    const monthAbbr = month.substring(0, 3).toUpperCase();
    const invoiceCount = vatInvoices.filter(inv => inv.hospital === hospital).length + 1;
    
    const newInvoice: VATInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `NC01-${String(invoiceCount).padStart(7, '0')}${invoiceCount}`,
      hospital,
      hospitalVatNumber: '300816757310003',
      batchType: 'In Patient services',
      batchName: `In Patient services ${hospital.split(' ').pop()} - ${month} ${year}`,
      batchDateFrom: `${year}-${String(new Date(`${month} 1, ${year}`).getMonth() + 1).padStart(2, '0')}-01`,
      batchDateTo: `${year}-${String(new Date(`${month} 1, ${year}`).getMonth() + 1).padStart(2, '0')}-${new Date(year, new Date(`${month} 1, ${year}`).getMonth() + 1, 0).getDate()}`,
      month,
      year,
      lineItems,
      subtotal,
      vatRate: VAT_RATE * 100,
      vatAmount,
      total: subtotal + vatAmount,
      issuedAt: new Date().toISOString(),
      status: 'issued'
    };

    setVatInvoices(prev => [...prev, newInvoice]);

    // Update batch status
    setUploadBatches(prev => 
      prev.map(b => 
        b.hospital === hospital && b.month === month && b.year === year
          ? { ...b, status: 'completed' }
          : b
      )
    );

    toast({
      title: "VAT Invoice Issued",
      description: `Invoice ${newInvoice.invoiceNumber} created for ${hospital}`
    });
  };

  const handleIssueAllVATInvoices = (month: string, year: number) => {
    const hospitals = [...new Set(
      priceComparisons
        .filter(p => p.status === 'agreed' || p.status === 'matched')
        .map(p => p.hospital)
    )];

    let issued = 0;
    hospitals.forEach(hospital => {
      const alreadyIssued = vatInvoices.some(
        inv => inv.hospital === hospital && inv.month === month && inv.year === year
      );
      if (!alreadyIssued) {
        handleIssueVATInvoice(hospital, month, year);
        issued++;
      }
    });

    if (issued > 0) {
      toast({
        title: "VAT Invoices Issued",
        description: `${issued} invoices created successfully`
      });
    }
  };

  const handleSendEmail = (invoiceId: string) => {
    setVatInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, status: 'sent', emailSentAt: new Date().toISOString() }
          : inv
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Billing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Billing & Price Management</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="price-review" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="price-review">Price Review</TabsTrigger>
            <TabsTrigger value="match-status">Hospital Match Status</TabsTrigger>
            <TabsTrigger value="vat-invoices">VAT Invoices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="price-review" className="flex-1 overflow-auto">
            <PriceReviewTab 
              priceComparisons={priceComparisons}
              uploadBatches={uploadBatches}
              onUpdateComparisons={handlePriceComparisonUpdate}
              onAddBatch={handleAddBatch}
              onStatusChange={handleStatusChange}
            />
          </TabsContent>
          
          <TabsContent value="match-status" className="flex-1 overflow-auto">
            <HospitalMatchStatusTab 
              priceComparisons={priceComparisons}
              vatInvoices={vatInvoices}
              onStatusChange={handleStatusChange}
              onIssueVATInvoice={handleIssueVATInvoice}
              onIssueAllVATInvoices={handleIssueAllVATInvoices}
            />
          </TabsContent>
          
          <TabsContent value="vat-invoices" className="flex-1 overflow-auto">
            <VATInvoicesTab 
              vatInvoices={vatInvoices} 
              onSendEmail={handleSendEmail}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
