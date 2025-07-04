
import React, { useState, useEffect } from "react";
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
import EnhancedExcelUpload from "@/components/finance/upload/EnhancedExcelUpload";
import { useToast } from "@/hooks/use-toast";

// Sample financial data with serviceDescription instead of mrn
const initialTransactions = [
  {
    id: "FIN001",
    patientName: "Ahmed Mohammed",
    serviceDescription: "Cardiac Surgery Consultation",
    hospital: "King Abdulaziz Hospital",
    doctor: "Dr. Ahmed Al-Rashid",
    specialty: "Cardiology",
    amount: "₹15,000",
    status: "Paid",
    date: "2025-06-15"
  },
  {
    id: "FIN002", 
    patientName: "Fatima Hassan",
    serviceDescription: "Orthopedic Joint Replacement",
    hospital: "Prince Sultan Hospital",
    doctor: "Dr. Sarah Al-Mahmoud",
    specialty: "Orthopedics",
    amount: "₹8,500",
    status: "Pending",
    date: "2025-06-10"
  },
  {
    id: "FIN003",
    patientName: "Omar Ali",
    serviceDescription: "General Surgery Procedure",
    hospital: "Medical Center",
    doctor: "Dr. Mohammed Hassan",
    specialty: "General Surgery",
    amount: "₹12,000",
    status: "Delay Payment",
    date: "2025-06-08"
  }
];

// Function to save payment updates to global system (localStorage for demo)
const savePaymentUpdateToSystem = (transactionId: string, newStatus: string) => {
  try {
    const existingUpdates = JSON.parse(localStorage.getItem('systemPaymentUpdates') || '{}');
    existingUpdates[transactionId] = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: 'finance'
    };
    localStorage.setItem('systemPaymentUpdates', JSON.stringify(existingUpdates));
    console.log(`Payment status for ${transactionId} saved to system:`, newStatus);
  } catch (error) {
    console.error('Failed to save payment update to system:', error);
  }
};

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentFinanceName = "Finance Team";

  // Load system payment updates on component mount
  useEffect(() => {
    try {
      const systemUpdates = JSON.parse(localStorage.getItem('systemPaymentUpdates') || '{}');
      if (Object.keys(systemUpdates).length > 0) {
        setTransactions(prev => prev.map(transaction => {
          if (systemUpdates[transaction.id]) {
            return { ...transaction, status: systemUpdates[transaction.id].status };
          }
          return transaction;
        }));
        console.log('Loaded payment updates from system:', Object.keys(systemUpdates).length);
      }
    } catch (error) {
      console.error('Failed to load system payment updates:', error);
    }
  }, []);

  // Enhanced filtering logic
  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = !activeStatusFilter || transaction.status === activeStatusFilter;
    const matchesStatusFilter = statusFilter === "all" || transaction.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === "all" || 
      (paymentStatusFilter === "paid" && transaction.status === "Paid") ||
      (paymentStatusFilter === "not-paid" && transaction.status !== "Paid");
    const matchesHospital = hospitalFilter === "all" || 
      transaction.hospital.toLowerCase().includes(hospitalFilter.toLowerCase());
    const matchesDoctor = doctorFilter === "all" || 
      transaction.doctor.toLowerCase().includes(doctorFilter.toLowerCase());
    
    return matchesStatus && matchesStatusFilter && matchesPaymentStatus && matchesHospital && matchesDoctor;
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
    statusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    hospitalFilter !== "all" ||
    doctorFilter !== "all"
  );

  const handleStatusIconClick = (status: string | null) => {
    setActiveStatusFilter(status);
  };

  const handleClearAllFilters = () => {
    setActiveStatusFilter(null);
    setDateFilter("all");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setHospitalFilter("all");
    setDoctorFilter("all");
  };

  const handleUpdatePaymentStatus = (id: string, isPaid: boolean) => {
    const newStatus = isPaid ? "Paid" : "Pending";
    
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id 
          ? { ...transaction, status: newStatus }
          : transaction
      )
    );
    
    // Save to global system
    savePaymentUpdateToSystem(id, newStatus);
    
    toast({
      title: isPaid ? "Payment Confirmed" : "Payment Status Updated",
      description: `Transaction ${id} has been marked as ${newStatus} and updated system-wide`,
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
    
    // Save all updates to global system
    ids.forEach(id => savePaymentUpdateToSystem(id, "Paid"));
    
    toast({
      title: "Bulk Update Completed",
      description: `${ids.length} transactions updated from Excel upload and reflected system-wide`,
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
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                paymentStatusFilter={paymentStatusFilter}
                setPaymentStatusFilter={setPaymentStatusFilter}
                hospitalFilter={hospitalFilter}
                setHospitalFilter={setHospitalFilter}
                doctorFilter={doctorFilter}
                setDoctorFilter={setDoctorFilter}
                onExportToExcel={handleExportToExcel}
                onPrint={handlePrint}
                onBulkUpdatePayments={handleBulkUpdatePayments}
              />
            </div>

            <div className="flex gap-2">
              <MessagingIcons currentUserRole="finance" unreadCount={unreadCount} />
              <EnhancedExcelUpload onUpdatePayments={handleBulkUpdatePayments} />
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
