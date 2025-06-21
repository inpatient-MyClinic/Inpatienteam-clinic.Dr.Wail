
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
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (value: string) => void;
  hospitalFilter: string;
  setHospitalFilter: (value: string) => void;
  doctorFilter: string;
  setDoctorFilter: (value: string) => void;
  onExportToExcel: () => void;
  onPrint: () => void;
  onBulkUpdatePayments: (ids: string[]) => void;
}

export default function FinanceFilters({
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  hospitalFilter,
  setHospitalFilter,
  doctorFilter,
  setDoctorFilter,
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
          <Label htmlFor="status-filter" className="text-sm font-medium">Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]" id="status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Delay Payment">Delay Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="payment-status-filter" className="text-sm font-medium">Payment:</Label>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-[150px]" id="payment-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="not-paid">Not Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="hospital-filter" className="text-sm font-medium">Hospital:</Label>
          <Input
            id="hospital-filter"
            placeholder="Filter by hospital"
            value={hospitalFilter === "all" ? "" : hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value || "all")}
            className="w-[200px]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="doctor-filter" className="text-sm font-medium">Doctor:</Label>
          <Input
            id="doctor-filter"
            placeholder="Filter by doctor"
            value={doctorFilter === "all" ? "" : doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value || "all")}
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
