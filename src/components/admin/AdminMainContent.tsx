
import React from "react";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import AdminTasksTable from "@/components/admin/AdminTasksTable";
import HospitalPrivilegesSearch from "@/components/admin/HospitalPrivilegesSearch";
import LeadTeamMonitoring from "@/components/admin/LeadTeamMonitoring";
import AdminGeneralReport from "@/components/admin/AdminGeneralReport";
import AIAssistant from "@/components/admin/AIAssistant";
import FinanceAnalyticsTable from "@/components/admin/analytics/FinanceAnalyticsTable";
import Footer from "@/components/Footer";

interface AdminMainContentProps {
  showAnalytics: boolean;
  showPrivilegesSearch: boolean;
  showTeamMonitoring: boolean;
  showGeneralReport: boolean;
  showAIAssistant: boolean;
  showFinanceAnalytics: boolean;
  adminData: any[];
  filteredData: any[];
  selectedDates: Date[];
  selectedWeeks: string[];
  selectedMonths: string[];
  onShowGeneralReport: () => void;
  onShowFinanceAnalytics: () => void;
}

export default function AdminMainContent({
  showAnalytics,
  showPrivilegesSearch,
  showTeamMonitoring,
  showGeneralReport,
  showAIAssistant,
  showFinanceAnalytics,
  adminData,
  filteredData,
  selectedDates,
  selectedWeeks,
  selectedMonths,
  onShowGeneralReport,
  onShowFinanceAnalytics,
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

      {/* Finance Analytics Section */}
      {showFinanceAnalytics && (
        <div className="mb-6">
          <FinanceAnalyticsTable 
            onDataChange={(data) => {
              // Save finance data to localStorage for SIA integration
              localStorage.setItem('siaFinanceData', JSON.stringify(data));
            }}
          />
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
      <AdminQuickActions 
        onShowGeneralReport={onShowGeneralReport}
        onShowFinanceAnalytics={onShowFinanceAnalytics}
      />

      {/* Admin Tasks Table */}
      <AdminTasksTable filteredData={filteredData} />

      {/* Footer */}
      <Footer />
    </>
  );
}
