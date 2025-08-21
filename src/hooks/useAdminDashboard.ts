
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { requestStorage } from "@/services/requestStorage";
import { dataIntegrationService } from "@/services/dataIntegrationService";

export function useAdminDashboard() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPrivilegesSearch, setShowPrivilegesSearch] = useState(false);
  const [showTeamMonitoring, setShowTeamMonitoring] = useState(false);
  const [showGeneralReport, setShowGeneralReport] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSIASlide, setShowSIASlide] = useState(false);
  const [showFinanceAnalytics, setShowFinanceAnalytics] = useState(false);
  const [showNewUserRequests, setShowNewUserRequests] = useState(false);
  const { toast } = useToast();

  const handleStatusFilter = (status: string | null) => {
    setActiveFilter(activeFilter === status ? null : status);
  };

  const handleClearAllDateFilters = () => {
    setSelectedDates([]);
    setSelectedWeeks([]);
    setSelectedMonths([]);
  };

  const handleExcelUpload = async (rows: any[]) => {
    try {
      console.log(`Starting Excel upload with ${rows.length} rows...`);
      
      // Clear existing data first
      dataIntegrationService.clearAllData();
      
      // Process Excel data through the integration service
      const result = await dataIntegrationService.processExcelData(rows);
      
      console.log(`Excel processing result:`, result);
      
      if (result.errors.length > 0) {
        console.warn('Excel upload errors:', result.errors);
        toast({
          title: 'Excel Upload Completed with Errors',
          description: `${result.processed} records processed. ${result.errors.length} errors encountered.`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Excel Upload Successful',
          description: `${result.processed} records imported and saved successfully.`,
        });
      }

      // Mark as imported and notify listeners
      localStorage.setItem('excel_data_imported', 'true');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('requestsUpdated'));
      window.dispatchEvent(new CustomEvent('adminDataCleared'));

    } catch (err) {
      console.error('Excel import failed:', err);
      toast({ 
        title: 'Excel Upload Failed', 
        description: err instanceof Error ? err.message : 'Could not import data', 
        variant: 'destructive' 
      });
    }
  };

  const handleExport = () => {
    console.log("Exporting admin data to Excel");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleAnalytics = () => {
    console.log("Analytics toggle clicked, current state:", showAnalytics);
    setShowAnalytics(!showAnalytics);
  };

  const handleShowGeneralReport = () => {
    setShowGeneralReport(true);
  };

  const handleTogglePrivilegesSearch = () => {
    setShowPrivilegesSearch(!showPrivilegesSearch);
  };

  const handleToggleTeamMonitoring = () => {
    setShowTeamMonitoring(!showTeamMonitoring);
  };

  const handleToggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };

  const handleToggleSIASlide = () => {
    setShowSIASlide(!showSIASlide);
  };

  const handleShowFinanceAnalytics = () => {
    setShowFinanceAnalytics(true);
  };

  const handleCloseFinanceAnalytics = () => {
    setShowFinanceAnalytics(false);
  };

  const handleToggleNewUserRequests = () => {
    setShowNewUserRequests(!showNewUserRequests);
  };

  return {
    // State
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
    // Setters
    setSelectedDates,
    setSelectedWeeks,
    setSelectedMonths,
    // Handlers
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
  };
}
