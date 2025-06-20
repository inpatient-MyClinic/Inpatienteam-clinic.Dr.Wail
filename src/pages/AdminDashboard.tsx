
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Settings, FileText, BarChart3, ArrowLeft, Download, Printer, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import DateRangeFilter from "@/components/DateRangeFilter";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminExcelUpload from "@/components/admin/AdminExcelUpload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const adminStats = [
    { label: "Pending", value: 12, color: "bg-yellow-500", key: "pending" },
    { label: "Completed", value: 156, color: "bg-green-600", key: "completed" },
    { label: "In Progress", value: 34, color: "bg-blue-600", key: "in_progress" },
    { label: "High Priority", value: 8, color: "bg-red-600", key: "high_priority" },
  ];

  const quickActions = [
    { label: "User Management", path: "/settings-directory", icon: Users },
    { label: "System Settings", path: "/settings-directory", icon: Settings },
    { label: "Reports & Analytics", path: "/notifications-logs", icon: BarChart3 },
    { label: "Audit Logs", path: "/notifications-logs", icon: FileText },
  ];

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

  // Calculate unread messages for admin role
  const unreadCount = 12;

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
        <Logo size="sm" showText={false} className="mb-4" />
        
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold text-blue-900">Admin Dashboard</h1>
          <p className="text-xs text-blue-700">System Administration</p>
        </div>
        
        <div className="flex flex-col gap-2 w-full mb-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Filter by Status:</p>
          {adminStats.map((stat) => (
            <div
              key={stat.key}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 cursor-pointer transition-opacity ${
                !activeFilter || activeFilter === stat.label 
                  ? stat.color 
                  : stat.color + ' opacity-50'
              } text-white`}
              onClick={() => handleStatusFilter(activeFilter === stat.label ? null : stat.label)}
            >
              <span className="text-xs">{stat.label}:</span>
              <span className="font-bold text-lg">{stat.value}</span>
            </div>
          ))}
          
          {activeFilter && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveFilter(null)}
              className="mt-2"
            >
              Clear Filter
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full mb-4">
          <Button 
            variant={showAnalytics ? "default" : "outline"}
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="w-full"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </Button>
        </div>

        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 mt-auto border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </aside>

      <main className="flex-1 bg-white">
        <ScrollArea className="h-screen">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 p-6 border-b bg-white justify-between">
            <div className="flex gap-4 items-center">
              <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
              
              {/* Date Range Filter */}
              <DateRangeFilter
                selectedDates={selectedDates}
                selectedWeeks={selectedWeeks}
                selectedMonths={selectedMonths}
                onDateSelect={setSelectedDates}
                onWeekSelect={setSelectedWeeks}
                onMonthSelect={setSelectedMonths}
                onClearAll={handleClearAllDateFilters}
              />
            </div>

            <div className="flex gap-2">
              <MessagingIcons currentUserRole="admin" unreadCount={unreadCount} />
              <AdminExcelUpload onUpload={handleExcelUpload} />
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <div className="p-6">
            {/* Analytics Section */}
            {showAnalytics && (
              <AdminAnalytics 
                data={filteredData}
                selectedDates={selectedDates}
                selectedWeeks={selectedWeeks}
                selectedMonths={selectedMonths}
              />
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 h-24 hover:bg-gray-50"
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Admin Tasks Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Recent Admin Tasks</h2>
                <p className="text-sm text-gray-600">Showing {filteredData.length} tasks</p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Coordinator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.user}</TableCell>
                      <TableCell>{item.hospital}</TableCell>
                      <TableCell>{item.specialty}</TableCell>
                      <TableCell>{item.caseCoordinator}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === "Completed" ? "bg-green-100 text-green-800" :
                          item.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.priority === "High" ? "bg-red-100 text-red-800" :
                          item.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {item.priority}
                        </span>
                      </TableCell>
                      <TableCell>{item.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
