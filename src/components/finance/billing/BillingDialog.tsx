
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt } from 'lucide-react';
import PriceReviewTab from './PriceReviewTab';
import HospitalMatchStatusTab from './HospitalMatchStatusTab';
import VATInvoicesTab from './VATInvoicesTab';
import { PriceComparison, HospitalBillingStatus, VATInvoice } from '@/types/billing';

export default function BillingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>([]);
  const [hospitalStatuses, setHospitalStatuses] = useState<HospitalBillingStatus[]>([]);
  const [vatInvoices, setVatInvoices] = useState<VATInvoice[]>([]);

  const handlePriceComparisonUpdate = (comparisons: PriceComparison[]) => {
    setPriceComparisons(comparisons);
  };

  const handleAcceptMatch = (id: string) => {
    setPriceComparisons(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isMatched: true, acceptedAt: new Date().toISOString() } : item
      )
    );
  };

  const handleIssueVATInvoice = (hospital: string, month: string, year: number) => {
    const matchedItems = priceComparisons.filter(
      p => p.hospital === hospital && p.isMatched
    );
    
    const subtotal = matchedItems.reduce((sum, item) => sum + item.systemPrice, 0);
    const vatAmount = subtotal * 0.15;
    
    const newInvoice: VATInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `VAT-${year}-${month.substring(0, 3).toUpperCase()}-${String(vatInvoices.length + 1).padStart(4, '0')}`,
      hospital,
      month,
      year,
      subtotal,
      vatRate: 15,
      vatAmount,
      total: subtotal + vatAmount,
      issuedAt: new Date().toISOString(),
      status: 'issued'
    };

    setVatInvoices(prev => [...prev, newInvoice]);
    
    // Update hospital status
    setHospitalStatuses(prev => {
      const existing = prev.find(h => h.hospital === hospital && h.month === month && h.year === year);
      if (existing) {
        return prev.map(h => 
          h.hospital === hospital && h.month === month && h.year === year
            ? { ...h, isVatInvoiceIssued: true, vatInvoiceDate: newInvoice.issuedAt, vatInvoiceNumber: newInvoice.invoiceNumber }
            : h
        );
      }
      return prev;
    });
  };

  const handleIssueAllVATInvoices = (month: string, year: number) => {
    const hospitals = [...new Set(priceComparisons.filter(p => p.isMatched).map(p => p.hospital))];
    hospitals.forEach(hospital => {
      const alreadyIssued = vatInvoices.some(
        inv => inv.hospital === hospital && inv.month === month && inv.year === year
      );
      if (!alreadyIssued) {
        handleIssueVATInvoice(hospital, month, year);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Billing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
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
              onUpdateComparisons={handlePriceComparisonUpdate}
              onAcceptMatch={handleAcceptMatch}
            />
          </TabsContent>
          
          <TabsContent value="match-status" className="flex-1 overflow-auto">
            <HospitalMatchStatusTab 
              priceComparisons={priceComparisons}
              hospitalStatuses={hospitalStatuses}
              onIssueVATInvoice={handleIssueVATInvoice}
              onIssueAllVATInvoices={handleIssueAllVATInvoices}
            />
          </TabsContent>
          
          <TabsContent value="vat-invoices" className="flex-1 overflow-auto">
            <VATInvoicesTab vatInvoices={vatInvoices} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
