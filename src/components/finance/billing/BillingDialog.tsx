
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

// Sample data for demonstration
const samplePriceComparisons: PriceComparison[] = [
  // Hospital A - some matched, some not
  { id: '1', serviceCode: 'CONS-001', serviceName: 'General Consultation', hospital: 'King Fahad Hospital', systemPrice: 150, uploadedPrice: 150, priceDifference: 0, percentageDifference: 0, quantity: 25, grossAmount: 3750, discount: 0, amountAfterDiscount: 3750, patientShare: 375, insuranceShare: 3375, status: 'matched', uploadBatchId: 'batch1' },
  { id: '2', serviceCode: 'LAB-002', serviceName: 'Complete Blood Count (CBC)', hospital: 'King Fahad Hospital', systemPrice: 80, uploadedPrice: 95, priceDifference: 15, percentageDifference: 18.75, quantity: 40, grossAmount: 3800, discount: 200, amountAfterDiscount: 3600, patientShare: 360, insuranceShare: 3240, status: 'pending', uploadBatchId: 'batch1' },
  { id: '3', serviceCode: 'RAD-003', serviceName: 'Chest X-Ray', hospital: 'King Fahad Hospital', systemPrice: 200, uploadedPrice: 220, priceDifference: 20, percentageDifference: 10, quantity: 15, grossAmount: 3300, discount: 0, amountAfterDiscount: 3300, patientShare: 330, insuranceShare: 2970, status: 'agreed', uploadBatchId: 'batch1' },
  { id: '4', serviceCode: 'SURG-004', serviceName: 'Minor Surgery', hospital: 'King Fahad Hospital', systemPrice: 2500, uploadedPrice: 2800, priceDifference: 300, percentageDifference: 12, quantity: 5, grossAmount: 14000, discount: 500, amountAfterDiscount: 13500, patientShare: 1350, insuranceShare: 12150, status: 'pending', uploadBatchId: 'batch1' },
  
  // Hospital B - all matched
  { id: '5', serviceCode: 'CONS-001', serviceName: 'General Consultation', hospital: 'Saudi German Hospital', systemPrice: 150, uploadedPrice: 150, priceDifference: 0, percentageDifference: 0, quantity: 30, grossAmount: 4500, discount: 0, amountAfterDiscount: 4500, patientShare: 450, insuranceShare: 4050, status: 'matched', uploadBatchId: 'batch2' },
  { id: '6', serviceCode: 'LAB-002', serviceName: 'Complete Blood Count (CBC)', hospital: 'Saudi German Hospital', systemPrice: 80, uploadedPrice: 80, priceDifference: 0, percentageDifference: 0, quantity: 50, grossAmount: 4000, discount: 0, amountAfterDiscount: 4000, patientShare: 400, insuranceShare: 3600, status: 'matched', uploadBatchId: 'batch2' },
  { id: '7', serviceCode: 'ECG-005', serviceName: 'Electrocardiogram', hospital: 'Saudi German Hospital', systemPrice: 120, uploadedPrice: 120, priceDifference: 0, percentageDifference: 0, quantity: 20, grossAmount: 2400, discount: 0, amountAfterDiscount: 2400, patientShare: 240, insuranceShare: 2160, status: 'matched', uploadBatchId: 'batch2' },
  
  // Hospital C - high differences
  { id: '8', serviceCode: 'MRI-006', serviceName: 'MRI Brain', hospital: 'Dr. Soliman Fakeeh Hospital', systemPrice: 1500, uploadedPrice: 1850, priceDifference: 350, percentageDifference: 23.33, quantity: 8, grossAmount: 14800, discount: 800, amountAfterDiscount: 14000, patientShare: 1400, insuranceShare: 12600, status: 'pending', uploadBatchId: 'batch3' },
  { id: '9', serviceCode: 'CT-007', serviceName: 'CT Scan Abdomen', hospital: 'Dr. Soliman Fakeeh Hospital', systemPrice: 900, uploadedPrice: 1100, priceDifference: 200, percentageDifference: 22.22, quantity: 12, grossAmount: 13200, discount: 600, amountAfterDiscount: 12600, patientShare: 1260, insuranceShare: 11340, status: 'pending', uploadBatchId: 'batch3' },
  { id: '10', serviceCode: 'PHYS-008', serviceName: 'Physiotherapy Session', hospital: 'Dr. Soliman Fakeeh Hospital', systemPrice: 180, uploadedPrice: 200, priceDifference: 20, percentageDifference: 11.11, quantity: 35, grossAmount: 7000, discount: 350, amountAfterDiscount: 6650, patientShare: 665, insuranceShare: 5985, status: 'agreed', uploadBatchId: 'batch3' },
];

const sampleUploadBatches: UploadBatch[] = [
  { id: 'batch1', hospital: 'King Fahad Hospital', fileName: 'KFH_prices_dec_2024.xlsx', uploadedAt: '2024-12-01T10:30:00Z', month: 'December', year: 2024, itemCount: 4, status: 'pending' },
  { id: 'batch2', hospital: 'Saudi German Hospital', fileName: 'SGH_invoice_dec_2024.xlsx', uploadedAt: '2024-12-02T14:15:00Z', month: 'December', year: 2024, itemCount: 3, status: 'reviewed' },
  { id: 'batch3', hospital: 'Dr. Soliman Fakeeh Hospital', fileName: 'DSF_billing_dec_2024.xlsx', uploadedAt: '2024-12-03T09:45:00Z', month: 'December', year: 2024, itemCount: 3, status: 'pending' },
];

const sampleVatInvoices: VATInvoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'NC01-0000001',
    hospital: 'Saudi German Hospital',
    hospitalVatNumber: '300816757310003',
    batchType: 'In Patient services',
    batchName: 'In Patient services SGH - November 2024',
    batchDateFrom: '2024-11-01',
    batchDateTo: '2024-11-30',
    month: 'November',
    year: 2024,
    lineItems: [
      { code: 'CONS-001', natureOfService: 'General Consultation', details: 'Nov 2024', quantity: 28, grossUnitPrice: 150, grossAmount: 4200, discount: 0, amountAfterDiscount: 4200, patientShare: 420, insuranceShare: 3780, vatRate: 15, vatAmount: 567, itemSubtotal: 4347, vatCategoryCode: 'S' },
      { code: 'LAB-002', natureOfService: 'Complete Blood Count', details: 'Nov 2024', quantity: 45, grossUnitPrice: 80, grossAmount: 3600, discount: 0, amountAfterDiscount: 3600, patientShare: 360, insuranceShare: 3240, vatRate: 15, vatAmount: 486, itemSubtotal: 4086, vatCategoryCode: 'S' },
    ],
    subtotal: 7800,
    vatRate: 15,
    vatAmount: 1170,
    total: 8970,
    issuedAt: '2024-11-28T16:00:00Z',
    status: 'sent',
    emailSentAt: '2024-11-28T16:30:00Z'
  },
  {
    id: 'inv2',
    invoiceNumber: 'NC01-0000002',
    hospital: 'King Fahad Hospital',
    hospitalVatNumber: '300912345610003',
    batchType: 'In Patient services',
    batchName: 'In Patient services KFH - November 2024',
    batchDateFrom: '2024-11-01',
    batchDateTo: '2024-11-30',
    month: 'November',
    year: 2024,
    lineItems: [
      { code: 'CONS-001', natureOfService: 'General Consultation', details: 'Nov 2024', quantity: 22, grossUnitPrice: 150, grossAmount: 3300, discount: 0, amountAfterDiscount: 3300, patientShare: 330, insuranceShare: 2970, vatRate: 15, vatAmount: 445.5, itemSubtotal: 3415.5, vatCategoryCode: 'S' },
      { code: 'RAD-003', natureOfService: 'Chest X-Ray', details: 'Nov 2024', quantity: 18, grossUnitPrice: 200, grossAmount: 3600, discount: 200, amountAfterDiscount: 3400, patientShare: 340, insuranceShare: 3060, vatRate: 15, vatAmount: 459, itemSubtotal: 3519, vatCategoryCode: 'S' },
    ],
    subtotal: 6700,
    vatRate: 15,
    vatAmount: 1005,
    total: 7705,
    issuedAt: '2024-11-29T11:00:00Z',
    status: 'issued'
  },
];

export default function BillingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>(samplePriceComparisons);
  const [uploadBatches, setUploadBatches] = useState<UploadBatch[]>(sampleUploadBatches);
  const [vatInvoices, setVatInvoices] = useState<VATInvoice[]>(sampleVatInvoices);
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
