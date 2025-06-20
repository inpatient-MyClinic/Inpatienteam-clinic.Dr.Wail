
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Settings, FileText, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickActions = [
  { label: "User Management", path: "/settings-directory", icon: Users },
  { label: "System Settings", path: "/settings-directory", icon: Settings },
  { label: "Reports & Analytics", path: "/notifications-logs", icon: BarChart3 },
  { label: "Audit Logs", path: "/notifications-logs", icon: FileText },
];

export default function AdminQuickActions() {
  const navigate = useNavigate();

  return (
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
  );
}
