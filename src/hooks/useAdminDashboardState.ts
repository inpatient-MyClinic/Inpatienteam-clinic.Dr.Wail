
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function useAdminDashboardState() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPrivilegesSearch, setShowPrivilegesSearch] = useState(false);
  const [showTeamMonitoring, setShowTeamMonitoring] = useState(false);
  const [showGeneralReport, setShowGeneralReport] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showFinanceAnalytics, setShowFinanceAnalytics] = useState(false);
  const { toast } = useToast();

  const handleStatusFilter = (status: string | null) => {
    setActiveFilter(activeFilter === status ? null : status);
  };

  const handleClearAllDateFilters = () => {
    setSelectedDates([]);
    setSelectedWeeks([]);
    setSelectedMonths([]);
  };

  const handleExcelUpload = (data: any[]) => {
    console.log("Processing Excel upload:", data);
    toast({
      title: "Excel Upload Successful",
      description: `${data.length} records processed and updated.`,
    });
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

  const handleShowFinanceAnalytics = () => {
    setShowFinanceAnalytics(true);
  };

  return {
    activeFilter,
    selectedDates,
    selectedWeeks,
    selectedMonths,
    showAnalytics,
    showPrivilegesSearch,
    showTeamMonitoring,
    showGeneralReport,
    showAIAssistant,
    showFinanceAnalytics,
    setSelectedDates,
    setSelectedWeeks,
    setSelectedMonths,
    setShowPrivilegesSearch,
    setShowTeamMonitoring,
    setShowAIAssistant,
    setShowFinanceAnalytics,
    handleStatusFilter,
    handleClearAllDateFilters,
    handleExcelUpload,
    handleExport,
    handlePrint,
    handleToggleAnalytics,
    handleShowGeneralReport,
    handleShowFinanceAnalytics,
  };
}
