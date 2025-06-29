
import React from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
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
    handleStatusFilter,
    handleClearAllDateFilters,
    handleExcelUpload,
    handleExport,
    handlePrint,
    handleToggleAnalytics,
    handleShowGeneralReport,
    handleTogglePrivilegesSearch,
    handleToggleTeamMonitoring,
    handleToggleAIAssistant,
  } = useAdminDashboard();

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
    <AdminDashboardLayout
      activeFilter={activeFilter}
      selectedDates={selectedDates}
      selectedWeeks={selectedWeeks}
      selectedMonths={selectedMonths}
      showAnalytics={showAnalytics}
      showPrivilegesSearch={showPrivilegesSearch}
      showTeamMonitoring={showTeamMonitoring}
      showGeneralReport={showGeneralReport}
      showAIAssistant={showAIAssistant}
      adminData={adminData}
      filteredData={filteredData}
      unreadCount={unreadCount}
      onStatusFilter={handleStatusFilter}
      onToggleAnalytics={handleToggleAnalytics}
      onDateSelect={setSelectedDates}
      onWeekSelect={setSelectedWeeks}
      onMonthSelect={setSelectedMonths}
      onClearAllDateFilters={handleClearAllDateFilters}
      onExcelUpload={handleExcelUpload}
      onExport={handleExport}
      onPrint={handlePrint}
      onTogglePrivilegesSearch={handleTogglePrivilegesSearch}
      onToggleTeamMonitoring={handleToggleTeamMonitoring}
      onToggleAIAssistant={handleToggleAIAssistant}
      onShowGeneralReport={handleShowGeneralReport}
    />
  );
}
