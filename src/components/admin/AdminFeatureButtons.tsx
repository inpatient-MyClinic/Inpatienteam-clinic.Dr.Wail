
import React from "react";

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
  return (
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
    </div>
  );
}
