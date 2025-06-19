
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExportButton from "@/components/ExportButton";
import NurseSidebar from "@/components/nurse/NurseSidebar";
import NurseFilters from "@/components/nurse/NurseFilters";
import NurseRequestsTable from "@/components/nurse/NurseRequestsTable";
import { useNurseRequests } from "@/hooks/useNurseRequests";

export default function NurseDashboard() {
  const [filter, setFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const currentNurseName = "Nurse Sara";
  const { requests, filteredRequests, updateStatus } = useNurseRequests(currentNurseName);

  // Check if there are active filters
  const hasActiveFilters = Boolean(filter);

  const createNewRequest = () => {
    navigate("/create-request");
  };

  return (
    <div className="flex min-h-screen w-full">
      <NurseSidebar 
        currentNurseName={currentNurseName}
        filteredRequests={filteredRequests}
        onCreateNewRequest={createNewRequest}
      />
      
      <main className="flex-1 bg-white p-6">
        {/* Export Button */}
        <div className="mb-4 flex justify-end">
          <ExportButton 
            requests={requests}
            filteredRequests={filteredRequests}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <NurseFilters filter={filter} setFilter={setFilter} />
        
        <NurseRequestsTable 
          filteredRequests={filteredRequests}
          updateStatus={updateStatus}
        />
      </main>
    </div>
  );
}
