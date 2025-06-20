
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

interface FinanceSidebarProps {
  currentFinanceName: string;
  statusCounts: {
    paid: number;
    pending: number;
    delayPayment: number;
  };
  activeStatusFilter: string | null;
  onStatusIconClick: (status: string) => void;
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

  const stats = [
    {
      label: "Paid",
      key: "paid",
      color: "bg-green-500",
      count: statusCounts.paid
    },
    {
      label: "Pending", 
      key: "pending",
      color: "bg-yellow-500",
      count: statusCounts.pending
    },
    {
      label: "Delay Payment",
      key: "delayPayment",
      color: "bg-red-500",
      count: statusCounts.delayPayment
    }
  ];

  return (
    <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
      <Logo size="sm" showText={false} className="mb-4" />
      
      <div className="text-center mb-8">
        <h1 className="text-lg font-bold text-blue-900">Finance Dashboard</h1>
        <p className="text-xs text-blue-700">{currentFinanceName}</p>
      </div>
      
      <div className="flex flex-col gap-2 w-full mb-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">Filter by Status:</p>
        {stats.map((stat) => (
          <div
            key={stat.key}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 cursor-pointer transition-opacity ${
              !activeStatusFilter || activeStatusFilter === stat.label 
                ? stat.color 
                : stat.color + ' opacity-50'
            } text-white`}
            onClick={() => onStatusIconClick(activeStatusFilter === stat.label ? null : stat.label)}
          >
            <span className="text-xs">{stat.label}:</span>
            <span className="font-bold text-lg">{stat.count}</span>
          </div>
        ))}
        
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAllFilters}
            className="mt-2"
          >
            Clear All Filters
          </Button>
        )}
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
  );
}
