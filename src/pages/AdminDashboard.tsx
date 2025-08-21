
import React, { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useUnifiedData } from "@/hooks/useUnifiedData";
import { filterAdminData } from "@/utils/adminFilters";
import RequestLifecycleChart from "@/components/RequestLifecycleChart";
import SIASlide from "@/components/admin/SIASlide";
import MonthlyAnalyticsDashboard from "@/components/admin/MonthlyAnalyticsDashboard";
import PivotTableUpload from "@/components/admin/PivotTableUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Database, Users, FileText, DollarSign } from "lucide-react";

export default function AdminDashboard() {
  const [showChart, setShowChart] = useState(false);
  const [showMonthlyAnalytics, setShowMonthlyAnalytics] = useState(false);
  const [showPivotUpload, setShowPivotUpload] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Unified data management
  const {
    currentUser,
    allUsers,
    requests,
    analytics,
    isLoading,
    refreshData,
    importExcelData,
    getFinanceTransactions,
    canManageUsers,
    canViewFinance,
    canImportData
  } = useUnifiedData();

  // Local dashboard state
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

  // Load analytics data
  useEffect(() => {
    if (currentUser?.role === 'admin' && analytics) {
      setAnalyticsData(analytics);
    }
  }, [currentUser, analytics]);

  // Excel upload handler
  const handleExcelUpload = async (excelData: any[]) => {
    if (!canImportData) {
      return;
    }
    
    try {
      // Create basic column mappings for legacy data
      const columnMappings = {
        'Patient Name': 'patient_name',
        'Patient ID': 'patient_id', 
        'Specialty': 'specialty',
        'Hospital Code': 'hospital_code',
        'Hospital Name': 'hospital_name',
        'Status': 'status',
        'Date': 'request_date',
        'Paid Amount': 'paid_amount'
      };
      
      await importExcelData('admin-upload.xlsx', excelData, columnMappings);
      // Refresh data after import
      await refreshData();
    } catch (error) {
      console.error('Excel upload failed:', error);
    }
  };

  // Transform integrated requests to admin format for compatibility
  const adminFormattedData = requests.map(req => ({
    id: req.id,
    patientMRN: req.patient_id || "Unknown MRN",
    type: "OP", // Default to outpatient
    description: req.notes || "Medical Request",
    user: req.created_by || "Unknown",
    status: req.status || "Pending",
    date: req.request_date,
    specialty: req.specialty || "General",
    hospital: req.hospital_name || "Unknown Hospital",
    caseCoordinator: req.assigned_to || "Unassigned",
    requestDate: req.request_date,
    completionDate: req.status === "completed" ? new Date() : null,
    serviceDescription: req.notes || "Unknown Service",
    referredFrom: req.hospital_name || "Unknown",
    admissionType: "Unknown",
    clinicBranch: "Unknown"
  }));

  // Filter data based on active filter and date filters
  const filteredData = filterAdminData(
    adminFormattedData, 
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
            }} 
          />
        </div>
      </div>
    );
  }

  if (showSIASlide) {
    const dateOnlyFilteredForSIA = filterAdminData(
      adminFormattedData,
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
        adminFormattedData.forEach((it) => {
          const raw = it.date || it.requestDate;
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Initializing integrated data system...</p>
        </div>
      </div>
    );
  }

  // Show authentication required for non-admin users
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Administrator privileges required to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Current role: {currentUser?.role || 'Not authenticated'}
            </p>
          </CardContent>
        </Card>
      </div>
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
      adminData={adminFormattedData}
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
      onShowMonthlyAnalytics={() => setShowMonthlyAnalytics(true)}
      onShowFinanceAnalytics={handleShowFinanceAnalytics}
      onToggleNewUserRequests={handleToggleNewUserRequests}
      onCloseFinanceAnalytics={handleCloseFinanceAnalytics}
    />
  );
}
