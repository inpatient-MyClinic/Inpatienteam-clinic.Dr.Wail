
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ExportButton from "@/components/ExportButton";
import FinanceSidebar from "@/components/finance/FinanceSidebar";
import FinanceFilters from "@/components/finance/FinanceFilters";
import FinanceTable from "@/components/finance/FinanceTable";
import MessagingIcons from "@/components/messaging/MessagingIcons";

export default function FinanceDashboard() {
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");
  
  const navigate = useNavigate();
  const currentFinanceName = "Finance Department";

  // Sample transaction data
  const allTransactions = [
    { id: "1", patient: "Ahmed Hassan", amount: "₹3,500", status: "Paid", date: "2025-06-20", description: "Surgery consultation" },
    { id: "2", patient: "Sara Ali", amount: "₹2,200", status: "Pending", date: "2025-06-19", description: "Lab tests" },
    { id: "3", patient: "Omar Khalil", amount: "₹4,750", status: "Paid", date: "2025-06-19", description: "Emergency treatment" },
    { id: "4", patient: "Fatima Nour", amount: "₹1,850", status: "Processing", date: "2025-06-18", description: "Follow-up appointment" },
    { id: "5", patient: "Mohammed Ali", amount: "₹6,200", status: "Overdue", date: "2025-06-15", description: "Surgery procedure" },
  ];

  // Apply filters
  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesStatus = !activeStatusFilter || transaction.status === activeStatusFilter;
    const matchesPatient = patientFilter === "all" || transaction.patient.toLowerCase().includes(patientFilter);
    
    // Add more filter logic as needed
    return matchesStatus && matchesPatient;
  });

  // Calculate status counts
  const statusCounts = {
    paid: allTransactions.filter(t => t.status === "Paid").length,
    pending: allTransactions.filter(t => t.status === "Pending").length,
    processing: allTransactions.filter(t => t.status === "Processing").length,
    overdue: allTransactions.filter(t => t.status === "Overdue").length,
  };

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

  const handleExportToExcel = () => {
    console.log('Export to Excel');
  };

  const handleViewTransaction = (id: string) => {
    console.log('View transaction:', id);
  };

  const handleEditTransaction = (id: string) => {
    console.log('Edit transaction:', id);
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
                requests={allTransactions}
                filteredRequests={filteredTransactions}
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
              onExportToExcel={handleExportToExcel}
              onPrint={handlePrint}
            />
            
            <FinanceTable 
              transactions={filteredTransactions}
              onViewTransaction={handleViewTransaction}
              onEditTransaction={handleEditTransaction}
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
