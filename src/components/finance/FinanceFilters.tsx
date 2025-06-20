
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface FinanceFiltersProps {
  dateFilter: string;
  setDateFilter: (value: string) => void;
  amountFilter: string;
  setAmountFilter: (value: string) => void;
  patientFilter: string;
  setPatientFilter: (value: string) => void;
  onExportToExcel: () => void;
  onPrint: () => void;
}

export default function FinanceFilters({
  dateFilter,
  setDateFilter,
  amountFilter,
  setAmountFilter,
  patientFilter,
  setPatientFilter,
  onExportToExcel,
  onPrint
}: FinanceFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={amountFilter} onValueChange={setAmountFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by amount" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Amounts</SelectItem>
            <SelectItem value="low">₹0 - ₹2,000</SelectItem>
            <SelectItem value="medium">₹2,000 - ₹5,000</SelectItem>
            <SelectItem value="high">₹5,000+</SelectItem>
          </SelectContent>
        </Select>

        <Select value={patientFilter} onValueChange={setPatientFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by patient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            <SelectItem value="ahmed">Ahmed Hassan</SelectItem>
            <SelectItem value="sara">Sara Ali</SelectItem>
            <SelectItem value="omar">Omar Khalil</SelectItem>
            <SelectItem value="fatima">Fatima Nour</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
