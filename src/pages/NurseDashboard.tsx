
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import ExportButton from "@/components/ExportButton";
import NurseSidebar from "@/components/nurse/NurseSidebar";
import NurseFilters from "@/components/nurse/NurseFilters";
import NurseDateFilters from "@/components/nurse/NurseDateFilters";
import NurseRequestsTable from "@/components/nurse/NurseRequestsTable";
import NurseHospitalPrivileges from "@/components/nurse/NurseHospitalPrivileges";
import NurseAnalytics from "@/components/nurse/NurseAnalytics";
import { useNurseRequests } from "@/hooks/useNurseRequests";
import { doctorsBySpecialty } from "@/data/medicalData";
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from "date-fns";

export default function NurseDashboard() {
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [dateFilters, setDateFilters] = useState<{
    selectedDays: Date[];
    selectedWeeks: { month: Date; weekNumbers: number[] }[];
    selectedMonths: Date[];
  }>({
    selectedDays: [],
    selectedWeeks: [],
    selectedMonths: []
  });
  
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
      
      // Date filters
      const requestDate = new Date(request.createdAt);
      let matchesDateFilter = true;
      
      if (dateFilters.selectedDays.length > 0 || dateFilters.selectedWeeks.length > 0 || dateFilters.selectedMonths.length > 0) {
        matchesDateFilter = false;
        
        // Check selected days
        if (dateFilters.selectedDays.length > 0) {
          matchesDateFilter = dateFilters.selectedDays.some(day => 
            isWithinInterval(requestDate, {
              start: startOfDay(day),
              end: endOfDay(day)
            })
          );
        }
        
        // Check selected weeks
        if (!matchesDateFilter && dateFilters.selectedWeeks.length > 0) {
          matchesDateFilter = dateFilters.selectedWeeks.some(monthWeeks => 
            monthWeeks.weekNumbers.some(weekNumber => {
              const firstDayOfMonth = startOfMonth(monthWeeks.month);
              const weekStart = addDays(firstDayOfMonth, (weekNumber - 1) * 7);
              const weekEnd = addDays(weekStart, 6);
              
              return isWithinInterval(requestDate, {
                start: startOfDay(weekStart),
                end: endOfDay(weekEnd)
              });
            })
          );
        }
        
        // Check selected months
        if (!matchesDateFilter && dateFilters.selectedMonths.length > 0) {
          matchesDateFilter = dateFilters.selectedMonths.some(month => 
            isWithinInterval(requestDate, {
              start: startOfMonth(month),
              end: endOfMonth(month)
            })
          );
        }
      }
      
      return matchesSpecialty && matchesDoctor && matchesStatus && matchesDateFilter;
    });
  };

  const finalFilteredRequests = applyFilters(filteredRequests);

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    activeStatusFilter ||
    specialtyFilter !== "all" || 
    doctorFilter !== "all" ||
    dateFilters.selectedDays.length > 0 ||
    dateFilters.selectedWeeks.length > 0 ||
    dateFilters.selectedMonths.length > 0
  );

  const createNewRequest = () => {
    navigate("/create-request");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDateFilterChange = (filters: typeof dateFilters) => {
    setDateFilters(filters);
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
        {/* Header with Export, Print and Date Filters */}
        <div className="mb-4 flex justify-between items-start">
          <div>
            <NurseDateFilters onDateFilterChange={handleDateFilterChange} />
          </div>
          <div className="flex gap-2">
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
