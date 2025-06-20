
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ExportButton from "@/components/ExportButton";
import FinanceSidebar from "@/components/finance/FinanceSidebar";
import FinanceFilters from "@/components/finance/FinanceFilters";
import FinanceTable from "@/components/finance/FinanceTable";
import FinanceAnalytics from "@/components/finance/FinanceAnalytics";
import MessagingIcons from "@/components/messaging/MessagingIcons";

interface Transaction {
  id: string;
  patientName: string;
  mrn: string;
  hospital: string;
  doctor: string;
  service: string;
  amount: string;
  status: string;
  date: string;
}

export default function FinanceDashboard() {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");
  
  const navigate = useNavigate();
  const currentFinanceName = "Finance Department";

  // Sample transaction data with proper structure
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([
    { 
      id: "TXN001", 
      patientName: "Ahmed Hassan", 
      mrn: "MRN12345",
      hospital: "City Hospital",
      doctor: "Dr. Smith",
      service: "Surgery consultation",
      amount: "₹3,500", 
      status: "Paid", 
      date: "2025-06-20"
    },
    { 
      id: "TXN002", 
      patientName: "Sara Ali", 
      mrn: "MRN12346",
      hospital: "General Hospital",
      doctor: "Dr. Johnson",
      service: "Lab tests",
      amount: "₹2,200", 
      status: "Pending", 
      date: "2025-06-19"
    },
    { 
      id: "TXN003", 
      patientName: "Omar Khalil", 
      mrn: "MRN12347",
      hospital: "Medical Center",
      doctor: "Dr. Brown",
      service: "Emergency treatment",
      amount: "₹4,750", 
      status: "Paid", 
      date: "2025-06-19"
    },
    { 
      id: "TXN004", 
      patientName: "Fatima Nour", 
      mrn: "MRN12348",
      hospital: "City Hospital",
      doctor: "Dr. Davis",
      service: "Follow-up appointment",
      amount: "₹1,850", 
      status: "Pending", 
      date: "2025-06-18"
    },
    { 
      id: "TXN005", 
      patientName: "Mohammed Ali", 
      mrn: "MRN12349",
      hospital: "General Hospital",
      doctor: "Dr. Wilson",
      service: "Surgery procedure",
      amount: "₹6,200", 
      status: "Delay Payment", 
      date: "2025-06-15"
    },
  ]);

  // Apply filters
  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesStatus = !activeStatusFilter || transaction.status === activeStatusFilter;
    const matchesPatient = patientFilter === "all" || transaction.patientName.toLowerCase().includes(patientFilter);
    
    return matchesStatus && matchesPatient;
  });

  // Calculate status counts
  const statusCounts = {
    paid: allTransactions.filter(t => t.status === "Paid").length,
    pending: allTransactions.filter(t => t.status === "Pending").length,
    delayPayment: allTransactions.filter(t => t.status === "Delay Payment").length,
  };

  // Calculate analytics
  const paidTransactions = allTransactions.filter(t => t.status === "Paid");
  const notPaidTransactions = allTransactions.filter(t => t.status !== "Paid");
  
  const calculateTotal = (transactions: Transaction[]) => {
    return transactions.reduce((sum, t) => {
      const amount = parseFloat(t.amount.replace('₹', '').replace(',', ''));
      return sum + amount;
    }, 0);
  };

  const paidAmount = calculateTotal(paidTransactions);
  const unpaidAmount = calculateTotal(notPaidTransactions);
  const totalAmount = paidAmount + unpaidAmount;

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    activeStatusFilter ||
    dateFilter !== "all" ||
    amountFilter !== "all" ||
    patientFilter !== "all"
  );

  const handleStatusIconClick = (status: string | null) => {
    setActiveStatusFilter(activeStatusFilter === status ? null : status);
  };

  const handleClearAllFilters = () => {
    setActiveStatusFilter(null);
    setDateFilter("all");
    setAmountFilter("all");
    setPatientFilter("all");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUpdatePaymentStatus = (id: string, isPaid: boolean) => {
    setAllTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.id === id
          ? { ...transaction, status: isPaid ? "Paid" : "Pending" }
          : transaction
      )
    );
    console.log(`Updated transaction ${id} to ${isPaid ? 'Paid' : 'Not Paid'}`);
  };

  // Calculate unread messages for finance role
  const unreadCount = 7;

  return (
    <div className="flex min-h-screen w-full">
      <FinanceSidebar 
        currentFinanceName={currentFinanceName}
        statusCounts={statusCounts}
        activeStatusFilter={activeStatusFilter}
        onStatusIconClick={handleStatusIconClick}
        onClearAllFilters={handleClearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />
      
      <main className="flex-1 bg-white">
        <ScrollArea className="h-screen">
          <div className="p-6">
            {/* Header with Export, Print and Messaging */}
            <div className="mb-4 flex justify-end items-center gap-2">
              <MessagingIcons currentUserRole="finance" unreadCount={unreadCount} />
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <ExportButton 
                requests={allTransactions as any}
                filteredRequests={filteredTransactions as any}
                hasActiveFilters={hasActiveFilters}
              />
            </div>

            <FinanceFilters 
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              amountFilter={amountFilter}
              setAmountFilter={setAmountFilter}
              patientFilter={patientFilter}
              setPatientFilter={setPatientFilter}
              onExportToExcel={() => console.log('Export to Excel')}
              onPrint={handlePrint}
            />
            
            <FinanceTable 
              transactions={filteredTransactions}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />

            <FinanceAnalytics
              totalPaid={paidTransactions.length}
              totalNotPaid={notPaidTransactions.length}
              totalAmount={`₹${totalAmount.toLocaleString()}`}
              paidAmount={`₹${paidAmount.toLocaleString()}`}
              unpaidAmount={`₹${unpaidAmount.toLocaleString()}`}
            />

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
              Created by Dr. Wail Ahmed @ My Clinic
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
