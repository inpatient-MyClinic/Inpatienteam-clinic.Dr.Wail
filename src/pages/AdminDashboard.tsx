
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import AdminTasksTable from "@/components/admin/AdminTasksTable";
import Footer from "@/components/Footer";

// Sample admin data with additional fields for analytics
const adminData = [
  {
    id: "ADM001",
    type: "User Management",
    description: "New doctor registration",
    user: "Dr. Ahmed Salem",
    status: "Pending",
    date: "2025-06-20",
    priority: "High",
    specialty: "Cardiology",
    hospital: "King Abdulaziz Hospital",
    caseCoordinator: "Sarah Al-Mahmoud",
    requestDate: new Date("2025-06-18"),
    completionDate: null
  },
  {
    id: "ADM002",
    type: "System Settings",
    description: "Hospital privilege update",
    user: "Admin",
    status: "Completed",
    date: "2025-06-19",
    priority: "Medium",
    specialty: "Orthopedics",
    hospital: "Prince Sultan Hospital",
    caseCoordinator: "Ahmed Hassan",
    requestDate: new Date("2025-06-17"),
    completionDate: new Date("2025-06-19")
  },
  {
    id: "ADM003",
    type: "Reports",
    description: "Monthly analytics report",
    user: "Finance Team",
    status: "In Progress",
    date: "2025-06-18",
    priority: "Low",
    specialty: "General Surgery",
    hospital: "Medical Center",
    caseCoordinator: "Fatima Ali",
    requestDate: new Date("2025-06-16"),
    completionDate: null
  }
];

export default function AdminDashboard() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { toast } = useToast();

  console.log("AdminDashboard rendering, showAnalytics:", showAnalytics);
  console.log("Admin data length:", adminData.length);

  // Filter data based on active filter and date filters
  const filteredData = adminData.filter(item => {
    const matchesStatus = !activeFilter || item.status === activeFilter || item.priority === activeFilter;
    
    const matchesDate = selectedDates.length === 0 || 
      selectedDates.some(date => 
        new Date(item.date).toDateString() === date.toDateString()
      );
    
    const matchesWeek = selectedWeeks.length === 0;
    const matchesMonth = selectedMonths.length === 0 || 
      selectedMonths.some(month => {
        const itemMonth = new Date(item.date).toLocaleString('default', { month: 'long' });
        return itemMonth === month;
      });
    
    return matchesStatus && matchesDate && matchesWeek && matchesMonth;
  });

  const handleStatusFilter = (status: string | null) => {
    setActiveFilter(activeFilter === status ? null : status);
  };

  const handleClearAllDateFilters = () => {
    setSelectedDates([]);
    setSelectedWeeks([]);
    setSelectedMonths([]);
  };

  const handleExcelUpload = (data: any[]) => {
    console.log("Processing Excel upload:", data);
    toast({
      title: "Excel Upload Successful",
      description: `${data.length} records processed and updated.`,
    });
  };

  const handleExport = () => {
    console.log("Exporting admin data to Excel");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleAnalytics = () => {
    console.log("Analytics toggle clicked, current state:", showAnalytics);
    setShowAnalytics(!showAnalytics);
  };

  // Calculate unread messages for admin role
  const unreadCount = 12;

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <AdminSidebar
        activeFilter={activeFilter}
        showAnalytics={showAnalytics}
        onStatusFilter={handleStatusFilter}
        onToggleAnalytics={handleToggleAnalytics}
      />

      <main className="flex-1 bg-white">
        <ScrollArea className="h-screen">
          {/* Header */}
          <AdminHeader
            selectedDates={selectedDates}
            selectedWeeks={selectedWeeks}
            selectedMonths={selectedMonths}
            onDateSelect={setSelectedDates}
            onWeekSelect={setSelectedWeeks}
            onMonthSelect={setSelectedMonths}
            onClearAllDateFilters={handleClearAllDateFilters}
            onExcelUpload={handleExcelUpload}
            onExport={handleExport}
            onPrint={handlePrint}
            unreadCount={unreadCount}
          />

          <div className="p-6">
            {/* Analytics Section */}
            {showAnalytics && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
                <AdminAnalytics 
                  data={adminData}
                  selectedDates={selectedDates}
                  selectedWeeks={selectedWeeks}
                  selectedMonths={selectedMonths}
                />
              </div>
            )}

            {/* Quick Actions */}
            <AdminQuickActions />

            {/* Admin Tasks Table */}
            <AdminTasksTable filteredData={filteredData} />

            {/* Footer */}
            <Footer />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
