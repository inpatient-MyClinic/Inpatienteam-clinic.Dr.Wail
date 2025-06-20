
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Settings, FileText, BarChart3, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MessagingIcons from "@/components/messaging/MessagingIcons";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const adminStats = [
    { label: "Total Users", value: 156, icon: Users, color: "bg-blue-600" },
    { label: "Active Requests", value: 89, icon: FileText, color: "bg-green-600" },
    { label: "System Settings", value: 12, icon: Settings, color: "bg-purple-600" },
    { label: "Reports Generated", value: 34, icon: BarChart3, color: "bg-orange-600" },
  ];

  const quickActions = [
    { label: "User Management", path: "/settings-directory", icon: Users },
    { label: "System Settings", path: "/settings-directory", icon: Settings },
    { label: "Reports & Analytics", path: "/notifications-logs", icon: BarChart3 },
    { label: "Audit Logs", path: "/notifications-logs", icon: FileText },
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">System Administration Panel</p>
            </div>
          </div>
          <div className="flex gap-2">
            <MessagingIcons currentUserRole="admin" />
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
          {adminStats.map((stat, index) => (
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
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
      </div>
    </div>
  );
}
