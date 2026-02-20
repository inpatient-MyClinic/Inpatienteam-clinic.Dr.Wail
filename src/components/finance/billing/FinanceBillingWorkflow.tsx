
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Receipt, CheckCircle, XCircle, FileText, Send, Download, Printer, Archive, Filter, AlertTriangle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PROVIDER_INFO } from '@/types/billing';
import { generateInvoiceNumber, generateBatchName, getHospitalInfo } from '@/utils/providerInfoUtils';

type DoctorEmploymentType = 'FT' | 'PT';

interface BillingLineItem {
  id: string;
  statementId: string;
  hospitalName: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  specialty: string;
  procedureName: string;
  procedureDate: string;
  grossAmount: number;
  discount: number;
  netAmount: number;
  patientShare: number;
  insuranceShare: number;
  agreedSplitAmount: number;
  hospitalPrice: number;
  status: 'pending' | 'agreed' | 'flagged' | 'justified' | 'resolved';
  flagReason?: string;
  justification?: string;
  doctorType: DoctorEmploymentType;
  doctorSplitPercentage: number;
  doctorPaymentAmount: number;
}

interface VATInvoiceRecord {
  id: string;
  invoiceNumber: string;
  hospitalName: string;
  month: string;
  year: number;
  subtotal: number;
  vatAmount: number;
  total: number;
  status: 'issued' | 'sent' | 'pending_payment' | 'paid';
  issuedAt: string;
  sentAt?: string;
  paidAt?: string;
}

// Sample submitted billing items from hospitals
const sampleBillingItems: BillingLineItem[] = [
  { id: 'B1', statementId: 'S1', hospitalName: 'King Fahad Hospital', patientName: 'Ahmed Ali', patientId: 'MRN-2001', doctorName: 'Dr. Khalid', specialty: 'Orthopedics', procedureName: 'Knee Replacement', procedureDate: '2026-01-15', grossAmount: 45000, discount: 2000, netAmount: 43000, patientShare: 4300, insuranceShare: 38700, agreedSplitAmount: 38700, hospitalPrice: 40000, status: 'pending', doctorType: 'PT', doctorSplitPercentage: 85, doctorPaymentAmount: 32895 },
  { id: 'B2', statementId: 'S1', hospitalName: 'King Fahad Hospital', patientName: 'Sara Mohammed', patientId: 'MRN-2002', doctorName: 'Dr. Fatima', specialty: 'Cardiology', procedureName: 'Cardiac Catheterization', procedureDate: '2026-01-20', grossAmount: 28000, discount: 0, netAmount: 28000, patientShare: 2800, insuranceShare: 25200, agreedSplitAmount: 25200, hospitalPrice: 26000, status: 'pending', doctorType: 'PT', doctorSplitPercentage: 85, doctorPaymentAmount: 21420 },
  { id: 'B3', statementId: 'S2', hospitalName: 'Saudi German Hospital', patientName: 'Khalid Hassan', patientId: 'MRN-2003', doctorName: 'Dr. Ahmed', specialty: 'General Surgery', procedureName: 'Appendectomy', procedureDate: '2026-01-18', grossAmount: 12000, discount: 500, netAmount: 11500, patientShare: 1150, insuranceShare: 10350, agreedSplitAmount: 10350, hospitalPrice: 10350, status: 'pending', doctorType: 'FT', doctorSplitPercentage: 15, doctorPaymentAmount: 1552.5 },
  { id: 'B4', statementId: 'S2', hospitalName: 'Saudi German Hospital', patientName: 'Fatima Omar', patientId: 'MRN-2004', doctorName: 'Dr. Sara', specialty: 'Neurology', procedureName: 'Spinal Fusion', procedureDate: '2026-01-22', grossAmount: 65000, discount: 3000, netAmount: 62000, patientShare: 6200, insuranceShare: 55800, agreedSplitAmount: 55800, hospitalPrice: 58000, status: 'pending', doctorType: 'PT', doctorSplitPercentage: 85, doctorPaymentAmount: 47430 },
  { id: 'B5', statementId: 'S3', hospitalName: 'Dr. Soliman Fakeeh Hospital', patientName: 'Mohammed Saleh', patientId: 'MRN-2005', doctorName: 'Dr. Khalid', specialty: 'Orthopedics', procedureName: 'Hip Replacement', procedureDate: '2026-02-01', grossAmount: 38000, discount: 1500, netAmount: 36500, patientShare: 3650, insuranceShare: 32850, agreedSplitAmount: 32850, hospitalPrice: 35000, status: 'pending', doctorType: 'PT', doctorSplitPercentage: 85, doctorPaymentAmount: 27922.5 },
];

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function FinanceBillingWorkflow() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<BillingLineItem[]>(sampleBillingItems);
  const [vatInvoices, setVatInvoices] = useState<VATInvoiceRecord[]>([]);
  const [activeTab, setActiveTab] = useState('review');
  const { toast } = useToast();

  // Filters
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  const hospitals = [...new Set(items.map(i => i.hospitalName))];
  const specialties = [...new Set(items.map(i => i.specialty))];
  const doctors = [...new Set(items.map(i => i.doctorName))];

  const filterItems = (list: BillingLineItem[]) => list.filter(item => {
    const mH = hospitalFilter === 'all' || item.hospitalName === hospitalFilter;
    const mS = specialtyFilter === 'all' || item.specialty === specialtyFilter;
    const mD = doctorFilter === 'all' || item.doctorName === doctorFilter;
    return mH && mS && mD;
  });

  const pendingItems = filterItems(items.filter(i => i.status === 'pending'));
  const agreedItems = filterItems(items.filter(i => i.status === 'agreed'));
  const flaggedItems = filterItems(items.filter(i => i.status === 'flagged'));
  const justifiedItems = filterItems(items.filter(i => i.status === 'justified'));

  const handleAgree = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'agreed' as const } : i));
    toast({ title: "Item Agreed", description: "Amount matches agreed split" });
  };

  const handleDoctorTypeChange = (id: string, newType: DoctorEmploymentType) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const splitPct = newType === 'PT' ? 85 : 15;
      const payment = Math.round(i.insuranceShare * splitPct / 100 * 100) / 100;
      return { ...i, doctorType: newType, doctorSplitPercentage: splitPct, doctorPaymentAmount: payment };
    }));
    toast({ title: "Doctor Type Updated", description: `Set to ${newType === 'FT' ? 'Full Time (15%)' : 'Part Time (85%)'}` });
  };

  const handleFlag = (id: string, reason: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'flagged' as const, flagReason: reason } : i));
    toast({ title: "Item Flagged", description: "Sent back to hospital for justification", variant: "destructive" });
  };

  const handleResolve = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'agreed' as const } : i));
    toast({ title: "Item Resolved", description: "Justification accepted" });
  };

  const handleGenerateVAT = (hospital: string) => {
    const hospitalAgreed = items.filter(i => i.hospitalName === hospital && i.status === 'agreed');
    if (hospitalAgreed.length === 0) return;

    const subtotal = hospitalAgreed.reduce((s, i) => s + i.agreedSplitAmount, 0);
    const vatAmount = Math.round(subtotal * 0.15 * 100) / 100;
    const invoiceNum = generateInvoiceNumber(vatInvoices.length);
    const currentMonth = months[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    const hospitalData = getHospitalInfo(hospital);

    const newInvoice: VATInvoiceRecord = {
      id: `INV-${Date.now()}`,
      invoiceNumber: invoiceNum,
      hospitalName: hospital,
      month: currentMonth,
      year: currentYear,
      subtotal,
      vatAmount,
      total: subtotal + vatAmount,
      status: 'issued',
      issuedAt: new Date().toISOString(),
    };
    setVatInvoices(prev => [...prev, newInvoice]);
    toast({ title: "VAT Invoice Generated", description: `Invoice ${invoiceNum} for ${hospital}` });
  };

  const handleSendInvoice = (id: string) => {
    setVatInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: 'sent', sentAt: new Date().toISOString() } : inv
    ));
    toast({ title: "Invoice Sent", description: "VAT invoice sent to hospital" });
  };

  const handleMarkPaid = (id: string) => {
    setVatInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status: 'paid', paidAt: new Date().toISOString() } : inv
    ));
    toast({ title: "Payment Recorded", description: "Invoice marked as paid" });
  };

  // Check if all items for a hospital are agreed
  const hospitalsWithAllAgreed = hospitals.filter(h => {
    const hospitalItems = items.filter(i => i.hospitalName === h);
    return hospitalItems.length > 0 && hospitalItems.every(i => i.status === 'agreed');
  });

  // Auto-generate VAT for fully agreed hospitals
  const autoGenerateVAT = () => {
    hospitalsWithAllAgreed.forEach(h => {
      if (!vatInvoices.some(v => v.hospitalName === h)) {
        handleGenerateVAT(h);
      }
    });
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      agreed: "bg-green-100 text-green-800",
      flagged: "bg-red-100 text-red-800",
      justified: "bg-orange-100 text-orange-800",
      issued: "bg-blue-100 text-blue-800",
      sent: "bg-purple-100 text-purple-800",
      pending_payment: "bg-amber-100 text-amber-800",
      paid: "bg-emerald-100 text-emerald-800",
    };
    return <Badge className={colors[status] || "bg-gray-100"}>{status.replace('_', ' ')}</Badge>;
  };

  // Filter bar component
  const FilterBar = () => (
    <div className="flex gap-3 items-center flex-wrap bg-gray-50 p-3 rounded-lg mb-4">
      <Filter className="w-4 h-4 text-gray-500" />
      <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Hospital" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Hospitals</SelectItem>
          {hospitals.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Specialty" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Specialties</SelectItem>
          {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={doctorFilter} onValueChange={setDoctorFilter}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Doctor" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Doctors</SelectItem>
          {doctors.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Excel</Button>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />PDF</Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Billing Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-green-600" />
            Finance Billing Workflow
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="review" className="relative">
              Review
              {pendingItems.length > 0 && <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full px-1.5">{pendingItems.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="flagged" className="relative">
              Flagged
              {justifiedItems.length > 0 && <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5">{justifiedItems.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="match-status">Hospital Match</TabsTrigger>
            <TabsTrigger value="vat">VAT Invoices</TabsTrigger>
            <TabsTrigger value="doctor-payments">Doctor Payments</TabsTrigger>
          </TabsList>

          {/* Review Tab - Pending items from hospitals */}
          <TabsContent value="review" className="flex-1 overflow-auto">
            <FilterBar />
            <div className="border rounded-lg overflow-auto max-h-[55vh]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50">
                    <TableHead>Hospital</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Agreed Amount</TableHead>
                    <TableHead className="text-right">Hospital Price</TableHead>
                    <TableHead className="text-right">Difference</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingItems.map(item => {
                    const diff = item.agreedSplitAmount - item.hospitalPrice;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.hospitalName}</TableCell>
                        <TableCell>{item.patientName}</TableCell>
                        <TableCell>{item.patientId}</TableCell>
                        <TableCell>{item.doctorName}</TableCell>
                        <TableCell>{item.specialty}</TableCell>
                        <TableCell>{item.procedureName}</TableCell>
                        <TableCell>{item.procedureDate}</TableCell>
                        <TableCell className="text-right">{item.agreedSplitAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.hospitalPrice.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-medium ${diff === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {diff === 0 ? 'Match' : `${diff > 0 ? '+' : ''}${diff.toLocaleString()}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-300" onClick={() => handleAgree(item.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <FlagButton onFlag={(reason) => handleFlag(item.id, reason)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pendingItems.length === 0 && (
                    <TableRow><TableCell colSpan={11} className="text-center py-8 text-gray-500">No pending items for review</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Flagged/Justified Tab */}
          <TabsContent value="flagged" className="flex-1 overflow-auto">
            <FilterBar />
            <div className="space-y-4">
              {justifiedItems.length > 0 && (
                <>
                  <h3 className="font-semibold text-orange-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Justifications to Review</h3>
                  {justifiedItems.map(item => (
                    <div key={item.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.patientName} - {item.procedureName}</p>
                          <p className="text-sm text-gray-600">{item.hospitalName} | {item.doctorName} | SAR {item.agreedSplitAmount.toLocaleString()}</p>
                        </div>
                        {statusBadge('justified')}
                      </div>
                      <p className="text-sm mt-2"><strong>Flag Reason:</strong> {item.flagReason}</p>
                      <p className="text-sm mt-1 bg-white p-2 rounded"><strong>Hospital Justification:</strong> {item.justification || 'Pending...'}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleResolve(item.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />Accept
                        </Button>
                        <FlagButton onFlag={(reason) => handleFlag(item.id, reason)} label="Re-flag" />
                      </div>
                    </div>
                  ))}
                </>
              )}
              {flaggedItems.length > 0 && (
                <>
                  <h3 className="font-semibold text-red-700 mt-4">Awaiting Hospital Response</h3>
                  {flaggedItems.map(item => (
                    <div key={item.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.patientName} - {item.procedureName}</p>
                          <p className="text-sm text-gray-600">{item.hospitalName} | {item.doctorName}</p>
                        </div>
                        {statusBadge('flagged')}
                      </div>
                      <p className="text-sm mt-2"><strong>Reason:</strong> {item.flagReason}</p>
                    </div>
                  ))}
                </>
              )}
              {justifiedItems.length === 0 && flaggedItems.length === 0 && (
                <p className="text-center text-gray-500 py-8">No flagged items</p>
              )}
            </div>
          </TabsContent>

          {/* Hospital Match Status */}
          <TabsContent value="match-status" className="flex-1 overflow-auto">
            <FilterBar />
            <div className="space-y-4">
              {hospitals.map(hospital => {
                const hospitalItems = items.filter(i => i.hospitalName === hospital);
                const agreed = hospitalItems.filter(i => i.status === 'agreed').length;
                const total = hospitalItems.length;
                const allAgreed = agreed === total && total > 0;
                const hasInvoice = vatInvoices.some(v => v.hospitalName === hospital);
                return (
                  <div key={hospital} className={`border rounded-lg p-4 ${allAgreed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{hospital}</p>
                        <p className="text-sm text-gray-600">{agreed}/{total} items agreed</p>
                        <div className="w-48 h-2 bg-gray-200 rounded-full mt-1">
                          <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(agreed/total)*100}%` }} />
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        {allAgreed && !hasInvoice && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleGenerateVAT(hospital)}>
                            <FileText className="w-4 h-4 mr-1" />Generate VAT
                          </Button>
                        )}
                        {hasInvoice && <Badge className="bg-blue-100 text-blue-800">VAT Issued</Badge>}
                        {allAgreed && <Badge className="bg-green-100 text-green-800">All Agreed</Badge>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* VAT Invoices */}
          <TabsContent value="vat" className="flex-1 overflow-auto">
            <FilterBar />
            <div className="space-y-4">
              {vatInvoices.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No VAT invoices generated yet. All items must be agreed first.</p>
              ) : (
                vatInvoices.map(inv => (
                  <div key={inv.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{inv.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{inv.hospitalName} | {inv.month} {inv.year}</p>
                        <p className="text-sm mt-1">
                          Subtotal: SAR {inv.subtotal.toLocaleString()} | VAT (15%): SAR {inv.vatAmount.toLocaleString()} | <strong>Total: SAR {inv.total.toLocaleString()}</strong>
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {statusBadge(inv.status)}
                        {inv.status === 'issued' && (
                          <Button size="sm" onClick={() => handleSendInvoice(inv.id)}>
                            <Send className="w-4 h-4 mr-1" />Send
                          </Button>
                        )}
                        {(inv.status === 'sent' || inv.status === 'pending_payment') && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleMarkPaid(inv.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />Mark Paid
                          </Button>
                        )}
                        <Button variant="outline" size="sm"><Download className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Doctor Payments */}
          <TabsContent value="doctor-payments" className="flex-1 overflow-auto">
            <FilterBar />
            <div className="border rounded-lg overflow-auto max-h-[55vh]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead>Doctor</TableHead>
                    <TableHead>FT/PT</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Insurance Share</TableHead>
                    <TableHead className="text-right">Split %</TableHead>
                    <TableHead className="text-right">Doctor Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterItems(items.filter(i => i.status === 'agreed')).map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.doctorName}</TableCell>
                      <TableCell>
                        <Select
                          value={item.doctorType}
                          onValueChange={(val: DoctorEmploymentType) => handleDoctorTypeChange(item.id, val)}
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FT">FT</SelectItem>
                            <SelectItem value="PT">PT</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{item.patientName}</TableCell>
                      <TableCell>{item.hospitalName}</TableCell>
                      <TableCell>{item.procedureName}</TableCell>
                      <TableCell>{item.procedureDate}</TableCell>
                      <TableCell className="text-right">{item.insuranceShare.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.doctorType === 'FT' ? 'secondary' : 'default'}>
                          {item.doctorSplitPercentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold">{item.doctorPaymentAmount.toLocaleString()}</TableCell>
                      <TableCell>{statusBadge('agreed')}</TableCell>
                    </TableRow>
                  ))}
                  {filterItems(items.filter(i => i.status === 'agreed')).length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No agreed items yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-3 text-sm font-medium text-right">
              Total Doctor Payments: SAR {filterItems(items.filter(i => i.status === 'agreed')).reduce((s, i) => s + i.doctorPaymentAmount, 0).toLocaleString()}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Flag button with reason dialog
function FlagButton({ onFlag, label = "Flag" }: { onFlag: (reason: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-red-600 border-red-300">
          <XCircle className="w-4 h-4" />{label !== "Flag" && <span className="ml-1 text-xs">{label}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Flag Item</DialogTitle></DialogHeader>
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={3}
          placeholder="Reason for flagging..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <Button disabled={!reason.trim()} onClick={() => { onFlag(reason); setOpen(false); setReason(''); }}
          className="bg-red-600 hover:bg-red-700 text-white">
          <XCircle className="w-4 h-4 mr-2" />Flag & Return to Hospital
        </Button>
      </DialogContent>
    </Dialog>
  );
}
