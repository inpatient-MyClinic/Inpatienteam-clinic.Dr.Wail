
import React, { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { adminData } from "@/data/adminData";
import { filterAdminData } from "@/utils/adminFilters";
import { requestStorage } from "@/services/requestStorage";
import RequestLifecycleChart from "@/components/RequestLifecycleChart";
import SIASlide from "@/components/admin/SIASlide";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [allRequestsData, setAllRequestsData] = useState<any[]>([]);
  const [showChart, setShowChart] = useState(false);

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
    showSIASlide,
    showFinanceAnalytics,
    showNewUserRequests,
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
    handleToggleSIASlide,
    handleShowFinanceAnalytics,
    handleCloseFinanceAnalytics,
    handleToggleNewUserRequests,
  } = useAdminDashboard();

  // Load request data from centralized storage
  useEffect(() => {
    requestStorage.initializeSampleData();
    
    const loadAllData = () => {
      // Check if data was cleared
      const dataCleared = localStorage.getItem('sample_data_cleared') === 'true';
      
      if (dataCleared) {
        // If data was cleared, show empty data
        setAllRequestsData([]);
        return;
      }
      
      const requests = requestStorage.getAllRequests();
      console.log('Admin Dashboard - All stored requests:', requests);
      
      // Convert requests to admin format
      const requestAdminData = requests.map(req => ({
        id: `REQ${req.id}`,
        type: "Medical Request",
        description: req.serviceDescription || "Medical Request",
        user: req.createdBy || "Unknown",
        status: req.status || "Pending",
        date: req.dateCreated || new Date().toISOString().split('T')[0],
        priority: "Medium",
        specialty: req.specialty || "General",
        hospital: req.hospitalName || req.referredToHospital || "Unknown Hospital",
        caseCoordinator: req.assignedCoordinator || "Unassigned",
        requestDate: new Date(req.dateCreated ? `${req.dateCreated}T${req.timeCreated || '00:00'}:00Z` : new Date()),
        completionDate: req.status === "Done" || req.status === "Completed" ? new Date() : null,
        serviceDescription: req.serviceDescription || "Unknown Service"
      }));
      
      // Show only uploaded Excel data (don't combine with sample adminData)
      setAllRequestsData(requestAdminData);
    };

    loadAllData();
    
    // Set up storage change listener and custom request update listener
    const handleStorageChange = () => loadAllData();
    const handleRequestsUpdate = () => {
      console.log('Admin Dashboard - Requests updated, reloading...');
      loadAllData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('requestsUpdated', handleRequestsUpdate);
    window.addEventListener('adminDataCleared', handleRequestsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('requestsUpdated', handleRequestsUpdate);
      window.removeEventListener('adminDataCleared', handleRequestsUpdate);
    };
  }, []);

  console.log("AdminDashboard rendering, showAnalytics:", showAnalytics);
  console.log("All data length:", allRequestsData.length);

  // Filter data based on active filter and date filters
  const filteredData = filterAdminData(
    allRequestsData, 
    activeFilter, 
    selectedDates, 
    selectedWeeks, 
    selectedMonths
  );

  // Calculate unread messages for admin role
  const unreadCount = 12;

  if (showChart) {
    return (
      <div className="min-h-screen">
        <div className="absolute top-4 left-4 z-10">
          <Button 
            onClick={() => setShowChart(false)}
            variant="outline"
            className="bg-white shadow-md"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <RequestLifecycleChart />
      </div>
    );
  }

  if (showSIASlide) {
    return (
      <SIASlide 
        data={allRequestsData} 
        onClose={() => handleToggleSIASlide()} 
      />
    );
  }

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
      showSIASlide={showSIASlide}
      showFinanceAnalytics={showFinanceAnalytics}
      showNewUserRequests={showNewUserRequests}
      adminData={allRequestsData}
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
      onToggleSIASlide={handleToggleSIASlide}
      onShowGeneralReport={handleShowGeneralReport}
      onShowChart={() => setShowChart(true)}
      onShowFinanceAnalytics={handleShowFinanceAnalytics}
      onToggleNewUserRequests={handleToggleNewUserRequests}
      onCloseFinanceAnalytics={handleCloseFinanceAnalytics}
    />
  );
}
