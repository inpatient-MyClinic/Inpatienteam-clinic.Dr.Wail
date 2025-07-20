
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  
  // Add missing filter states for HospitalRequestsTable
  const [surgeryDateFilter, setSurgeryDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Add missing filter states for HospitalFilters
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  
  const navigate = useNavigate();
  
  // Get current user data from localStorage
  const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
  const currentHospitalName = currentUserData.hospitalName || "Default Hospital";
  console.log('Hospital Dashboard - Current hospital name:', currentHospitalName);
  
  const { requests, filteredRequests, updateStatus } = useNurseRequests(currentHospitalName);

  // Calculate unread messages for hospital role
  const unreadCount = 3; // This would typically come from a hook or API

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

  // Calculate analytics data
  const totalRequests = finalFilteredRequests.length;
  const doneRequests = finalFilteredRequests.filter(req => req.status === "Done").length;
  const approvedRequests = finalFilteredRequests.filter(req => req.status === "Approved").length;
  const rejectedRequests = finalFilteredRequests.filter(req => req.status === "Rejected").length;
  
  const conversionRate = totalRequests > 0 ? ((doneRequests / totalRequests) * 100).toFixed(1) : "0";
  const approvalRate = totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(1) : "0";
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : "0";

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

  const handleExportToExcel = () => {
    console.log('Export to Excel');
  };

  return (
    <div className="flex min-h-screen w-full">
      <HospitalSidebar 
        currentHospitalName={currentHospitalName}
        statusCounts={statusCounts}
        activeStatusFilter={activeStatusFilter}
        onStatusIconClick={handleStatusIconClick}
        onClearAllFilters={handleClearAllFilters}
        hasActiveFilters={hasActiveFilters}
      />
      
      <main className="flex-1 bg-white">
        <ScrollArea className="h-screen">
          <div className="p-6">
            {/* Header with Export, Print and Messaging */}
            <div className="mb-4 flex justify-end items-center gap-2">
              <MessagingIcons currentUserRole="hospital" unreadCount={unreadCount} />
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
              selectedDates={selectedDates}
              setSelectedDates={setSelectedDates}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedMonths={selectedMonths}
              setSelectedMonths={setSelectedMonths}
              onExportToExcel={handleExportToExcel}
              onPrint={handlePrint}
            />
            
            <HospitalRequestsTable 
              filteredRequests={finalFilteredRequests}
              totalRequests={requests.length}
              surgeryDateFilter={surgeryDateFilter}
              setSurgeryDateFilter={setSurgeryDateFilter}
              specialtyFilter={specialtyFilter === "all" ? "" : specialtyFilter}
              setSpecialtyFilter={(value) => setSpecialtyFilter(value || "all")}
              doctorFilter={doctorFilter === "all" ? "" : doctorFilter}
              setDoctorFilter={(value) => setDoctorFilter(value || "all")}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />

            {/* Analytics */}
            <HospitalAnalytics 
              conversionRate={conversionRate}
              approvalRate={approvalRate}
              rejectionRate={rejectionRate}
              doneRequests={doneRequests}
              totalRequests={totalRequests}
              approvedRequests={approvedRequests}
              rejectedRequests={rejectedRequests}
            />

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
              Created by Dr. Wail Ahmed @ My Clinic
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
