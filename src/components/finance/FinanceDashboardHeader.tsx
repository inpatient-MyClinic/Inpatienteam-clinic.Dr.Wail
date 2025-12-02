
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import EnhancedExcelUpload from "@/components/finance/upload/EnhancedExcelUpload";
import BillingDialog from "@/components/finance/billing/BillingDialog";

interface FinanceDashboardHeaderProps {
  onExportToExcel: () => void;
  onPrint: () => void;
  onBulkUpdatePayments: (ids: string[]) => void;
  unreadCount: number;
}

export default function FinanceDashboardHeader({
  onExportToExcel,
  onPrint,
  onBulkUpdatePayments,
  unreadCount
}: FinanceDashboardHeaderProps) {
  return (
    <div className="flex gap-2">
      <MessagingIcons currentUserRole="finance" unreadCount={unreadCount} />
      <BillingDialog />
      <EnhancedExcelUpload onUpdatePayments={onBulkUpdatePayments} />
      <Button onClick={onExportToExcel} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export Excel
      </Button>
      <Button onClick={onPrint} variant="outline">
        <Printer className="w-4 h-4 mr-2" />
        Print
      </Button>
    </div>
  );
}
