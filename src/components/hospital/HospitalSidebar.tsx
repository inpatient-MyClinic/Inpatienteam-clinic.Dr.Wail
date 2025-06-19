
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface HospitalSidebarProps {
  statusCounts: {
    pending: number;
    approved: number;
    rejected: number;
    needJustification: number;
  };
  activeStatusFilter: string | null;
  onStatusIconClick: (status: string) => void;
  onClearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export default function HospitalSidebar({
  statusCounts,
  activeStatusFilter,
  onStatusIconClick,
  onClearAllFilters,
  hasActiveFilters
}: HospitalSidebarProps) {
  return (
    <div className="w-64 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div 
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              activeStatusFilter === "Pending" ? "bg-yellow-100 border-2 border-yellow-300" : "hover:bg-gray-50 border"
            }`}
            onClick={() => onStatusIconClick("Pending")}
          >
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-600 mr-3" />
              <span>Pending</span>
            </div>
            <Badge variant="secondary">{statusCounts.pending}</Badge>
          </div>

          <div 
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              activeStatusFilter === "Approved" ? "bg-green-100 border-2 border-green-300" : "hover:bg-gray-50 border"
            }`}
            onClick={() => onStatusIconClick("Approved")}
          >
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <span>Approved</span>
            </div>
            <Badge variant="secondary">{statusCounts.approved}</Badge>
          </div>

          <div 
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              activeStatusFilter === "Rejected" ? "bg-red-100 border-2 border-red-300" : "hover:bg-gray-50 border"
            }`}
            onClick={() => onStatusIconClick("Rejected")}
          >
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-3" />
              <span>Rejected</span>
            </div>
            <Badge variant="secondary">{statusCounts.rejected}</Badge>
          </div>

          <div 
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              activeStatusFilter === "Need Justification" ? "bg-orange-100 border-2 border-orange-300" : "hover:bg-gray-50 border"
            }`}
            onClick={() => onStatusIconClick("Need Justification")}
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
              <span>Need Justification</span>
            </div>
            <Badge variant="secondary">{statusCounts.needJustification}</Badge>
          </div>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearAllFilters}
              className="w-full mt-4"
            >
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
