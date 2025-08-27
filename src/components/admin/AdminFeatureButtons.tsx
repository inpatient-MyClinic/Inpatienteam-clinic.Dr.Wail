import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import NewUserRequests from "./NewUserRequests";

interface AdminFeatureButtonsProps {
  showPrivilegesSearch: boolean;
  showTeamMonitoring: boolean;
  showAIAssistant: boolean;
  showSIASlide: boolean;
  onTogglePrivilegesSearch: () => void;
  onToggleTeamMonitoring: () => void;
  onToggleAIAssistant: () => void;
  onToggleSIASlide: () => void;
  onShowChart: () => void;
  onShowMonthlyAnalytics: () => void;
  onShowPivotUpload?: () => void;
  onShowExcelInspector?: () => void;
}

export default function AdminFeatureButtons({
  showPrivilegesSearch,
  showTeamMonitoring,
  showAIAssistant,
  showSIASlide,
  onTogglePrivilegesSearch,
  onToggleTeamMonitoring,
  onToggleAIAssistant,
  onToggleSIASlide,
  onShowChart,
  onShowMonthlyAnalytics,
  onShowPivotUpload,
  onShowExcelInspector,
}: AdminFeatureButtonsProps) {
  const [showNewUserRequests, setShowNewUserRequests] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    updatePendingCount();
    // Poll for updates every 30 seconds
    const interval = setInterval(updatePendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const updatePendingCount = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('status', 'pending');
      
      if (error) {
        console.error('Error fetching pending users:', error);
        return;
      }
      
      setPendingCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={onTogglePrivilegesSearch}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPrivilegesSearch 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Hospital Privileges Search
        </button>
        <button
          onClick={onToggleTeamMonitoring}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showTeamMonitoring 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Team Monitoring
        </button>
        <button
          onClick={onToggleAIAssistant}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showAIAssistant 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          AI Analytics Assistant
        </button>
        <button
          onClick={() => setShowNewUserRequests(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 relative"
        >
          New User Requests
          {pendingCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
              {pendingCount}
            </Badge>
          )}
        </button>
        <button
          onClick={onToggleSIASlide}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showSIASlide 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          SIA
        </button>
        <button
          onClick={onShowChart}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          📊 Lifecycle Chart
        </button>
        <button
          onClick={onShowMonthlyAnalytics}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
        >
          📈 Monthly Analytics
        </button>
        {onShowPivotUpload && (
          <button
            onClick={onShowPivotUpload}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
          >
            📊 Excel Upload
          </button>
        )}
        {onShowExcelInspector && (
          <button
            onClick={onShowExcelInspector}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200"
          >
            📋 Data Inspector
          </button>
        )}
      </div>

      {showNewUserRequests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <NewUserRequests onClose={() => setShowNewUserRequests(false)} />
        </div>
      )}
    </>
  );
}