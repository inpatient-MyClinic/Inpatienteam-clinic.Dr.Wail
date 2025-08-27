
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFeatureButtons from "@/components/admin/AdminFeatureButtons";
import AdminMainContent from "@/components/admin/AdminMainContent";
import PaginatedAdminTable from "@/components/admin/PaginatedAdminTable";

interface AdminDashboardLayoutProps {
  activeFilter: string | null;
  selectedDates: Date[];
  selectedWeeks: string[];
  selectedMonths: string[];
  showAnalytics: boolean;
  showPrivilegesSearch: boolean;
  showTeamMonitoring: boolean;
  showGeneralReport: boolean;
  showAIAssistant: boolean;
  showSIASlide: boolean;
  showFinanceAnalytics: boolean;
  showNewUserRequests: boolean;
  adminData: any[];
  filteredData: any[];
  unreadCount: number;
  onStatusFilter: (status: string | null) => void;
  onToggleAnalytics: () => void;
  onDateSelect: (dates: Date[]) => void;
  onWeekSelect: (weeks: string[]) => void;
  onMonthSelect: (months: string[]) => void;
  onClearAllDateFilters: () => void;
  onExcelUpload: (data: any[]) => void;
  onExport: () => void;
  onPrint: () => void;
  onTogglePrivilegesSearch: () => void;
  onToggleTeamMonitoring: () => void;
  onToggleAIAssistant: () => void;
  onToggleSIASlide: () => void;
  onShowGeneralReport: () => void;
  onShowChart: () => void;
  onShowMonthlyAnalytics: () => void;
  onShowFinanceAnalytics: () => void;
  onToggleNewUserRequests: () => void;
  onCloseFinanceAnalytics: () => void;
  onShowPivotUpload: () => void;
  onShowExcelInspector: () => void;
}

export default function AdminDashboardLayout({
  activeFilter,
  selectedDates,
  selectedWeeks,
  selectedMonths,
  showAnalytics,
  showPrivilegesSearch,
  showTeamMonitoring,
  showGeneralReport,
  showAIAssistant,
  showSIASlide,
  showFinanceAnalytics,
  showNewUserRequests,
  adminData,
  filteredData,
  unreadCount,
  onStatusFilter,
  onToggleAnalytics,
  onDateSelect,
  onWeekSelect,
  onMonthSelect,
  onClearAllDateFilters,
  onExcelUpload,
  onExport,
  onPrint,
  onTogglePrivilegesSearch,
  onToggleTeamMonitoring,
  onToggleAIAssistant,
  onToggleSIASlide,
  onShowGeneralReport,
  onShowChart,
  onShowMonthlyAnalytics,
  onShowFinanceAnalytics,
  onToggleNewUserRequests,
  onCloseFinanceAnalytics,
  onShowPivotUpload,
  onShowExcelInspector,
}: AdminDashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <AdminSidebar
        activeFilter={activeFilter}
        showAnalytics={showAnalytics}
        filteredData={filteredData}
        onStatusFilter={onStatusFilter}
        onToggleAnalytics={onToggleAnalytics}
      />

      <main className="flex-1 bg-white">
        <ScrollArea className="h-screen">
          {/* Header */}
          <AdminHeader
            selectedDates={selectedDates}
            selectedWeeks={selectedWeeks}
            selectedMonths={selectedMonths}
            onDateSelect={onDateSelect}
            onWeekSelect={onWeekSelect}
            onMonthSelect={onMonthSelect}
            onClearAllDateFilters={onClearAllDateFilters}
            onExcelUpload={onExcelUpload}
            onExport={onExport}
            onPrint={onPrint}
            unreadCount={unreadCount}
          />

          <div className="p-6">
            {/* Feature Toggle Buttons */}
            <AdminFeatureButtons
              showPrivilegesSearch={showPrivilegesSearch}
              showTeamMonitoring={showTeamMonitoring}
              showAIAssistant={showAIAssistant}
              showSIASlide={showSIASlide}
              onTogglePrivilegesSearch={onTogglePrivilegesSearch}
              onToggleTeamMonitoring={onToggleTeamMonitoring}
              onToggleAIAssistant={onToggleAIAssistant}
              onToggleSIASlide={onToggleSIASlide}
              onShowChart={onShowChart}
              onShowMonthlyAnalytics={onShowMonthlyAnalytics}
              onShowPivotUpload={onShowPivotUpload}
              onShowExcelInspector={onShowExcelInspector}
            />

            {/* Main Content */}
            <AdminMainContent
              showAnalytics={showAnalytics}
              showPrivilegesSearch={showPrivilegesSearch}
              showTeamMonitoring={showTeamMonitoring}
              showGeneralReport={showGeneralReport}
              showAIAssistant={showAIAssistant}
              showFinanceAnalytics={showFinanceAnalytics}
              showNewUserRequests={showNewUserRequests}
              adminData={adminData}
              filteredData={filteredData}
              selectedDates={selectedDates}
              selectedWeeks={selectedWeeks}
              selectedMonths={selectedMonths}
              onShowGeneralReport={onShowGeneralReport}
              onShowFinanceAnalytics={onShowFinanceAnalytics}
              onToggleNewUserRequests={onToggleNewUserRequests}
              onCloseFinanceAnalytics={onCloseFinanceAnalytics}
            />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
