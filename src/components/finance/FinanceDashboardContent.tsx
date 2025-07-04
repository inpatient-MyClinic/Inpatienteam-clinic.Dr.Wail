
import React from "react";
import FinanceTable from "@/components/finance/FinanceTable";
import FinanceAnalytics from "@/components/finance/FinanceAnalytics";
import Footer from "@/components/Footer";
import { Transaction } from "@/types/finance";

interface FinanceDashboardContentProps {
  filteredTransactions: Transaction[];
  onUpdatePaymentStatus: (id: string, isPaid: boolean) => void;
}

export default function FinanceDashboardContent({
  filteredTransactions,
  onUpdatePaymentStatus
}: FinanceDashboardContentProps) {
  // Calculate analytics
  const totalPaid = filteredTransactions.filter(t => t.status === "Paid").length;
  const totalNotPaid = filteredTransactions.filter(t => t.status !== "Paid").length;
  const totalAmount = "₹35,500";
  const paidAmount = "₹15,000";
  const unpaidAmount = "₹20,500";

  return (
    <div className="p-6">
      {/* Transactions Table */}
      <FinanceTable
        transactions={filteredTransactions}
        onUpdatePaymentStatus={onUpdatePaymentStatus}
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
  );
}
