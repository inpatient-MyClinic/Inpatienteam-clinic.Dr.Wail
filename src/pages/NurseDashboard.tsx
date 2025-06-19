
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import ExportButton from "@/components/ExportButton";
import NurseSidebar from "@/components/nurse/NurseSidebar";
import NurseFilters from "@/components/nurse/NurseFilters";
import NurseRequestsTable from "@/components/nurse/NurseRequestsTable";
import NurseHospitalPrivileges from "@/components/nurse/NurseHospitalPrivileges";
import NurseAnalytics from "@/components/nurse/NurseAnalytics";
import { useNurseRequests } from "@/hooks/useNurseRequests";
import { doctorsBySpecialty } from "@/data/medicalData";

export default function NurseDashboard() {
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  const currentNurseName = "Nurse Sara";
  const { requests, filteredRequests, updateStatus } = useNurseRequests(currentNurseName);

  // Apply additional filters beyond the hook's filtering
  const applyFilters = (requests: typeof filteredRequests) => {
    return requests.filter(request => {
      const matchesSpecialty = specialtyFilter === "all" || request.specialty === specialtyFilter;
      const matchesDoctor = doctorFilter === "all" || request.assignedDoctorValue === doctorFilter;
      
      // Status filter from sidebar
      const matchesStatus = !activeStatusFilter || 
        (activeStatusFilter === 'delayed' ? request.isDelayed : request.status === activeStatusFilter);
      
      return matchesSpecialty && matchesDoctor && matchesStatus;
    });
  };

  const finalFilteredRequests = applyFilters(filteredRequests);

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    activeStatusFilter ||
    specialtyFilter !== "all" || 
    doctorFilter !== "all"
  );

  const createNewRequest = () => {
    navigate("/create-request");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen w-full">
      <NurseSidebar 
        currentNurseName={currentNurseName}
        filteredRequests={finalFilteredRequests}
        onCreateNewRequest={createNewRequest}
        activeStatusFilter={activeStatusFilter}
        onStatusFilterClick={setActiveStatusFilter}
      />
      
      <main className="flex-1 bg-white p-6">
        {/* Export and Print Buttons */}
        <div className="mb-4 flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <ExportButton 
            requests={requests}
            filteredRequests={finalFilteredRequests}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <NurseFilters 
          specialtyFilter={specialtyFilter}
          setSpecialtyFilter={setSpecialtyFilter}
          doctorFilter={doctorFilter}
          setDoctorFilter={setDoctorFilter}
        />
        
        <NurseRequestsTable 
          filteredRequests={finalFilteredRequests}
          updateStatus={updateStatus}
        />

        {/* Hospital Privileges */}
        <NurseHospitalPrivileges />

        {/* Analytics */}
        <NurseAnalytics filteredRequests={filteredRequests} currentNurseName={currentNurseName} />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
          Created by Dr. Wail Ahmed @ My Clinic
        </div>
      </main>
    </div>
  );
}
