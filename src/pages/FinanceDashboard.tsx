
import React from "react";
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
import { useFinanceDashboard } from "@/hooks/useFinanceDashboard";

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const {
    filteredTransactions,
    statusCounts,
    dateFilter,
    setDateFilter,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    hospitalFilter,
    setHospitalFilter,
    doctorFilter,
    setDoctorFilter,
    activeStatusFilter,
    hasActiveFilters,
    handleStatusIconClick,
    handleClearAllFilters,
    handleUpdatePaymentStatus,
    handleBulkUpdatePayments,
    handleExportToExcel,
    handlePrint
  } = useFinanceDashboard();

  const currentFinanceName = "Finance Team";

  // Calculate analytics
  const totalPaid = filteredTransactions.filter(t => t.status === "Paid").length;
  const totalNotPaid = filteredTransactions.filter(t => t.status !== "Paid").length;
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
