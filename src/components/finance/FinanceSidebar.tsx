
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

interface FinanceSidebarProps {
  currentFinanceName: string;
  statusCounts: {
    paid: number;
    pending: number;
    delayPayment: number;
  };
  activeStatusFilter: string | null;
  onStatusIconClick: (status: string | null) => void;
  onClearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FinanceSidebar({ 
  currentFinanceName, 
  statusCounts,
  activeStatusFilter,
  onStatusIconClick,
  onClearAllFilters,
  hasActiveFilters
}: FinanceSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear all user data from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('user_') || key.startsWith('password_') || key.startsWith('lastPasswordUpdate_')) {
        localStorage.removeItem(key);
      }
    });

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });

    navigate("/");
  };

  return (
    <aside className="w-[19rem] bg-green-50 flex flex-col items-center p-6 border-r">
      <Logo size="sm" showText={false} className="mb-4" />
      
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold text-green-900">Finance Dashboard</h1>
        <p className="text-xs text-green-700">{currentFinanceName}</p>
      </div>

      {/* Payment Status Stats */}
      <div className="w-full space-y-2 mb-6">
        <div className="grid grid-cols-1 gap-2">
          {[
            { label: "Paid", value: statusCounts.paid, color: "bg-green-600", key: "Paid" },
            { label: "Pending", value: statusCounts.pending, color: "bg-yellow-600", key: "Pending" },
            { label: "Delay Payment", value: statusCounts.delayPayment, color: "bg-red-600", key: "Delay Payment" },
          ].map((stat) => (
            <div
              key={stat.key}
              className={`${stat.color} text-white p-3 rounded-lg text-center cursor-pointer transition-all duration-200 ${
                activeStatusFilter === stat.key ? 'ring-2 ring-white ring-offset-2' : 'hover:opacity-80'
              }`}
              onClick={() => onStatusIconClick(activeStatusFilter === stat.key ? null : stat.key)}
            >
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button 
          variant="outline" 
          onClick={onClearAllFilters}
          className="w-full mb-4 border-green-300 text-green-700 hover:bg-green-100"
        >
          Clear All Filters
        </Button>
      )}

      <div className="mt-auto space-y-2 w-full">
        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>

        <Button 
          variant="destructive"
          onClick={handleLogout}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
