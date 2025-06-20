
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, FileDown } from "lucide-react";
import ExcelUpload from "./ExcelUpload";

interface FinanceFiltersProps {
  dateFilter: string;
  setDateFilter: (value: string) => void;
  amountFilter: string;
  setAmountFilter: (value: string) => void;
  patientFilter: string;
  setPatientFilter: (value: string) => void;
  onExportToExcel: () => void;
  onPrint: () => void;
  onBulkUpdatePayments: (ids: string[]) => void;
}

export default function FinanceFilters({
  dateFilter,
  setDateFilter,
  amountFilter,
  setAmountFilter,
  patientFilter,
  setPatientFilter,
  onExportToExcel,
  onPrint,
  onBulkUpdatePayments
}: FinanceFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="date-filter" className="text-sm font-medium">Date:</Label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]" id="date-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="amount-filter" className="text-sm font-medium">Amount:</Label>
          <Select value={amountFilter} onValueChange={setAmountFilter}>
            <SelectTrigger className="w-[150px]" id="amount-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Amounts</SelectItem>
              <SelectItem value="0-1000">₹0 - ₹1,000</SelectItem>
              <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
              <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
              <SelectItem value="10000+">₹10,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="patient-filter" className="text-sm font-medium">Patient:</Label>
          <Input
            id="patient-filter"
            placeholder="Search by patient name"
            value={patientFilter === "all" ? "" : patientFilter}
            onChange={(e) => setPatientFilter(e.target.value || "all")}
            className="w-[200px]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <ExcelUpload onUpdatePayments={onBulkUpdatePayments} />
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onPrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExportToExcel}
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
