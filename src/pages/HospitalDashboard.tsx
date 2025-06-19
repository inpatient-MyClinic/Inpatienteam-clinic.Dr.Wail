
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import HospitalSidebar from "@/components/hospital/HospitalSidebar";
import HospitalFilters from "@/components/hospital/HospitalFilters";
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
  };

  const hasActiveFilters = activeStatusFilter || surgeryDateFilter || specialtyFilter || doctorFilter || statusFilter || selectedDates.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Sidebar */}
        <HospitalSidebar
          statusCounts={statusCounts}
          activeStatusFilter={activeStatusFilter}
          onStatusIconClick={handleStatusIconClick}
          onClearAllFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Right Content */}
        <div className="flex-1 space-y-6">
          {/* Filters */}
          <HospitalFilters
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedMonths={selectedMonths}
            setSelectedMonths={setSelectedMonths}
            onExportToExcel={handleExportToExcel}
            onPrint={handlePrint}
          />

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

          {/* Analytics Cards - Below table */}
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
    </div>
  );
}
