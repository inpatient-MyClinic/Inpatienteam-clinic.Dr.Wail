
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { requestStorage } from "@/services/requestStorage";

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

  const handleExcelUpload = (rows: any[]) => {
    try {
      // 1) Clear existing stored requests only (preserve other app data)
      requestStorage.clearAllData();

      // 2) Date normalizer: supports Excel serials, dd/mm/yyyy, mm/dd/yyyy, yyyy-mm-dd, etc.
      const toISO = (val: any): string | undefined => {
        if (val === undefined || val === null || val === '') return undefined;
        // Excel serial number
        if (typeof val === 'number' && val > 25000) {
          const d = new Date((val - 25569) * 86400 * 1000);
          return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
        }
        if (typeof val === 'string') {
          const s = val.trim();
          if (!s) return undefined;
          const n = Number(s);
          if (!isNaN(n) && n > 25000) {
            const d = new Date((n - 25569) * 86400 * 1000);
            return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
          }
          // Try common patterns
          const parts = s.split(/[\/.\-]/).map(p => p.trim());
          if (parts.length === 3) {
            // Heuristic: if first part > 12, treat as DD/MM/YYYY; if middle > 12, treat as YYYY/MM/DD
            let y: number, m: number, d: number;
            const [a, b, c] = parts.map(p => Number(p));
            if (s.includes('-') && a > 31) {
              // YYYY-MM-DD
              y = a; m = b; d = c;
            } else if (a > 12) {
              // DD/MM/YYYY
              d = a; m = b; y = c;
            } else if (b > 12) {
              // MM/DD/YYYY
              m = a; d = b; y = c;
            } else {
              // Fallback try Date
              const tryD = new Date(s);
              return isNaN(tryD.getTime()) ? undefined : tryD.toISOString().slice(0, 10);
            }
            const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
            return isNaN(dt.getTime()) ? undefined : dt.toISOString().slice(0, 10);
          }
          const d2 = new Date(s);
          return isNaN(d2.getTime()) ? undefined : d2.toISOString().slice(0, 10);
        }
        const d = new Date(val);
        return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
      };

      let imported = 0;
      rows.forEach((row) => {
        const record: any = {
          // Dates
          dateCreated: toISO(row['Request Creation Date'] ?? row['Date of Request:'] ?? row['Date'] ?? row['Created At']) || new Date().toISOString().slice(0, 10),
          timeCreated: (row['Time'] || row['timeCreated'] || '').toString().slice(0,5) || new Date().toTimeString().slice(0,5),

          // Patient
          patientName: row['Patient Name'] ?? row["Patient's Name:"] ?? 'Unknown',
          patientNationalId: String(row['Patient National ID'] ?? row["Patient's National ID:"] ?? ''),
          patientMobileNo: String(row['Patient Mobile No'] ?? row["Patient's Mobile No.:"] ?? ''),
          patientMRN: row['Patient MRN'] ?? row["Patient's MRN:"] ?? row['Hospital MRN'] ?? '',

          // Hospital
          hospitalMRN: row['Hospital MRN'] ?? row["Hospital File Number"] ?? '',
          hospitalName: row['Hospital Name'] ?? row['Referred Hospital'] ?? '',
          clinicBranch: row['My Clinic Branch'] ?? row['MC Branch'] ?? row['Clinic Branch'] ?? '',

          // Medical
          specialty: row['Specialty'] ?? '',
          doctorName: row['Doctor Name'] ?? row["Treating Doctor's Name"] ?? '',
          serviceDescription: row['Service Description'] ?? row['Service Description of referred service'] ?? '',

          // Scheduling
          expectedSurgeryDate: toISO(row['Expected Surgery Date'] ?? row['Expected date of Surgery']) || '',
          admissionType: row['Admission Type'] ?? row['Type of Admission'] ?? 'Elective',

          // Case Mgmt
          caseManager: row['Case Coordinator'] ?? row['Case Manager'] ?? '',

          // Status
          operationStatus: row['Hospital Status'] ?? row['Status of operation'] ?? row['Request Status'] ?? '',
          status: row['Request Status'] ?? row['Status of operation'] ?? row['Hospital Status'] ?? 'Pending',

          // Notes
          history: row['Coordinator Notes'] ?? 'Imported from Excel',
          notes: row['Hospital Notes'] ?? '',
        };

        try {
          requestStorage.saveRequest(record as any, 'Excel Upload');
          imported++;
        } catch (e) {
          console.error('Failed to save row', row, e);
        }
      });

      localStorage.setItem('excel_data_imported', 'true');
      // Notify listeners
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('requestsUpdated'));
      window.dispatchEvent(new CustomEvent('adminDataCleared'));

      toast({
        title: 'Excel Upload Successful',
        description: `${imported} records imported and saved.`,
      });
    } catch (err) {
      console.error('Excel import failed:', err);
      toast({ title: 'Excel Upload Failed', description: 'Could not import data', variant: 'destructive' });
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
