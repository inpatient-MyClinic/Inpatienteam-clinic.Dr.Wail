import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { LoginAttemptService } from "@/services/loginAttemptService";
import NewUserRequests from "./NewUserRequests";

interface AdminFeatureButtonsProps {
  showPrivilegesSearch: boolean;
  showTeamMonitoring: boolean;
  showAIAssistant: boolean;
  onTogglePrivilegesSearch: () => void;
  onToggleTeamMonitoring: () => void;
  onToggleAIAssistant: () => void;
}

export default function AdminFeatureButtons({
  showPrivilegesSearch,
  showTeamMonitoring,
  showAIAssistant,
  onTogglePrivilegesSearch,
  onToggleTeamMonitoring,
  onToggleAIAssistant,
}: AdminFeatureButtonsProps) {
  const [showNewUserRequests, setShowNewUserRequests] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    updatePendingCount();
    const handleNewAttempt = () => updatePendingCount();
    window.addEventListener('newLoginAttempt', handleNewAttempt);
    return () => window.removeEventListener('newLoginAttempt', handleNewAttempt);
  }, []);

  const updatePendingCount = () => {
    const pending = LoginAttemptService.getPendingAttempts();
    setPendingCount(pending.length);
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
      </div>

      {showNewUserRequests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <NewUserRequests onClose={() => setShowNewUserRequests(false)} />
        </div>
      )}
    </>
  );
}