
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import DateRangeFilter from "@/components/DateRangeFilter";
import AdminExcelUpload from "@/components/admin/AdminExcelUpload";
import SystemDebugger from "@/components/admin/SystemDebugger";

interface AdminHeaderProps {
  selectedDates: Date[];
  selectedWeeks: string[];
  selectedMonths: string[];
  onDateSelect: (dates: Date[]) => void;
  onWeekSelect: (weeks: string[]) => void;
  onMonthSelect: (months: string[]) => void;
  onClearAllDateFilters: () => void;
  onExcelUpload: (data: any[]) => void;
  onExport: () => void;
  onPrint: () => void;
  unreadCount: number;
}

export default function AdminHeader({
  selectedDates,
  selectedWeeks,
  selectedMonths,
  onDateSelect,
  onWeekSelect,
  onMonthSelect,
  onClearAllDateFilters,
  onExcelUpload,
  onExport,
  onPrint,
  unreadCount
}: AdminHeaderProps) {
  return (
    <div className="flex flex-wrap gap-3 p-6 border-b bg-white justify-between">
      <div className="flex gap-4 items-center">
        <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
        
        {/* Date Range Filter */}
        <DateRangeFilter
          selectedDates={selectedDates}
          selectedWeeks={selectedWeeks}
          selectedMonths={selectedMonths}
          onDateSelect={onDateSelect}
          onWeekSelect={onWeekSelect}
          onMonthSelect={onMonthSelect}
          onClearAll={onClearAllDateFilters}
        />
      </div>

      <div className="flex gap-2">
        <MessagingIcons currentUserRole="admin" unreadCount={unreadCount} />
        <SystemDebugger />
        <AdminExcelUpload onUpload={onExcelUpload} />
        <Button onClick={onExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </Button>
        <Button onClick={onPrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>
    </div>
  );
}
