import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import DoctorSidebar from "@/components/DoctorSidebar";
import FilterBar from "@/components/FilterBar";
import DateRangeFilter from "@/components/DateRangeFilter";
import RequestsTable from "@/components/RequestsTable";
import HospitalPrivileges from "@/components/HospitalPrivileges";
import DoctorAnalytics from "@/components/DoctorAnalytics";

// Request workflow statuses
const REQUEST_STATUSES = {
  NEW: "New Request",
  PENDING: "Pending",
  NEED_JUSTIFICATION: "Need Justification",
  UNDER_PROCESS: "Under Process",
  REJECTED: "Rejected",
  DONE: "Done"
};

const PAYMENT_STATUSES = {
  PENDING: "Pending",
  PAID: "Paid",
  REJECTED: "Rejected"
};

const stats = [
  { label: "New Request", key: "new", color: "bg-blue-600", count: 3 },
  { label: "Pending", key: "pending", color: "bg-yellow-500", count: 5 },
  { label: "Need Justification", key: "justification", color: "bg-orange-500", count: 2 },
  { label: "Under Process", key: "process", color: "bg-purple-500", count: 4 },
  { label: "Rejected", key: "rejected", color: "bg-red-500", count: 1 },
  { label: "Done", key: "done", color: "bg-green-600", count: 8 },
];

const filters = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

export default function DoctorDashboard() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Sample requests - doctor can see requests assigned to them
  const [requests, setRequests] = useState([
    {
      id: 1,
      patientName: "Ahmed Mohamed",
      mrn: "MRN001234",
      serviceDescription: "Cardiac Surgery - Bypass",
      hospital: "King Khaled Hospital",
      status: REQUEST_STATUSES.PENDING,
      paymentStatus: PAYMENT_STATUSES.PENDING,
      assignedDoctor: "Dr. Ahmed Salem",
      createdAt: "2024-01-10T11:00:00Z",
      originalRequest: "Patient requires cardiac bypass surgery due to severe coronary artery disease.",
      justificationNeeded: false,
      medicalHistory: "Patient has a history of hypertension, diabetes mellitus, and previous myocardial infarction in 2019. Current medications include metformin, lisinopril, and aspirin.",
      additionalNotes: "Patient is stable but requires urgent surgical intervention. Family history of cardiac disease.",
      attachments: ["ECG_Report_Ahmed_Mohamed.pdf", "Cardiac_Catheterization_Results.pdf", "Blood_Tests_Jan2024.pdf"],
      expectedSurgeryDate: "2024-02-15"
    },
    {
      id: 2,
      patientName: "Fatima Ali",
      mrn: "MRN005678",
      serviceDescription: "Orthopedic Surgery - Knee Replacement",
      hospital: "King Abdulaziz Hospital",
      status: REQUEST_STATUSES.NEED_JUSTIFICATION,
      paymentStatus: PAYMENT_STATUSES.PENDING,
      assignedDoctor: "Dr. Ahmed Salem",
      createdAt: "2024-01-09T15:30:00Z",
      originalRequest: "Patient needs total knee replacement due to severe arthritis affecting mobility.",
      justificationNeeded: true,
      medicalHistory: "Patient has severe osteoarthritis in both knees with significant pain and mobility limitation. Previous conservative treatments including physiotherapy and steroid injections have failed.",
      additionalNotes: "Patient is unable to walk more than 50 meters without severe pain. Quality of life significantly affected.",
      attachments: ["X-Ray_Knee_Fatima_Ali.pdf", "MRI_Results.pdf"],
      expectedSurgeryDate: "2024-02-20"
    },
    {
      id: 3,
      patientName: "Omar Hassan",
      mrn: "MRN009876",
      serviceDescription: "General Surgery - Appendectomy",
      hospital: "King Faisal Hospital",
      status: REQUEST_STATUSES.DONE,
      paymentStatus: PAYMENT_STATUSES.PAID,
      assignedDoctor: "Dr. Ahmed Salem",
      createdAt: "2024-01-08T09:15:00Z",
      originalRequest: "Emergency appendectomy required for acute appendicitis.",
      justificationNeeded: false,
      medicalHistory: "Previously healthy 28-year-old male with no significant medical history.",
      additionalNotes: "Surgery completed successfully. Patient recovered well post-operatively.",
      attachments: ["CT_Scan_Abdomen.pdf", "Post_Op_Report.pdf"],
      expectedSurgeryDate: "2024-01-08"
    },
    {
      id: 4,
      patientName: "Layla Ibrahim",
      mrn: "MRN004567",
      serviceDescription: "Neurosurgery - Brain Tumor Removal",
      hospital: "King Khalid Hospital",
      status: REQUEST_STATUSES.UNDER_PROCESS,
      paymentStatus: PAYMENT_STATUSES.PENDING,
      assignedDoctor: "Dr. Ahmed Salem",
      createdAt: "2024-01-07T14:20:00Z",
      originalRequest: "Brain tumor removal surgery required for benign meningioma.",
      justificationNeeded: false,
      medicalHistory: "Patient presented with headaches and visual disturbances. MRI confirmed 3cm meningioma in right frontal lobe.",
      additionalNotes: "Patient is neurologically stable. Tumor is accessible and suitable for surgical resection.",
      attachments: ["Brain_MRI_Layla_Ibrahim.pdf", "Neurological_Assessment.pdf", "Pre_Op_Clearance.pdf"],
      expectedSurgeryDate: "2024-02-10"
    }
  ]);

  const currentDoctorName = "Dr. Ahmed Salem";

  // Doctor's hospital privileges with case counts
  const doctorPrivileges = [
    { name: "King Khaled Hospital", cases: 15 },
    { name: "King Abdulaziz Hospital", cases: 8 }, 
    { name: "King Faisal Hospital", cases: 12 },
    { name: "Prince Sultan Hospital", cases: 6 }
  ];

  // Filter requests by selected statuses and date filters
  const filteredRequests = requests.filter(request => {
    if (selectedStatuses.length === 0) return true;
    return selectedStatuses.includes(request.status);
  });

  // Analytics calculations
  const totalRequests = requests.length;
  const doneRequests = requests.filter(req => req.status === REQUEST_STATUSES.DONE).length;
  const rejectedRequests = requests.filter(req => req.status === REQUEST_STATUSES.REJECTED).length;
  const conversionRate = totalRequests > 0 ? ((doneRequests / totalRequests) * 100).toFixed(1) : "0";
  const approvalRate = totalRequests > 0 ? (((totalRequests - rejectedRequests) / totalRequests) * 100).toFixed(1) : "0";
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : "0";

  const handleStatusClick = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(prev => prev.filter(s => s !== status));
    } else {
      setSelectedStatuses(prev => [...prev, status]);
    }
  };

  const clearStatusFilter = () => {
    setSelectedStatuses([]);
  };

  const clearAllDateFilters = () => {
    setSelectedDates([]);
    setSelectedWeeks([]);
    setSelectedMonths([]);
  };

  const exportToExcel = () => {
    console.log("Exporting doctor requests to Excel with date filters:", {
      dates: selectedDates,
      weeks: selectedWeeks,
      months: selectedMonths
    });
    toast({
      title: "Export Started",
      description: "Excel file generation in progress...",
    });
  };

  const createNewRequest = () => {
    navigate("/create-request");
  };

  const handleJustificationSubmit = (requestId: number, justification: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { 
          ...req, 
          status: REQUEST_STATUSES.UNDER_PROCESS,
          justificationNeeded: false
        } : req
      )
    );

    toast({
      title: "Justification Submitted",
      description: "Request has been forwarded to hospital with justification",
    });
  };

  const handleRequestModification = (requestId: number, expectedSurgeryDate: string, hospital: string) => {
    const originalRequest = requests.find(req => req.id === requestId);
    
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { 
          ...req, 
          expectedSurgeryDate,
          hospital,
          status: REQUEST_STATUSES.UNDER_PROCESS
        } : req
      )
    );

    // Simulate notifications to case coordinator and hospital
    console.log(`Notification sent to Case Coordinator: Request ${requestId} has been modified`);
    console.log(`Notification sent to ${hospital}: New request assigned from ${originalRequest?.hospital}`);
    console.log(`Request removed from ${originalRequest?.hospital} and assigned to ${hospital}`);

    toast({
      title: "Request Modified Successfully",
      description: `Request transferred to ${hospital}. Notifications sent to case coordinator and hospital.`,
    });
  };

  const printPage = () => {
    window.print();
    toast({
      title: "Print Started",
      description: "Printing page...",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      [REQUEST_STATUSES.NEW]: "bg-blue-100 text-blue-800",
      [REQUEST_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800",
      [REQUEST_STATUSES.NEED_JUSTIFICATION]: "bg-orange-100 text-orange-800",
      [REQUEST_STATUSES.UNDER_PROCESS]: "bg-purple-100 text-purple-800",
      [REQUEST_STATUSES.REJECTED]: "bg-red-100 text-red-800",
      [REQUEST_STATUSES.DONE]: "bg-green-100 text-green-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      [PAYMENT_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800",
      [PAYMENT_STATUSES.PAID]: "bg-green-100 text-green-800",
      [PAYMENT_STATUSES.REJECTED]: "bg-red-100 text-red-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen w-full">
      <DoctorSidebar
        currentDoctorName={currentDoctorName}
        stats={stats}
        selectedStatuses={selectedStatuses}
        onStatusClick={handleStatusClick}
        onClearStatusFilter={clearStatusFilter}
        onCreateNewRequest={createNewRequest}
      />
      
      <main className="flex-1 bg-white p-6">
        <DateRangeFilter
          selectedDates={selectedDates}
          selectedWeeks={selectedWeeks}
          selectedMonths={selectedMonths}
          onDateSelect={setSelectedDates}
          onWeekSelect={setSelectedWeeks}
          onMonthSelect={setSelectedMonths}
          onClearAll={clearAllDateFilters}
        />
        
        <FilterBar
          onExportExcel={exportToExcel}
          onPrint={printPage}
        />
        
        <RequestsTable
          requests={filteredRequests}
          onJustificationSubmit={handleJustificationSubmit}
          onRequestModification={handleRequestModification}
          getStatusBadge={getStatusBadge}
          getPaymentStatusBadge={getPaymentStatusBadge}
          REQUEST_STATUSES={REQUEST_STATUSES}
        />

        <HospitalPrivileges privileges={doctorPrivileges} />

        <DoctorAnalytics
          totalRequests={totalRequests}
          doneRequests={doneRequests}
          rejectedRequests={rejectedRequests}
          conversionRate={conversionRate}
          approvalRate={approvalRate}
          rejectionRate={rejectionRate}
        />
      </main>
    </div>
  );
}
