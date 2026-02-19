
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Send, Filter, Download, Printer, Archive, Clock, CheckCircle, AlertTriangle, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BillingItem {
  id: string;
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
  status: string;
  flagReason?: string;
  justification?: string;
  selected: boolean;
}

interface Statement {
  id: string;
  month: string;
  year: number;
  status: string;
  totalAmount: number;
  itemCount: number;
  submittedAt: string;
  items: BillingItem[];
}

// Generate sample billing items from requests
const generateBillingItems = (requests: any[]): BillingItem[] => {
  return requests
    .filter(r => r.status === "Done" || r.status === "Approved")
    .map((r, i) => ({
      id: `BI-${i + 1}`,
      patientName: r.patientName || `Patient ${i + 1}`,
      patientId: r.mrn || `MRN-${1000 + i}`,
      doctorName: r.assignedDoctorValue || r.doctor || "Dr. Unknown",
      specialty: r.specialty || "General",
      procedureName: r.procedureType || r.requestDetails || "Consultation",
      procedureDate: r.surgeryDate || r.createdAt || new Date().toISOString().split('T')[0],
      grossAmount: Math.round(Math.random() * 5000 + 1000),
      discount: Math.round(Math.random() * 500),
      netAmount: 0,
      patientShare: 0,
      insuranceShare: 0,
      agreedSplitAmount: 0,
      status: "pending",
      selected: false,
    }))
    .map(item => {
      const net = item.grossAmount - item.discount;
      const patientShare = Math.round(net * 0.1);
      const insuranceShare = net - patientShare;
      return { ...item, netAmount: net, patientShare, insuranceShare, agreedSplitAmount: insuranceShare };
    });
};

// Sample data for flagged items from finance
const sampleFlaggedItems: BillingItem[] = [
  {
    id: "FL-1", patientName: "Ahmed Ali", patientId: "MRN-2001", doctorName: "Dr. Khalid",
    specialty: "Orthopedics", procedureName: "Knee Replacement", procedureDate: "2026-01-15",
    grossAmount: 45000, discount: 2000, netAmount: 43000, patientShare: 4300,
    insuranceShare: 38700, agreedSplitAmount: 38700, status: "flagged",
    flagReason: "Amount exceeds agreed rate for this procedure", selected: false
  },
  {
    id: "FL-2", patientName: "Sara Mohammed", patientId: "MRN-2002", doctorName: "Dr. Fatima",
    specialty: "Cardiology", procedureName: "Cardiac Catheterization", procedureDate: "2026-01-20",
    grossAmount: 28000, discount: 0, netAmount: 28000, patientShare: 2800,
    insuranceShare: 25200, agreedSplitAmount: 25200, status: "flagged",
    flagReason: "Missing supporting documentation for this amount", selected: false
  }
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function HospitalBillingStatement({ requests = [] }: { requests?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [flaggedItems, setFlaggedItems] = useState<BillingItem[]>(sampleFlaggedItems);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectAll, setSelectAll] = useState(false);
  
  // Filters
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  
  // Archive filters
  const [archiveMonth, setArchiveMonth] = useState("all");
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const items = generateBillingItems(requests);
      if (items.length === 0) {
        // Generate sample data if no requests
        const sampleItems: BillingItem[] = Array.from({ length: 8 }, (_, i) => ({
          id: `BI-${i + 1}`,
          patientName: ["Ahmed Ali", "Sara Mohammed", "Khalid Hassan", "Fatima Omar", "Mohammed Saleh", "Noura Ahmad", "Ibrahim Youssef", "Layla Nasser"][i],
          patientId: `MRN-${2000 + i}`,
          doctorName: ["Dr. Khalid", "Dr. Fatima", "Dr. Ahmed", "Dr. Sara"][i % 4],
          specialty: ["Orthopedics", "Cardiology", "General Surgery", "Neurology"][i % 4],
          procedureName: ["Knee Replacement", "Cardiac Catheterization", "Appendectomy", "Spinal Fusion", "Hip Replacement", "Bypass Surgery", "Hernia Repair", "Brain Biopsy"][i],
          procedureDate: `2026-0${(i % 2) + 1}-${10 + i}`,
          grossAmount: [45000, 28000, 12000, 65000, 38000, 55000, 8000, 72000][i],
          discount: [2000, 0, 500, 3000, 1500, 2500, 0, 4000][i],
          netAmount: 0, patientShare: 0, insuranceShare: 0, agreedSplitAmount: 0,
          status: "pending", selected: false
        })).map(item => {
          const net = item.grossAmount - item.discount;
          const ps = Math.round(net * 0.1);
          return { ...item, netAmount: net, patientShare: ps, insuranceShare: net - ps, agreedSplitAmount: net - ps };
        });
        setBillingItems(sampleItems);
      } else {
        setBillingItems(items);
      }
    }
  }, [isOpen, requests]);

  const uniqueDoctors = [...new Set(billingItems.map(i => i.doctorName))];
  const uniqueSpecialties = [...new Set(billingItems.map(i => i.specialty))];

  const filteredItems = billingItems.filter(item => {
    const matchDoctor = filterDoctor === "all" || item.doctorName === filterDoctor;
    const matchSpecialty = filterSpecialty === "all" || item.specialty === filterSpecialty;
    const matchDate = !filterDate || item.procedureDate === filterDate;
    return matchDoctor && matchSpecialty && matchDate;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setBillingItems(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setBillingItems(prev => prev.map(item => item.id === id ? { ...item, selected: checked } : item));
  };

  const handleModifyAmount = (id: string, newAmount: number) => {
    setBillingItems(prev => prev.map(item => 
      item.id === id ? { ...item, agreedSplitAmount: newAmount } : item
    ));
  };

  const handleSubmitSelected = () => {
    const selected = billingItems.filter(i => i.selected);
    if (selected.length === 0) {
      toast({ title: "No items selected", variant: "destructive" });
      return;
    }
    const totalAmount = selected.reduce((s, i) => s + i.agreedSplitAmount, 0);
    const newStatement: Statement = {
      id: `STM-${Date.now()}`,
      month: selectedMonth,
      year: selectedYear,
      status: "submitted",
      totalAmount,
      itemCount: selected.length,
      submittedAt: new Date().toISOString(),
      items: selected.map(i => ({ ...i, status: "submitted" }))
    };
    setStatements(prev => [...prev, newStatement]);
    setBillingItems(prev => prev.filter(i => !i.selected));
    toast({ title: "Statement Submitted", description: `${selected.length} items submitted to Finance (SAR ${totalAmount.toLocaleString()})` });
  };

  const handleSubmitAll = () => {
    setBillingItems(prev => prev.map(i => ({ ...i, selected: true })));
    setTimeout(() => handleSubmitSelected(), 100);
  };

  const handleSubmitJustification = (id: string, justification: string) => {
    setFlaggedItems(prev => prev.map(item =>
      item.id === id ? { ...item, status: "justified", justification } : item
    ));
    toast({ title: "Justification Submitted", description: "Sent back to Finance for review" });
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      submitted: "bg-blue-100 text-blue-800",
      flagged: "bg-red-100 text-red-800",
      justified: "bg-orange-100 text-orange-800",
      agreed: "bg-green-100 text-green-800",
      pending_payment: "bg-purple-100 text-purple-800",
      paid: "bg-emerald-100 text-emerald-800",
    };
    return <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>{status.replace('_', ' ')}</Badge>;
  };

  // Paid statements for archive
  const archivedStatements = statements.filter(s => s.status === "paid" || s.status === "archived");
  const filteredArchive = archivedStatements.filter(s => archiveMonth === "all" || s.month === archiveMonth);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-100">
          <FileText className="w-4 h-4" />
          Financial Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Financial Statement Management
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate">Generate Statement</TabsTrigger>
            <TabsTrigger value="flagged" className="relative">
              Flagged Items
              {flaggedItems.filter(i => i.status === "flagged").length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                  {flaggedItems.filter(i => i.status === "flagged").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">Pending Payment</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          {/* Generate Statement Tab */}
          <TabsContent value="generate" className="flex-1 overflow-auto">
            <div className="space-y-4">
              {/* Month/Year selector */}
              <div className="flex gap-3 items-center">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Filters */}
              <div className="flex gap-3 items-center flex-wrap bg-gray-50 p-3 rounded-lg">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Doctor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {uniqueDoctors.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Specialty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {uniqueSpecialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-44" />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-between">
                <div className="flex gap-2">
                  <Button onClick={handleSubmitAll} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Send className="w-4 h-4 mr-2" />Submit All
                  </Button>
                  <Button onClick={handleSubmitSelected} variant="outline" disabled={!billingItems.some(i => i.selected)}>
                    <Send className="w-4 h-4 mr-2" />Submit Selected ({billingItems.filter(i => i.selected).length})
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Excel</Button>
                  <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />PDF</Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print</Button>
                </div>
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-auto max-h-[50vh]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-50">
                      <TableHead className="w-10">
                        <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                      </TableHead>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Procedure</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Gross (SAR)</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead className="text-right">Patient Share</TableHead>
                      <TableHead className="text-right">Insurance Share</TableHead>
                      <TableHead className="text-right">Agreed Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => (
                      <TableRow key={item.id} className={item.selected ? "bg-orange-50" : ""}>
                        <TableCell>
                          <Checkbox checked={item.selected} onCheckedChange={(c) => handleSelectItem(item.id, !!c)} />
                        </TableCell>
                        <TableCell className="font-medium">{item.patientName}</TableCell>
                        <TableCell>{item.patientId}</TableCell>
                        <TableCell>{item.doctorName}</TableCell>
                        <TableCell>{item.specialty}</TableCell>
                        <TableCell>{item.procedureName}</TableCell>
                        <TableCell>{item.procedureDate}</TableCell>
                        <TableCell className="text-right">{item.grossAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.discount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.netAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.patientShare.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.insuranceShare.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.agreedSplitAmount}
                            onChange={e => handleModifyAmount(item.id, Number(e.target.value))}
                            className="w-28 text-right"
                          />
                        </TableCell>
                        <TableCell>{statusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-sm text-gray-600 flex justify-between">
                <span>Total Items: {filteredItems.length}</span>
                <span className="font-bold">
                  Total Agreed Amount: SAR {filteredItems.reduce((s, i) => s + i.agreedSplitAmount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </TabsContent>

          {/* Flagged Items Tab */}
          <TabsContent value="flagged" className="flex-1 overflow-auto">
            <div className="space-y-4">
              <h3 className="font-semibold text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Items Flagged by Finance - Require Justification
              </h3>
              {flaggedItems.filter(i => i.status === "flagged").length === 0 ? (
                <p className="text-center text-gray-500 py-8">No flagged items requiring attention</p>
              ) : (
                flaggedItems.filter(i => i.status === "flagged").map(item => (
                  <FlaggedItemCard key={item.id} item={item} onSubmitJustification={handleSubmitJustification} />
                ))
              )}
              {flaggedItems.filter(i => i.status === "justified").length > 0 && (
                <>
                  <h4 className="font-semibold text-orange-700 mt-6">Justification Submitted - Awaiting Finance Review</h4>
                  {flaggedItems.filter(i => i.status === "justified").map(item => (
                    <div key={item.id} className="border rounded-lg p-4 bg-orange-50">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.patientName} - {item.procedureName}</p>
                          <p className="text-sm text-gray-600">{item.doctorName} | {item.specialty}</p>
                        </div>
                        {statusBadge("justified")}
                      </div>
                      <p className="text-sm mt-2 bg-white p-2 rounded"><strong>Your Justification:</strong> {item.justification}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          {/* Pending Payment Tab */}
          <TabsContent value="pending" className="flex-1 overflow-auto">
            <div className="space-y-4">
              <h3 className="font-semibold text-purple-700 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Payment - VAT Invoices Issued
              </h3>
              {statements.filter(s => s.status === "pending_payment" || s.status === "submitted").length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending payment statements</p>
                  <p className="text-xs text-gray-400 mt-1">Submitted statements will appear here after Finance agreement</p>
                </div>
              ) : (
                statements.filter(s => s.status !== "paid" && s.status !== "archived").map(s => (
                  <div key={s.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{s.month} {s.year}</p>
                        <p className="text-sm text-gray-600">{s.itemCount} items | SAR {s.totalAmount.toLocaleString()}</p>
                      </div>
                      {statusBadge(s.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive" className="flex-1 overflow-auto">
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Archive className="w-5 h-5" />Paid & Archived
                </h3>
                <Select value={archiveMonth} onValueChange={setArchiveMonth}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export All</Button>
              </div>
              {filteredArchive.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No archived statements</p>
              ) : (
                filteredArchive.map(s => (
                  <div key={s.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{s.month} {s.year}</p>
                        <p className="text-sm text-gray-600">{s.itemCount} items | SAR {s.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Submitted: {new Date(s.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        {statusBadge("paid")}
                        <Button variant="outline" size="sm"><Download className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Flagged Item Card Component
function FlaggedItemCard({ item, onSubmitJustification }: { item: BillingItem; onSubmitJustification: (id: string, text: string) => void }) {
  const [justification, setJustification] = useState("");
  const [editedAmount, setEditedAmount] = useState(item.agreedSplitAmount);

  return (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-red-900">{item.patientName} - {item.procedureName}</p>
          <p className="text-sm text-red-700">{item.doctorName} | {item.specialty} | {item.procedureDate}</p>
          <p className="text-sm mt-1">Amount: SAR {item.agreedSplitAmount.toLocaleString()}</p>
        </div>
        <Badge className="bg-red-200 text-red-800">Flagged</Badge>
      </div>
      <div className="bg-red-100 p-3 rounded">
        <p className="text-sm font-semibold text-red-800">Finance Reason:</p>
        <p className="text-sm">{item.flagReason}</p>
      </div>
      <div className="space-y-2">
        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium">Modified Amount (SAR):</label>
          <Input type="number" value={editedAmount} onChange={e => setEditedAmount(Number(e.target.value))} className="w-36" />
        </div>
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={3}
          placeholder="Write your justification..."
          value={justification}
          onChange={e => setJustification(e.target.value)}
        />
        <Button
          onClick={() => onSubmitJustification(item.id, justification)}
          disabled={!justification.trim()}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Send className="w-4 h-4 mr-2" />Submit Justification
        </Button>
      </div>
    </div>
  );
}
