
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
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

  const handleSaveChanges = () => {
    // This will trigger when users want to save payment status changes
    console.log("Saving finance changes to persistent storage");
  };

  return (
    <div className="p-6">
      {/* Save Changes Button */}
      <div className="mb-4 flex justify-end">
        <Button 
          onClick={handleSaveChanges}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

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
