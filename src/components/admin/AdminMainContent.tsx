
import React from "react";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import AdminTasksTable from "@/components/admin/AdminTasksTable";
import HospitalPrivilegesSearch from "@/components/admin/HospitalPrivilegesSearch";
import LeadTeamMonitoring from "@/components/admin/LeadTeamMonitoring";
import AdminGeneralReport from "@/components/admin/AdminGeneralReport";
import AIAssistant from "@/components/admin/AIAssistant";
import Footer from "@/components/Footer";

interface AdminMainContentProps {
  showAnalytics: boolean;
  showPrivilegesSearch: boolean;
  showTeamMonitoring: boolean;
  showGeneralReport: boolean;
  showAIAssistant: boolean;
  adminData: any[];
  filteredData: any[];
  selectedDates: Date[];
  selectedWeeks: string[];
  selectedMonths: string[];
  onShowGeneralReport: () => void;
}

export default function AdminMainContent({
  showAnalytics,
  showPrivilegesSearch,
  showTeamMonitoring,
  showGeneralReport,
  showAIAssistant,
  adminData,
  filteredData,
  selectedDates,
  selectedWeeks,
  selectedMonths,
  onShowGeneralReport,
}: AdminMainContentProps) {
  return (
    <>
      {/* New Features */}
      {showPrivilegesSearch && (
        <div className="mb-6">
          <HospitalPrivilegesSearch />
        </div>
      )}

      {showTeamMonitoring && (
        <div className="mb-6">
          <LeadTeamMonitoring />
        </div>
      )}

      {showGeneralReport && (
        <div className="mb-6">
          <AdminGeneralReport />
        </div>
      )}

      {showAIAssistant && (
        <div className="mb-6">
          <AIAssistant />
        </div>
      )}

      {/* Analytics Section */}
      {showAnalytics && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
          <AdminAnalytics 
            data={adminData}
            selectedDates={selectedDates}
            selectedWeeks={selectedWeeks}
            selectedMonths={selectedMonths}
          />
        </div>
      )}

      {/* Quick Actions */}
      <AdminQuickActions onShowGeneralReport={onShowGeneralReport} />

      {/* Admin Tasks Table */}
      <AdminTasksTable filteredData={filteredData} />

      {/* Footer */}
      <Footer />
    </>
  );
}
