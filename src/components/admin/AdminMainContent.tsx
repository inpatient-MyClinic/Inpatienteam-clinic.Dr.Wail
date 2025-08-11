
import React from "react";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import PaginatedAdminTable from "@/components/admin/PaginatedAdminTable";
import HospitalPrivilegesSearch from "@/components/admin/HospitalPrivilegesSearch";
import LeadTeamMonitoring from "@/components/admin/LeadTeamMonitoring";
import AdminGeneralReport from "@/components/admin/AdminGeneralReport";
import AIAssistant from "@/components/admin/AIAssistant";
import FinanceAnalyticsTable from "@/components/admin/analytics/FinanceAnalyticsTable";
import NewUserRequests from "@/components/admin/NewUserRequests";
import Footer from "@/components/Footer";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminMainContentProps {
  showAnalytics: boolean;
  showPrivilegesSearch: boolean;
  showTeamMonitoring: boolean;
  showGeneralReport: boolean;
  showAIAssistant: boolean;
  showFinanceAnalytics: boolean;
  showNewUserRequests: boolean;
  adminData: any[];
  filteredData: any[];
  selectedDates: Date[];
  selectedWeeks: string[];
  selectedMonths: string[];
  onShowGeneralReport: () => void;
  onShowFinanceAnalytics: () => void;
  onToggleNewUserRequests: () => void;
  onCloseFinanceAnalytics: () => void;
}

export default function AdminMainContent({
  showAnalytics,
  showPrivilegesSearch,
  showTeamMonitoring,
  showGeneralReport,
  showAIAssistant,
  showFinanceAnalytics,
  showNewUserRequests,
  adminData,
  filteredData,
  selectedDates,
  selectedWeeks,
  selectedMonths,
  onShowGeneralReport,
  onShowFinanceAnalytics,
  onToggleNewUserRequests,
  onCloseFinanceAnalytics,
}: AdminMainContentProps) {
  return (
    <>
      {/* New User Requests */}
      {showNewUserRequests && (
        <div className="mb-6">
          <NewUserRequests onClose={onToggleNewUserRequests} />
        </div>
      )}

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
        <div className="mb-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Finance Analytics</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseFinanceAnalytics}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
            data={filteredData}
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

      {/* Admin Requests Table with Pagination */}
      <PaginatedAdminTable data={filteredData} currentUserRole="admin" />

      {/* Footer */}
      <Footer />
    </>
  );
}
