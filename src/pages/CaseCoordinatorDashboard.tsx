
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ArrowLeft,
  Plus,
  Printer
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import CaseCoordinatorSidebar from "@/components/CaseCoordinatorSidebar";

export default function CaseCoordinatorDashboard() {
  const navigate = useNavigate();
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);

  const currentCoordinatorName = "Sarah Johnson";

  const coordinatorStats = [
    { label: "Active Cases", value: 24, icon: FileText, color: "bg-blue-600", key: "active" },
    { label: "Pending Review", value: 8, icon: Clock, color: "bg-yellow-600", key: "pending" },
    { label: "Approved Today", value: 12, icon: CheckCircle, color: "bg-green-600", key: "approved" },
    { label: "Urgent Cases", value: 3, icon: AlertCircle, color: "bg-red-600", key: "urgent" },
    { label: "Rejected", value: 2, icon: XCircle, color: "bg-gray-600", key: "rejected" },
  ];

  const recentActivities = [
    { action: "Approved cardiac surgery request", patient: "Ahmed Hassan", time: "10 minutes ago", status: "Approved" },
    { action: "Requested additional documents", patient: "Sara Ali", time: "25 minutes ago", status: "Pending Review" },
    { action: "Coordinated with hospital", patient: "Omar Khalil", time: "1 hour ago", status: "Under Process" },
    { action: "Updated insurance status", patient: "Fatima Nour", time: "2 hours ago", status: "Active" },
    { action: "Rejected incomplete request", patient: "Mohammed Al-Rashid", time: "3 hours ago", status: "Rejected" },
    { action: "Escalated urgent case", patient: "Layla Hassan", time: "4 hours ago", status: "Urgent" },
  ];

  // Calculate unread messages for case-coordinator role
  const unreadCount = 5; // This would typically come from a hook or API

  // Filter activities based on selected status
  const filteredActivities = activeStatusFilter 
    ? recentActivities.filter(activity => activity.status === activeStatusFilter)
    : recentActivities;

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "text-green-600 bg-green-50";
      case "Pending Review": return "text-yellow-600 bg-yellow-50";
      case "Under Process": return "text-blue-600 bg-blue-50";
      case "Active": return "text-blue-600 bg-blue-50";
      case "Rejected": return "text-red-600 bg-red-50";
      case "Urgent": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <CaseCoordinatorSidebar 
        currentCoordinatorName={currentCoordinatorName}
        stats={coordinatorStats}
        activeStatusFilter={activeStatusFilter}
        onStatusFilterClick={setActiveStatusFilter}
      />
      
      <main className="flex-1 bg-white">
        <ScrollArea className="h-screen">
          <div className="p-6">
            {/* Header with Actions */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Case Management Dashboard</h2>
                <p className="text-gray-600">Manage patient cases and coordination tasks</p>
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
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow border p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                {activeStatusFilter && (
                  <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Filtered by: {activeStatusFilter}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {filteredActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">Patient: {activity.patient}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/create-request")}
                  className="flex flex-col items-center gap-2 h-20 hover:bg-blue-50"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">New Case</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/my-requests")}
                  className="flex flex-col items-center gap-2 h-20 hover:bg-green-50"
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">View All Cases</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/notifications-logs")}
                  className="flex flex-col items-center gap-2 h-20 hover:bg-orange-50"
                >
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-sm">Reports</span>
                </Button>
              </div>
            </div>

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
