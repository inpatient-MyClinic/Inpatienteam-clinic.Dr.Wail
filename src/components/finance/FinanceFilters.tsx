
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Printer, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

const doctors = [
  { value: "all", label: "All Doctors" },
  { value: "Dr. Ahmed Al-Rashid", label: "Dr. Ahmed Al-Rashid" },
  { value: "Dr. Sarah Al-Mahmoud", label: "Dr. Sarah Al-Mahmoud" },
  { value: "Dr. Mohammed Hassan", label: "Dr. Mohammed Hassan" },
];

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
  const [doctorOpen, setDoctorOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="date-filter" className="text-sm font-medium">Date:</Label>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[150px]" id="date-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
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
            <SelectContent className="bg-white">
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
            <SelectContent className="bg-white">
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
          <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
            <SelectTrigger className="w-[200px]" id="hospital-filter">
              <SelectValue placeholder="Select hospital" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Hospitals</SelectItem>
              <SelectItem value="King Abdulaziz Hospital">King Abdulaziz Hospital</SelectItem>
              <SelectItem value="Prince Sultan Hospital">Prince Sultan Hospital</SelectItem>
              <SelectItem value="Medical Center">Medical Center</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="doctor-filter" className="text-sm font-medium">Doctor:</Label>
          <Popover open={doctorOpen} onOpenChange={setDoctorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={doctorOpen}
                className="w-[200px] justify-between"
              >
                {doctorFilter ? doctors.find((doctor) => doctor.value === doctorFilter)?.label : "Select doctor..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 bg-white" align="start">
              <Command className="bg-white">
                <CommandInput placeholder="Search doctor..." />
                <CommandList>
                  <CommandEmpty>No doctor found.</CommandEmpty>
                  <CommandGroup>
                    {doctors.map((doctor) => (
                      <CommandItem
                        key={doctor.value}
                        value={doctor.value}
                        onSelect={(currentValue) => {
                          setDoctorFilter(currentValue === doctorFilter ? "all" : currentValue);
                          setDoctorOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            doctorFilter === doctor.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {doctor.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
