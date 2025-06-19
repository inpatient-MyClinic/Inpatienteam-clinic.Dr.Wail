
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExportButton from "@/components/ExportButton";
import NurseSidebar from "@/components/nurse/NurseSidebar";
import NurseFilters from "@/components/nurse/NurseFilters";
import NurseRequestsTable from "@/components/nurse/NurseRequestsTable";
import DateRangeFilter from "@/components/DateRangeFilter";
import { useNurseRequests } from "@/hooks/useNurseRequests";
import { doctorsBySpecialty } from "@/data/medicalData";

export default function NurseDashboard() {
  const [filter, setFilter] = useState<string | null>(null);
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  
  // Date filtering states
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  
  const navigate = useNavigate();
  
  const currentNurseName = "Nurse Sara";
  const { requests, filteredRequests, updateStatus } = useNurseRequests(currentNurseName);

  // Apply additional filters beyond the hook's filtering
  const applyFilters = (requests: typeof filteredRequests) => {
    return requests.filter(request => {
      const matchesSpecialty = specialtyFilter === "all" || request.specialty === specialtyFilter;
      const matchesDoctor = doctorFilter === "all" || request.assignedDoctorValue === doctorFilter;
      
      // Date filtering logic
      const requestDate = new Date(request.createdAt);
      const matchesDate = selectedDates.length === 0 || selectedDates.some(date => 
        date.toDateString() === requestDate.toDateString()
      );
      
      // Week filtering (simplified - you can enhance this)
      const matchesWeek = selectedWeeks.length === 0 || selectedWeeks.some(week => {
        const weekNum = Math.ceil(requestDate.getDate() / 7);
        return week === `Week ${weekNum}`;
      });
      
      // Month filtering
      const matchesMonth = selectedMonths.length === 0 || selectedMonths.some(month => {
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"];
        return month === monthNames[requestDate.getMonth()];
      });
      
      return matchesSpecialty && matchesDoctor && matchesDate && matchesWeek && matchesMonth;
    });
  };

  const finalFilteredRequests = applyFilters(filteredRequests);

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    filter || 
    specialtyFilter !== "all" || 
    doctorFilter !== "all" ||
    selectedDates.length > 0 ||
    selectedWeeks.length > 0 ||
    selectedMonths.length > 0
  );

  const clearAllDateFilters = () => {
    setSelectedDates([]);
    setSelectedWeeks([]);
    setSelectedMonths([]);
  };

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
        {/* Date Range Filter */}
        <div className="mb-4">
          <DateRangeFilter
            selectedDates={selectedDates}
            selectedWeeks={selectedWeeks}
            selectedMonths={selectedMonths}
            onDateSelect={setSelectedDates}
            onWeekSelect={setSelectedWeeks}
            onMonthSelect={setSelectedMonths}
            onClearAll={clearAllDateFilters}
          />
        </div>

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

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
          Created by Dr. Wail Ahmed @ My Clinic
        </div>
      </main>
    </div>
  );
}
