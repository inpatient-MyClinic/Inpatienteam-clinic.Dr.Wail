
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ArrowLeft,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MessagingIcons from "@/components/messaging/MessagingIcons";

export default function CaseCoordinatorDashboard() {
  const navigate = useNavigate();

  const coordinatorStats = [
    { label: "Active Cases", value: 24, icon: FileText, color: "bg-blue-600" },
    { label: "Pending Review", value: 8, icon: Clock, color: "bg-yellow-600" },
    { label: "Approved Today", value: 12, icon: CheckCircle, color: "bg-green-600" },
    { label: "Urgent Cases", value: 3, icon: AlertCircle, color: "bg-red-600" },
  ];

  const recentActivities = [
    { action: "Approved cardiac surgery request", patient: "Ahmed Hassan", time: "10 minutes ago" },
    { action: "Requested additional documents", patient: "Sara Ali", time: "25 minutes ago" },
    { action: "Coordinated with hospital", patient: "Omar Khalil", time: "1 hour ago" },
    { action: "Updated insurance status", patient: "Fatima Nour", time: "2 hours ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
              alt="My Clinic Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Case Coordinator Dashboard</h1>
              <p className="text-gray-600">Patient Case Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <MessagingIcons currentUserRole="case-coordinator" />
            <Button 
              onClick={() => navigate("/create-request")}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Case
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/role-selection")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Roles
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {coordinatorStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">Patient: {activity.patient}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
