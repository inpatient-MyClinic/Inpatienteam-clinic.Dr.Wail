
import React, { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { adminData } from "@/data/adminData";
import { filterAdminData } from "@/utils/adminFilters";
import { requestStorage } from "@/services/requestStorage";
import { dataIntegrationService } from "@/services/dataIntegrationService";
import { DataDebugger } from "@/components/admin/DataDebugger";
import RequestLifecycleChart from "@/components/RequestLifecycleChart";
import SIASlide from "@/components/admin/SIASlide";
import MonthlyAnalyticsDashboard from "@/components/admin/MonthlyAnalyticsDashboard";
import PivotTableUpload from "@/components/admin/PivotTableUpload";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [allRequestsData, setAllRequestsData] = useState<any[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [showMonthlyAnalytics, setShowMonthlyAnalytics] = useState(false);
  const [showPivotUpload, setShowPivotUpload] = useState(false);

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

  // Custom Excel upload handler
  const customHandleExcelUpload = (data: any[]) => {
    console.log('Admin Dashboard: Processing Excel upload with', data.length, 'rows');
    dataIntegrationService.processExcelData(data).then(result => {
      console.log('Excel processing result:', result);
      // Trigger data refresh
      const loadAllData = async () => {
        const analyticsData = dataIntegrationService.getAnalyticsData();
        console.log('Admin Dashboard - Excel upload complete, reloading data...');
        setAllRequestsData(analyticsData);
      };
      loadAllData();
    }).catch(error => {
      console.error('Excel upload error:', error);
    });
  };

  // Load request data from integrated data service
  useEffect(() => {
    requestStorage.initializeSampleData();
    
    const loadAllData = async () => {
      try {
        // Check if Excel data was imported
        const excelDataImported = localStorage.getItem('excel_data_imported') === 'true';
        const dataCleared = localStorage.getItem('sample_data_cleared') === 'true';
        
        console.log('Excel data imported:', excelDataImported);
        console.log('Sample data cleared:', dataCleared);
        
        // Get unified data from the integration service
        const analyticsData = dataIntegrationService.getAnalyticsData();
        
        console.log('Admin Dashboard - Unified analytics data:', analyticsData);
        
        if (analyticsData.length === 0) {
          console.log('No requests found in unified data');
          setAllRequestsData([]);
          return;
        }
        
        console.log(`Loading ${analyticsData.length} requests from unified service`);
        setAllRequestsData(analyticsData);
        
        // Sync to Supabase if we have data
        if (analyticsData.length > 0) {
          try {
            await dataIntegrationService.syncLocalStorageToSupabase();
          } catch (error) {
            console.warn('Supabase sync failed:', error);
          }
        }
        
      } catch (error) {
        console.error('Error loading unified data:', error);
        // Fallback to empty array
        setAllRequestsData([]);
      }
    };

    loadAllData();
    
    // Set up storage change listener and custom request update listener
    const handleStorageChange = () => loadAllData();
    const handleRequestsUpdate = () => {
      console.log('Admin Dashboard - Requests updated, reloading...');
      loadAllData();
    };
    const handleShowPivotUpload = () => setShowPivotUpload(true);
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('requestsUpdated', handleRequestsUpdate);
    window.addEventListener('adminDataCleared', handleRequestsUpdate);
    window.addEventListener('showPivotUpload', handleShowPivotUpload);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('requestsUpdated', handleRequestsUpdate);
      window.removeEventListener('adminDataCleared', handleRequestsUpdate);
      window.removeEventListener('showPivotUpload', handleShowPivotUpload);
    };
  }, []);

  console.log("AdminDashboard rendering, showAnalytics:", showAnalytics);
  console.log("All data length:", allRequestsData.length);

  // Clean case coordinator data: normalize "saud"/"Saud" and handle "No" entries
  const cleanedData = allRequestsData.map(item => ({
    ...item,
    caseCoordinator: item.caseCoordinator === "No" ? "Unassigned" : 
                     item.caseCoordinator === "saud" ? "Saud" : 
                     item.caseCoordinator || "Unassigned"
  }));

  // Filter data based on active filter and date filters
  const filteredData = filterAdminData(
    cleanedData, 
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

  if (showMonthlyAnalytics) {
    return (
      <MonthlyAnalyticsDashboard onClose={() => setShowMonthlyAnalytics(false)} />
    );
  }

  if (showPivotUpload) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              onClick={() => setShowPivotUpload(false)}
              variant="outline"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <PivotTableUpload 
            onPivotDataLoaded={(data) => {
              console.log('Pivot data loaded:', data.length, 'rows');
              setAllRequestsData([]);
            }} 
          />
        </div>
      </div>
    );
  }

  if (showSIASlide) {
    const dateOnlyFilteredForSIA = filterAdminData(
      cleanedData,
      null,
      selectedDates,
      selectedWeeks,
      selectedMonths
    );

    // Determine initial month/year for SIA from current filters
    const monthNameToNumber: Record<string, number> = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };

    let initialMonth: number | undefined;
    let initialYear: number | undefined;

    if (selectedDates.length > 0) {
      initialMonth = selectedDates[0].getMonth() + 1;
      initialYear = selectedDates[0].getFullYear();
    } else if (selectedMonths.length > 0) {
      const m = monthNameToNumber[selectedMonths[0]];
      if (m) {
        initialMonth = m;
        // Pick the most frequent year for that month from the available data
        const yearCounts: Record<number, number> = {};
        cleanedData.forEach((it) => {
          const raw = it.date || it.requestDate || it.dateCreated || it.created_at || it.createdAt;
          if (!raw) return;
          const d = new Date(typeof raw === 'string' ? raw : String(raw));
          if (isNaN(d.getTime())) return;
          if (d.getMonth() + 1 !== m) return;
          const y = d.getFullYear();
          yearCounts[y] = (yearCounts[y] || 0) + 1;
        });
        const top = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0];
        initialYear = top ? Number(top[0]) : new Date().getFullYear();
      }
    }

    return (
      <SIASlide 
        data={dateOnlyFilteredForSIA} 
        initialMonth={initialMonth}
        initialYear={initialYear}
        onClose={() => handleToggleSIASlide()} 
      />
    );
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <DataDebugger />
      </div>
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
      onExcelUpload={customHandleExcelUpload}
      onExport={handleExport}
      onPrint={handlePrint}
      onTogglePrivilegesSearch={handleTogglePrivilegesSearch}
      onToggleTeamMonitoring={handleToggleTeamMonitoring}
      onToggleAIAssistant={handleToggleAIAssistant}
      onToggleSIASlide={handleToggleSIASlide}
      onShowGeneralReport={handleShowGeneralReport}
      onShowChart={() => setShowChart(true)}
      onShowMonthlyAnalytics={() => setShowMonthlyAnalytics(true)}
      onShowFinanceAnalytics={handleShowFinanceAnalytics}
      onToggleNewUserRequests={handleToggleNewUserRequests}
      onCloseFinanceAnalytics={handleCloseFinanceAnalytics}
    />
    </div>
  );
}
