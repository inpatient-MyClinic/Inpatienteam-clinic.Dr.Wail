
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFeatureToggles from "@/components/admin/AdminFeatureToggles";
import AdminMainContent from "@/components/admin/AdminMainContent";
import { useAdminDashboardState } from "@/hooks/useAdminDashboardState";
import { adminData } from "@/data/adminData";
import { filterAdminData } from "@/utils/adminFilters";

export default function AdminDashboard() {
  const {
    activeFilter,
    selectedDates,
    selectedWeeks,
    selectedMonths,
    showAnalytics,
    showPrivilegesSearch,
    showTeamMonitoring,
    showGeneralReport,
    showAIAssistant,
    setSelectedDates,
    setSelectedWeeks,
    setSelectedMonths,
    setShowPrivilegesSearch,
    setShowTeamMonitoring,
    setShowAIAssistant,
    handleStatusFilter,
    handleClearAllDateFilters,
    handleExcelUpload,
    handleExport,
    handlePrint,
    handleToggleAnalytics,
    handleShowGeneralReport,
  } = useAdminDashboardState();

  console.log("AdminDashboard rendering, showAnalytics:", showAnalytics);
  console.log("Admin data length:", adminData.length);

  // Filter data based on active filter and date filters
  const filteredData = filterAdminData(
    adminData, 
    activeFilter, 
    selectedDates, 
    selectedWeeks, 
    selectedMonths
  );

  // Calculate unread messages for admin role
  const unreadCount = 12;

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <AdminSidebar
        activeFilter={activeFilter}
        showAnalytics={showAnalytics}
        onStatusFilter={handleStatusFilter}
        onToggleAnalytics={handleToggleAnalytics}
      />

      <main className="flex-1 bg-white">
        <ScrollArea className="h-screen">
          {/* Header */}
          <AdminHeader
            selectedDates={selectedDates}
            selectedWeeks={selectedWeeks}
            selectedMonths={selectedMonths}
            onDateSelect={setSelectedDates}
            onWeekSelect={setSelectedWeeks}
            onMonthSelect={setSelectedMonths}
            onClearAllDateFilters={handleClearAllDateFilters}
            onExcelUpload={handleExcelUpload}
            onExport={handleExport}
            onPrint={handlePrint}
            unreadCount={unreadCount}
          />

          <div className="p-6">
            {/* Feature Toggle Buttons */}
            <AdminFeatureToggles
              showPrivilegesSearch={showPrivilegesSearch}
              showTeamMonitoring={showTeamMonitoring}
              showAIAssistant={showAIAssistant}
              onTogglePrivilegesSearch={() => setShowPrivilegesSearch(!showPrivilegesSearch)}
              onToggleTeamMonitoring={() => setShowTeamMonitoring(!showTeamMonitoring)}
              onToggleAIAssistant={() => setShowAIAssistant(!showAIAssistant)}
            />

            {/* Main Content */}
            <AdminMainContent
              showAnalytics={showAnalytics}
              showPrivilegesSearch={showPrivilegesSearch}
              showTeamMonitoring={showTeamMonitoring}
              showGeneralReport={showGeneralReport}
              showAIAssistant={showAIAssistant}
              adminData={adminData}
              filteredData={filteredData}
              selectedDates={selectedDates}
              selectedWeeks={selectedWeeks}
              selectedMonths={selectedMonths}
              onShowGeneralReport={handleShowGeneralReport}
            />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
