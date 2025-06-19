
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExportButton from "@/components/ExportButton";
import NurseSidebar from "@/components/nurse/NurseSidebar";
import NurseFilters from "@/components/nurse/NurseFilters";
import NurseRequestsTable from "@/components/nurse/NurseRequestsTable";
import { useNurseRequests } from "@/hooks/useNurseRequests";
import { doctorsBySpecialty } from "@/data/medicalData";

export default function NurseDashboard() {
  const [filter, setFilter] = useState<string | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const navigate = useNavigate();
  
  const currentNurseName = "Nurse Sara";
  const { requests, filteredRequests, updateStatus } = useNurseRequests(currentNurseName);

  // Apply additional filters beyond the hook's filtering
  const applyFilters = (requests: typeof filteredRequests) => {
    return requests.filter(request => {
      const matchesSpecialty = specialtyFilter === "all" || request.specialty === specialtyFilter;
      const matchesDoctor = doctorFilter === "all" || request.assignedDoctorValue === doctorFilter;
      
      return matchesSpecialty && matchesDoctor;
    });
  };

  const finalFilteredRequests = applyFilters(filteredRequests);

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    filter || 
    specialtyFilter !== "all" || 
    doctorFilter !== "all"
  );

  const createNewRequest = () => {
    navigate("/create-request");
  };

  return (
    <div className="flex min-h-screen w-full">
      <NurseSidebar 
        currentNurseName={currentNurseName}
        filteredRequests={finalFilteredRequests}
        onCreateNewRequest={createNewRequest}
      />
      
      <main className="flex-1 bg-white p-6">
        {/* Export Button */}
        <div className="mb-4 flex justify-end">
          <ExportButton 
            requests={requests}
            filteredRequests={finalFilteredRequests}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <NurseFilters 
          filter={filter} 
          setFilter={setFilter}
          specialtyFilter={specialtyFilter}
          setSpecialtyFilter={setSpecialtyFilter}
          doctorFilter={doctorFilter}
          setDoctorFilter={setDoctorFilter}
        />
        
        <NurseRequestsTable 
          filteredRequests={finalFilteredRequests}
          updateStatus={updateStatus}
        />
      </main>
    </div>
  );
}
