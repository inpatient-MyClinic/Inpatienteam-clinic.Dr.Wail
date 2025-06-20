
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Printer,
  FileText,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import CaseCoordinatorSidebar from "@/components/CaseCoordinatorSidebar";
import CaseCoordinatorRequestsTable from "@/components/CaseCoordinatorRequestsTable";
import CaseCoordinatorAnalytics from "@/components/CaseCoordinatorAnalytics";
import CaseCoordinatorLossTree from "@/components/CaseCoordinatorLossTree";
import ExportButton from "@/components/ExportButton";
import NurseDateFilters from "@/components/nurse/NurseDateFilters";
import { useCaseCoordinatorRequests } from "@/hooks/useCaseCoordinatorRequests";
import { isWithinInterval, startOfDay, endOfDay, startOfMonth, endOfMonth, addDays } from "date-fns";

export default function CaseCoordinatorDashboard() {
  const navigate = useNavigate();
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

  const currentCoordinatorName = "Sarah Johnson";
  const { allRequests, coordinatorRequests, overdueRequests, updateStatus } = useCaseCoordinatorRequests(currentCoordinatorName);

  // Apply additional filters beyond the hook's filtering
  const applyFilters = (requests: typeof allRequests) => {
    return requests.filter(request => {
      // Status filter from sidebar
      const matchesStatus = !activeStatusFilter || request.status === activeStatusFilter;
      
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
      
      return matchesStatus && matchesDateFilter;
    });
  };

  const finalFilteredRequests = applyFilters(allRequests);
  const finalFilteredCoordinatorRequests = applyFilters(coordinatorRequests);

  // Calculate stats for sidebar - All Requests
  const allStats = [
    { label: "New Request", value: finalFilteredRequests.filter(req => req.status === "New Request").length, color: "bg-purple-600", key: "new_request" },
    { label: "Pending", value: finalFilteredRequests.filter(req => req.status === "Pending").length, color: "bg-yellow-600", key: "pending" },
    { label: "Under Process", value: finalFilteredRequests.filter(req => req.status === "Under Process").length, color: "bg-blue-600", key: "under_process" },
    { label: "Need Justification", value: finalFilteredRequests.filter(req => req.status === "Need Justification").length, color: "bg-orange-600", key: "need_justification" },
    { label: "Rejected", value: finalFilteredRequests.filter(req => req.status === "Rejected").length, color: "bg-red-600", key: "rejected" },
    { label: "Done", value: finalFilteredRequests.filter(req => req.status === "Done").length, color: "bg-green-600", key: "done" },
  ];

  // Calculate stats for sidebar - Coordinator Specific
  const coordinatorStats = [
    { label: "New Request", value: finalFilteredCoordinatorRequests.filter(req => req.status === "New Request").length, color: "bg-purple-600", key: "new_request_coord" },
    { label: "Pending", value: finalFilteredCoordinatorRequests.filter(req => req.status === "Pending").length, color: "bg-yellow-600", key: "pending_coord" },
    { label: "Under Process", value: finalFilteredCoordinatorRequests.filter(req => req.status === "Under Process").length, color: "bg-blue-600", key: "under_process_coord" },
    { label: "Need Justification", value: finalFilteredCoordinatorRequests.filter(req => req.status === "Need Justification").length, color: "bg-orange-600", key: "need_justification_coord" },
    { label: "Rejected", value: finalFilteredCoordinatorRequests.filter(req => req.status === "Rejected").length, color: "bg-red-600", key: "rejected_coord" },
    { label: "Done", value: finalFilteredCoordinatorRequests.filter(req => req.status === "Done").length, color: "bg-green-600", key: "done_coord" },
  ];

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    activeStatusFilter ||
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

  // Calculate unread messages for case-coordinator role
  const unreadCount = 5;

  return (
    <div className="flex min-h-screen w-full">
      <CaseCoordinatorSidebar 
        currentCoordinatorName={currentCoordinatorName}
        allStats={allStats}
        coordinatorStats={coordinatorStats}
        activeStatusFilter={activeStatusFilter}
        onStatusFilterClick={setActiveStatusFilter}
      />
      
      <main className="flex-1 bg-white">
        <ScrollArea className="h-screen">
          <div className="p-6">
            {/* Header with Export, Print, Messaging and Date Filters */}
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Management Dashboard</h2>
                <NurseDateFilters onDateFilterChange={handleDateFilterChange} />
              </div>
              <div className="flex gap-2">
                <MessagingIcons currentUserRole="case-coordinator" unreadCount={unreadCount} />
                <Button 
                  variant="outline" 
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <ExportButton 
                  requests={allRequests}
                  filteredRequests={finalFilteredRequests}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>
            
            {/* Requests Table */}
            <CaseCoordinatorRequestsTable 
              filteredRequests={finalFilteredRequests}
              updateStatus={updateStatus}
            />

            {/* Analytics */}
            <CaseCoordinatorAnalytics 
              coordinatorRequests={finalFilteredCoordinatorRequests}
              allRequests={finalFilteredRequests}
              overdueRequests={overdueRequests}
              currentCoordinatorName={currentCoordinatorName} 
            />

            {/* Loss Tree */}
            <CaseCoordinatorLossTree filteredRequests={finalFilteredRequests} />

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
