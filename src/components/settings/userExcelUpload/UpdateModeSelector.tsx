
import React from "react";

interface UpdateModeSelectorProps {
  updateMode: 'replace' | 'append';
  onUpdateModeChange: (mode: 'replace' | 'append') => void;
}

export default function UpdateModeSelector({ updateMode, onUpdateModeChange }: UpdateModeSelectorProps) {
  return (
    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
      <h4 className="font-medium text-yellow-900 mb-2">Data Update Mode</h4>
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="updateMode"
            value="append"
            checked={updateMode === 'append'}
            onChange={(e) => onUpdateModeChange(e.target.value as 'append')}
            className="rounded"
          />
          <span className="text-sm text-yellow-700">Append Mode - Add new data to existing</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="updateMode"
            value="replace"
            checked={updateMode === 'replace'}
            onChange={(e) => onUpdateModeChange(e.target.value as 'replace')}
            className="rounded"
          />
          <span className="text-sm text-yellow-700">Replace Mode - Replace all existing data</span>
        </label>
      </div>
    </div>
  );
}
