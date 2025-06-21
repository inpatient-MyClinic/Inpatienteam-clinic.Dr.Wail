
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import FinanceSidebar from "@/components/finance/FinanceSidebar";
import FinanceFilters from "@/components/finance/FinanceFilters";
import FinanceTable from "@/components/finance/FinanceTable";
import FinanceAnalytics from "@/components/finance/FinanceAnalytics";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

// Sample financial data
const initialTransactions = [
  {
    id: "FIN001",
    patientName: "Ahmed Mohammed",
    mrn: "MRN001234",
    hospital: "King Abdulaziz Hospital",
    doctor: "Dr. Ahmed Al-Rashid",
    service: "Cardiac Surgery",
    amount: "₹15,000",
    status: "Paid",
    date: "2025-06-15"
  },
  {
    id: "FIN002", 
    patientName: "Fatima Hassan",
    mrn: "MRN005678",
    hospital: "Prince Sultan Hospital",
    doctor: "Dr. Sarah Al-Mahmoud",
    service: "Orthopedic Surgery",
    amount: "₹8,500",
    status: "Pending",
    date: "2025-06-10"
  },
  {
    id: "FIN003",
    patientName: "Omar Ali",
    mrn: "MRN009876", 
    hospital: "Medical Center",
    doctor: "Dr. Mohammed Hassan",
    service: "General Surgery",
    amount: "₹12,000",
    status: "Delay Payment",
    date: "2025-06-08"
  }
];

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentFinanceName = "Finance Team";

  // Filter transactions based on current filters including status
  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = !activeStatusFilter || transaction.status === activeStatusFilter;
    const matchesPatient = patientFilter === "all" || 
      transaction.patientName.toLowerCase().includes(patientFilter.toLowerCase());
    
    // Add date and amount filtering logic here if needed
    
    return matchesStatus && matchesPatient;
  });

  // Calculate status counts
  const statusCounts = {
    paid: transactions.filter(t => t.status === "Paid").length,
    pending: transactions.filter(t => t.status === "Pending").length,
    delayPayment: transactions.filter(t => t.status === "Delay Payment").length
  };

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    activeStatusFilter ||
    dateFilter !== "all" ||
    amountFilter !== "all" ||
    patientFilter !== "all"
  );

  const handleStatusIconClick = (status: string | null) => {
    setActiveStatusFilter(status);
  };

  const handleClearAllFilters = () => {
    setActiveStatusFilter(null);
    setDateFilter("all");
    setAmountFilter("all");
    setPatientFilter("all");
  };

  const handleUpdatePaymentStatus = (id: string, isPaid: boolean) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id 
          ? { ...transaction, status: isPaid ? "Paid" : "Pending" }
          : transaction
      )
    );
    
    toast({
      title: isPaid ? "Payment Confirmed" : "Payment Status Updated",
      description: `Transaction ${id} has been marked as ${isPaid ? "paid" : "pending"}`,
    });
  };

  const handleBulkUpdatePayments = (ids: string[]) => {
    setTransactions(prev =>
      prev.map(transaction =>
        ids.includes(transaction.id)
          ? { ...transaction, status: "Paid" }
          : transaction
      )
    );
    
    toast({
      title: "Bulk Update Completed",
      description: `${ids.length} transactions updated from Excel upload`,
    });
  };

  const handleExportToExcel = () => {
    console.log("Exporting finance data to Excel");
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate analytics
  const totalPaid = transactions.filter(t => t.status === "Paid").length;
  const totalNotPaid = transactions.filter(t => t.status !== "Paid").length;
  const totalAmount = "₹35,500";
  const paidAmount = "₹15,000";
  const unpaidAmount = "₹20,500";

  const unreadCount = 3;

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
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 p-6 border-b bg-white justify-between">
            <div>
              <FinanceFilters
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                amountFilter={amountFilter}
                setAmountFilter={setAmountFilter}
                patientFilter={patientFilter}
                setPatientFilter={setPatientFilter}
                onExportToExcel={handleExportToExcel}
                onPrint={handlePrint}
                onBulkUpdatePayments={handleBulkUpdatePayments}
              />
            </div>

            <div className="flex gap-2">
              <MessagingIcons currentUserRole="finance" unreadCount={unreadCount} />
              <Button onClick={handleExportToExcel} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <div className="p-6">
            {/* Transactions Table */}
            <FinanceTable
              transactions={filteredTransactions}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
            />

            {/* Analytics */}
            <FinanceAnalytics
              totalPaid={totalPaid}
              totalNotPaid={totalNotPaid}
              totalAmount={totalAmount}
              paidAmount={paidAmount}
              unpaidAmount={unpaidAmount}
            />

            {/* Footer */}
            <Footer />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
