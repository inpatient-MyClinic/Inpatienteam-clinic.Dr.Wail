
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import ExportButton from "@/components/ExportButton";
import HospitalSidebar from "@/components/hospital/HospitalSidebar";
import HospitalFilters from "@/components/hospital/HospitalFilters";
import HospitalRequestsTable from "@/components/hospital/HospitalRequestsTable";
import HospitalAnalytics from "@/components/hospital/HospitalAnalytics";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import { useNurseRequests } from "@/hooks/useNurseRequests";
import { isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, addDays } from "date-fns";

export default function HospitalDashboard() {
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
  
  const currentHospitalName = "Princess Nourah Hospital";
  const { requests, filteredRequests, updateStatus } = useNurseRequests(currentHospitalName);

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

  // Calculate status counts for the sidebar
  const statusCounts = {
    pending: finalFilteredRequests.filter(req => req.status === "Pending").length,
    approved: finalFilteredRequests.filter(req => req.status === "Approved").length,
    rejected: finalFilteredRequests.filter(req => req.status === "Rejected").length,
    needJustification: finalFilteredRequests.filter(req => req.status === "Need Justification").length
  };

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    activeStatusFilter ||
    specialtyFilter !== "all" || 
    doctorFilter !== "all" ||
    dateFilters.selectedDays.length > 0 ||
    dateFilters.selectedWeeks.length > 0 ||
    dateFilters.selectedMonths.length > 0
  );

  const handleStatusIconClick = (status: string) => {
    setActiveStatusFilter(activeStatusFilter === status ? null : status);
  };

  const handleClearAllFilters = () => {
    setActiveStatusFilter(null);
    setSpecialtyFilter("all");
    setDoctorFilter("all");
    setDateFilters({
      selectedDays: [],
      selectedWeeks: [],
      selectedMonths: []
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex min-h-screen w-full">
      <HospitalSidebar 
        statusCounts={statusCounts}
        activeStatusFilter={activeStatusFilter}
        onStatusIconClick={handleStatusIconClick}
        onClearAllFilters={handleClearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />
      
      <main className="flex-1 bg-white p-6">
        {/* Header with Export, Print and Messaging */}
        <div className="mb-4 flex justify-end items-center gap-2">
          <MessagingIcons currentUserRole="hospital" />
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

        <HospitalFilters 
          requests={finalFilteredRequests}
          onFiltersChange={(filters) => {
            // Handle filter changes if needed
            console.log('Filters changed:', filters);
          }}
        />
        
        <HospitalRequestsTable 
          requests={finalFilteredRequests}
          onStatusChange={updateStatus}
        />

        {/* Analytics */}
        <HospitalAnalytics requests={filteredRequests} hospitalName={currentHospitalName} />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
          Created by Dr. Wail Ahmed @ My Clinic
        </div>
      </main>
    </div>
  );
}
