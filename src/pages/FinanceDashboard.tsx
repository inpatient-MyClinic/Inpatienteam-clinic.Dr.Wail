
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import FinanceSidebar from "@/components/finance/FinanceSidebar";
import FinanceFilters from "@/components/finance/FinanceFilters";
import FinanceDashboardHeader from "@/components/finance/FinanceDashboardHeader";
import FinanceDashboardContent from "@/components/finance/FinanceDashboardContent";
import { useFinanceDashboard } from "@/hooks/useFinanceDashboard";

export default function FinanceDashboard() {
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

            <FinanceDashboardHeader
              onExportToExcel={handleExportToExcel}
              onPrint={handlePrint}
              onBulkUpdatePayments={handleBulkUpdatePayments}
              unreadCount={unreadCount}
            />
          </div>

          <FinanceDashboardContent
            filteredTransactions={filteredTransactions}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
          />
        </ScrollArea>
      </main>
    </div>
  );
}
