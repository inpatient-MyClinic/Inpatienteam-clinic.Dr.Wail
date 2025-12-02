import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CheckCircle, XCircle, ChevronDown, ChevronUp, Eye, Printer } from 'lucide-react';
import { PriceComparison, VATInvoice, VAT_RATE } from '@/types/billing';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VATInvoicePrintView from './VATInvoicePrintView';

interface HospitalMatchStatusTabProps {
  priceComparisons: PriceComparison[];
  vatInvoices: VATInvoice[];
  onStatusChange: (id: string, status: 'agreed' | 'not_agreed') => void;
  onIssueVATInvoice: (hospital: string, month: string, year: number) => void;
  onIssueAllVATInvoices: (month: string, year: number) => void;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function HospitalMatchStatusTab({ 
  priceComparisons, 
  vatInvoices, 
  onStatusChange,
  onIssueVATInvoice, 
  onIssueAllVATInvoices 
}: HospitalMatchStatusTabProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [expandedHospital, setExpandedHospital] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<VATInvoice | null>(null);
  const [agreedItems, setAgreedItems] = useState<Set<string>>(new Set());

  const hospitalData = useMemo(() => {
    const grouped: Record<string, PriceComparison[]> = {};
    
    priceComparisons.forEach(item => {
      if (!grouped[item.hospital]) grouped[item.hospital] = [];
      grouped[item.hospital].push(item);
    });

    return Object.entries(grouped).map(([hospital, items]) => {
      const matchedItems = items.filter(i => i.priceDifference === 0 || i.status === 'matched');
      const notMatchedItems = items.filter(i => i.priceDifference !== 0 && i.status !== 'matched');
      const agreedCount = items.filter(i => i.status === 'agreed' || agreedItems.has(i.id)).length;
      
      const totalBill = items.reduce((sum, i) => sum + i.amountAfterDiscount, 0);
      const totalSystemPrice = items.reduce((sum, i) => sum + (i.systemPrice * i.quantity), 0);
      const totalDifference = items.reduce((sum, i) => sum + Math.abs(i.priceDifference * i.quantity), 0);
      const differencePercentage = totalSystemPrice > 0 ? (totalDifference / totalSystemPrice) * 100 : 0;
      
      const existingInvoice = vatInvoices.find(inv => inv.hospital === hospital && inv.month === selectedMonth && inv.year === selectedYear);
      
      return {
        hospital,
        items,
        matchedCount: matchedItems.length,
        notMatchedCount: notMatchedItems.length,
        agreedCount,
        totalItems: items.length,
        totalBill,
        totalDifference,
        differencePercentage,
        isFullyMatched: notMatchedItems.length === 0,
        hasInvoice: !!existingInvoice,
        existingInvoice
      };
    });
  }, [priceComparisons, vatInvoices, selectedMonth, selectedYear, agreedItems]);

  const toggleAgree = (itemId: string, isAgreed: boolean) => {
    setAgreedItems(prev => {
      const newSet = new Set(prev);
      if (isAgreed) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
    onStatusChange(itemId, isAgreed ? 'agreed' : 'not_agreed');
  };

  const handleIssueVAT = (hospital: string) => {
    onIssueVATInvoice(hospital, selectedMonth, selectedYear);
  };

  const handleIssueAllAgreed = () => {
    hospitalData.forEach(h => {
      if (h.agreedCount > 0 && !h.hasInvoice) {
        onIssueVATInvoice(h.hospital, selectedMonth, selectedYear);
      }
    });
  };

  const totalAgreedHospitals = hospitalData.filter(h => h.agreedCount > 0 && !h.hasInvoice).length;

  const generatePreviewInvoice = (hospital: string): VATInvoice => {
    const hospitalItems = priceComparisons.filter(p => 
      p.hospital === hospital && (p.status === 'agreed' || p.status === 'matched' || agreedItems.has(p.id))
    );
    
    const lineItems = hospitalItems.map(item => ({
      code: item.serviceCode,
      natureOfService: item.serviceName,
      details: '',
      quantity: item.quantity,
      grossUnitPrice: item.uploadedPrice,
      grossAmount: item.grossAmount,
      discount: item.discount,
      amountAfterDiscount: item.amountAfterDiscount,
      patientShare: item.patientShare,
      insuranceShare: item.insuranceShare,
      vatRate: VAT_RATE * 100,
      vatAmount: item.amountAfterDiscount * VAT_RATE,
      itemSubtotal: item.amountAfterDiscount * (1 + VAT_RATE),
      vatCategoryCode: 'S'
    }));
    
    const subtotal = lineItems.reduce((sum, i) => sum + i.amountAfterDiscount, 0);
    const vatAmount = subtotal * VAT_RATE;
    
    return {
      id: `preview-${Date.now()}`,
      invoiceNumber: `VAT-${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}-PREVIEW`,
      hospital,
      month: selectedMonth,
      year: selectedYear,
      batchType: 'Monthly',
      batchName: `${selectedMonth} ${selectedYear}`,
      batchDateFrom: `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}-01`,
      batchDateTo: `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}-30`,
      lineItems,
      subtotal,
      vatRate: VAT_RATE,
      vatAmount,
      total: subtotal + vatAmount,
      issuedAt: new Date().toISOString(),
      status: 'issued'
    };
  };

  const handlePrint = () => {
    window.print();
  };

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
        <Button 
          onClick={handleIssueAllAgreed} 
          disabled={totalAgreedHospitals === 0} 
          className="ml-auto bg-green-600 hover:bg-green-700"
        >
          <FileText className="w-4 h-4 mr-2" />
          Issue VAT for All Agreed ({totalAgreedHospitals})
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">
              {hospitalData.reduce((sum, h) => sum + h.matchedCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Matched Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">
              {hospitalData.reduce((sum, h) => sum + h.notMatchedCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Not Matched</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">
              {hospitalData.reduce((sum, h) => sum + h.agreedCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Agreed Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {hospitalData.reduce((sum, h) => sum + h.totalBill, 0).toLocaleString()} SAR
            </div>
            <div className="text-sm text-muted-foreground">Total Amount</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hospital Match Status - {selectedMonth} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead className="text-center">Match Status</TableHead>
                <TableHead className="text-right">Total Bill</TableHead>
                <TableHead className="text-right">Price Difference</TableHead>
                <TableHead className="text-right">Diff %</TableHead>
                <TableHead className="text-center">Agreed</TableHead>
                <TableHead>VAT Invoice</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitalData.map((hospital) => (
                <React.Fragment key={hospital.hospital}>
                  <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedHospital(expandedHospital === hospital.hospital ? null : hospital.hospital)}>
                    <TableCell>
                      {expandedHospital === hospital.hospital ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </TableCell>
                    <TableCell className="font-medium">{hospital.hospital}</TableCell>
                    <TableCell className="text-center">
                      {hospital.isFullyMatched ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          All Matched ({hospital.totalItems})
                        </Badge>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />{hospital.matchedCount}
                          </Badge>
                          <Badge className="bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />{hospital.notMatchedCount}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {hospital.totalBill.toLocaleString()} SAR
                    </TableCell>
                    <TableCell className={`text-right font-medium ${hospital.totalDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {hospital.totalDifference.toLocaleString()} SAR
                    </TableCell>
                    <TableCell className={`text-right ${hospital.differencePercentage > 5 ? 'text-red-600 font-bold' : hospital.differencePercentage > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {hospital.differencePercentage.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={hospital.agreedCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}>
                        {hospital.agreedCount}/{hospital.totalItems}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hospital.hasInvoice ? (
                        <Badge className="bg-green-100 text-green-800">{hospital.existingInvoice?.invoiceNumber}</Badge>
                      ) : (
                        <Badge variant="outline">Not Issued</Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setPreviewInvoice(generatePreviewInvoice(hospital.hospital))}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!hospital.hasInvoice && hospital.agreedCount > 0 && (
                          <Button 
                            size="sm" 
                            onClick={() => handleIssueVAT(hospital.hospital)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <FileText className="w-4 h-4 mr-1" />Issue
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {expandedHospital === hospital.hospital && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-muted/30 p-0">
                        <div className="p-4">
                          <h4 className="font-medium mb-3">Price Breakdown - {hospital.hospital}</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">Agree</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead className="text-right">Our Price</TableHead>
                                <TableHead className="text-right">Hospital Price</TableHead>
                                <TableHead className="text-right">Difference</TableHead>
                                <TableHead className="text-right">Diff %</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {hospital.items.map((item) => {
                                const isAgreed = item.status === 'agreed' || item.status === 'matched' || agreedItems.has(item.id);
                                const hasDifference = item.priceDifference !== 0;
                                
                                return (
                                  <TableRow 
                                    key={item.id} 
                                    className={hasDifference ? 'bg-red-50' : ''}
                                  >
                                    <TableCell>
                                      <Checkbox 
                                        checked={isAgreed}
                                        onCheckedChange={(checked) => toggleAgree(item.id, !!checked)}
                                        disabled={item.status === 'matched'}
                                      />
                                    </TableCell>
                                    <TableCell className="font-mono">{item.serviceCode}</TableCell>
                                    <TableCell>{item.serviceName}</TableCell>
                                    <TableCell className="text-right">{item.systemPrice.toLocaleString()} SAR</TableCell>
                                    <TableCell className={`text-right ${hasDifference ? 'font-bold text-red-600' : ''}`}>
                                      {item.uploadedPrice.toLocaleString()} SAR
                                    </TableCell>
                                    <TableCell className={`text-right ${hasDifference ? 'font-bold text-red-600 bg-red-100' : 'text-green-600'}`}>
                                      {item.priceDifference > 0 ? '+' : ''}{item.priceDifference.toLocaleString()} SAR
                                    </TableCell>
                                    <TableCell className={`text-right ${Math.abs(item.percentageDifference) > 10 ? 'font-bold text-red-600 bg-red-100' : hasDifference ? 'text-yellow-600' : 'text-green-600'}`}>
                                      {item.percentageDifference > 0 ? '+' : ''}{item.percentageDifference.toFixed(1)}%
                                    </TableCell>
                                    <TableCell>
                                      {item.status === 'matched' ? (
                                        <Badge className="bg-green-100 text-green-800">Matched</Badge>
                                      ) : isAgreed ? (
                                        <Badge className="bg-blue-100 text-blue-800">Agreed</Badge>
                                      ) : (
                                        <Badge className="bg-red-100 text-red-800">Not Agreed</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {hospitalData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No data. Upload prices in "Price Review" tab first.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>VAT Invoice Preview</span>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />Print
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewInvoice && <VATInvoicePrintView invoice={previewInvoice} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
