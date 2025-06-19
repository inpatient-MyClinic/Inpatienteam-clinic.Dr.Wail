import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import HospitalRequestsTable from "@/components/hospital/HospitalRequestsTable";
import HospitalAnalytics from "@/components/hospital/HospitalAnalytics";

// Sample data - in a real app, this would come from your backend
const sampleRequests = [
  {
    id: 1,
    patientName: "Ahmed Al-Rashid",
    mrn: "MRN-001",
    phone: "+966-12-345-6789",
    nationalId: "1234567890",
    age: 45,
    gender: "Male",
    serviceDescription: "Cardiac Surgery - CABG",
    specialty: "Cardiology",
    doctor: "Dr. Sarah Johnson",
    expectedSurgeryDate: "2024-01-15",
    status: "Pending",
    submissionDate: "2024-01-10",
    leadTime: 5,
    medicalHistory: "Patient has history of hypertension and diabetes. Previous cardiac catheterization in 2020.",
    currentMedications: "Metoprolol 50mg twice daily, Lisinopril 10mg daily, Metformin 1000mg twice daily",
    allergies: "Penicillin, Shellfish",
    insuranceProvider: "BUPA Arabia",
    insuranceNumber: "INS-123456789",
    emergencyContact: "Fatima Al-Rashid (Wife) - +966-12-987-6543",
    referringDoctor: "Dr. Mohammad Hassan",
    diagnosisCode: "I25.9",
    procedureCode: "CPT-33533",
    priority: "High",
    additionalNotes: "Patient requires pre-operative cardiac assessment",
    attachments: ["ECG_Report_2024.pdf", "Blood_Tests_Results.pdf", "Chest_Xray.jpg"]
  },
  {
    id: 2,
    patientName: "Fatima Al-Zahra",
    mrn: "MRN-002",
    phone: "+966-11-234-5678",
    nationalId: "9876543210",
    age: 62,
    gender: "Female",
    serviceDescription: "Orthopedic Surgery - Knee Replacement",
    specialty: "Orthopedics",
    doctor: "Dr. Michael Chen",
    expectedSurgeryDate: "2024-01-20",
    status: "Approved",
    submissionDate: "2024-01-08",
    leadTime: 12,
    medicalHistory: "Osteoarthritis for 10 years, previous hip replacement in 2018",
    currentMedications: "Ibuprofen 400mg as needed, Calcium supplements",
    allergies: "None known",
    insuranceProvider: "Tawuniya",
    insuranceNumber: "INS-987654321",
    emergencyContact: "Omar Al-Zahra (Son) - +966-11-876-5432",
    referringDoctor: "Dr. Aisha Abdullah",
    diagnosisCode: "M17.9",
    procedureCode: "CPT-27447",
    priority: "Medium",
    additionalNotes: "Patient prefers general anesthesia",
    attachments: ["MRI_Knee_2024.pdf", "X-ray_Both_Knees.jpg"]
  },
  {
    id: 3,
    patientName: "Omar Hassan",
    mrn: "MRN-003",
    serviceDescription: "Neurosurgery - Brain Tumor Removal",
    specialty: "Neurosurgery",
    doctor: "Dr. Emily Davis",
    expectedSurgeryDate: "2024-01-25",
    status: "Rejected",
    submissionDate: "2024-01-12",
    leadTime: 13
  },
  {
    id: 4,
    patientName: "Aisha Mohammad",
    mrn: "MRN-004",
    serviceDescription: "General Surgery - Appendectomy",
    specialty: "General Surgery",
    doctor: "Dr. James Wilson",
    expectedSurgeryDate: "2024-01-18",
    status: "Need Justification",
    submissionDate: "2024-01-11",
    leadTime: 7
  }
];

export default function HospitalDashboard() {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("01");
  const [filteredRequests, setFilteredRequests] = useState(sampleRequests);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  
  // Column filters
  const [surgeryDateFilter, setSurgeryDateFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Apply all filters whenever any filter changes
  useEffect(() => {
    let filtered = [...sampleRequests];

    // Apply status filter from sidebar
    if (activeStatusFilter) {
      filtered = filtered.filter(req => req.status === activeStatusFilter);
    }

    // Apply column filters
    if (surgeryDateFilter) {
      filtered = filtered.filter(req => req.expectedSurgeryDate === surgeryDateFilter);
    }
    if (specialtyFilter) {
      filtered = filtered.filter(req => 
        req.specialty.toLowerCase().includes(specialtyFilter.toLowerCase())
      );
    }
    if (doctorFilter) {
      filtered = filtered.filter(req => 
        req.doctor.toLowerCase().includes(doctorFilter.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Apply date filters
    if (selectedDates.length > 0) {
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.expectedSurgeryDate);
        return selectedDates.some(selectedDate => 
          reqDate.toDateString() === selectedDate.toDateString()
        );
      });
    }

    setFilteredRequests(filtered);
  }, [activeStatusFilter, surgeryDateFilter, specialtyFilter, doctorFilter, statusFilter, selectedDates]);

  const totalRequests = sampleRequests.length;
  const doneRequests = sampleRequests.filter(req => req.status === "Approved").length;
  const approvedRequests = sampleRequests.filter(req => req.status === "Approved").length;
  const rejectedRequests = sampleRequests.filter(req => req.status === "Rejected").length;

  const conversionRate = totalRequests > 0 ? ((doneRequests / totalRequests) * 100).toFixed(1) : "0";
  const approvalRate = totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(1) : "0";
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : "0";

  const statusCounts = {
    new: sampleRequests.filter(req => req.status === "New").length,
    pending: sampleRequests.filter(req => req.status === "Pending").length,
    approved: sampleRequests.filter(req => req.status === "Approved").length,
    rejected: sampleRequests.filter(req => req.status === "Rejected").length,
    needJustification: sampleRequests.filter(req => req.status === "Need Justification").length,
  };

  const handleStatusIconClick = (status: string) => {
    setActiveStatusFilter(activeStatusFilter === status ? null : status);
  };

  const handleExportToExcel = () => {
    toast({
      title: "Export Initiated",
      description: "Your Excel file is being prepared for download.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const clearAllFilters = () => {
    setActiveStatusFilter(null);
    setSurgeryDateFilter("");
    setSpecialtyFilter("");
    setDoctorFilter("");
    setStatusFilter("");
    setSelectedDates([]);
    setSelectedMonths([]);
  };

  const hasActiveFilters = Boolean(activeStatusFilter || surgeryDateFilter || specialtyFilter || doctorFilter || statusFilter || selectedDates.length > 0 || selectedMonths.length > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Status Icons and Date Filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
          
          {/* Status Filter Icons */}
          <div className="flex items-center space-x-4">
            <div 
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                activeStatusFilter === "New" ? "bg-blue-100 border-2 border-blue-300" : "hover:bg-gray-50"
              }`}
              onClick={() => handleStatusIconClick("New")}
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">{statusCounts.new}</span>
            </div>

            <div 
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                activeStatusFilter === "Pending" ? "bg-yellow-100 border-2 border-yellow-300" : "hover:bg-gray-50"
              }`}
              onClick={() => handleStatusIconClick("Pending")}
            >
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium">{statusCounts.pending}</span>
            </div>

            <div 
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                activeStatusFilter === "Need Justification" ? "bg-orange-100 border-2 border-orange-300" : "hover:bg-gray-50"
              }`}
              onClick={() => handleStatusIconClick("Need Justification")}
            >
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium">{statusCounts.needJustification}</span>
            </div>

            <div 
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                activeStatusFilter === "Rejected" ? "bg-red-100 border-2 border-red-300" : "hover:bg-gray-50"
              }`}
              onClick={() => handleStatusIconClick("Rejected")}
            >
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium">{statusCounts.rejected}</span>
            </div>

            <div 
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                activeStatusFilter === "Approved" ? "bg-green-100 border-2 border-green-300" : "hover:bg-gray-50"
              }`}
              onClick={() => handleStatusIconClick("Approved")}
            >
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">{statusCounts.approved}</span>
            </div>
          </div>
        </div>

        {/* Date Filters and Export Buttons */}
        <div className="flex items-center gap-4">
          {/* Day Filter */}
          <div>
            <Label className="text-sm font-medium">Day</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-auto">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDates.length > 0 ? `${selectedDates.length} days` : "Select Days"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="end">
                <CalendarComponent
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Week Filter */}
          <div>
            <Label className="text-sm font-medium">Week</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="01">January</SelectItem>
                <SelectItem value="02">February</SelectItem>
                <SelectItem value="03">March</SelectItem>
                <SelectItem value="04">April</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Month Filter */}
          <div>
            <Label className="text-sm font-medium">Months</Label>
            <Select value={selectedMonths.join(',')} onValueChange={(value) => setSelectedMonths(value ? value.split(',') : [])}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="01">January</SelectItem>
                <SelectItem value="02">February</SelectItem>
                <SelectItem value="03">March</SelectItem>
                <SelectItem value="04">April</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          )}

          {/* Export Buttons */}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Requests Table */}
        <HospitalRequestsTable
          filteredRequests={filteredRequests}
          totalRequests={totalRequests}
          surgeryDateFilter={surgeryDateFilter}
          setSurgeryDateFilter={setSurgeryDateFilter}
          specialtyFilter={specialtyFilter}
          setSpecialtyFilter={setSpecialtyFilter}
          doctorFilter={doctorFilter}
          setDoctorFilter={setDoctorFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Analytics Cards */}
        <HospitalAnalytics
          conversionRate={conversionRate}
          approvalRate={approvalRate}
          rejectionRate={rejectionRate}
          doneRequests={doneRequests}
          totalRequests={totalRequests}
          approvedRequests={approvedRequests}
          rejectedRequests={rejectedRequests}
        />
      </div>
    </div>
  );
}
