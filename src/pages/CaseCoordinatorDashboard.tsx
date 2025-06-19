import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Clock, AlertTriangle, Bell, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import DateRangeFilter from "@/components/DateRangeFilter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Request workflow statuses
const REQUEST_STATUSES = {
  NEW: "New",
  PENDING: "Pending",
  UNDER_PROCESS: "Under Process", 
  PATIENT_CONTACTED: "Patient Contacted",
  SUBMITTED_TO_INSURANCE: "Submitted to Insurance",
  APPROVED_BY_HOSPITAL: "Approved by Hospital",
  REJECTED: "Rejected",
  DONE: "Done",
  NEED_JUSTIFICATION: "Need Justification",
  NOT_COMPLETED: "Not Completed",
  DELAYED: "Delayed"
};

const stats = [
  { label: "All Requests", key: "all", color: "bg-blue-600", count: 25 },
  { label: "My Requests", key: "mine", color: "bg-green-600", count: 8 },
  { label: "Under Process", key: "process", color: "bg-yellow-500", count: 12 },
  { label: "Completed", key: "completed", color: "bg-purple-500", count: 45 },
];

const filters = [
  { label: "All Requests", value: "all" },
  { label: "My Name", value: "mine" },
  { label: "Under Process", value: "process" },
  { label: "Completed", value: "completed" },
  { label: "Delayed", value: "delayed" },
  { label: "Need Justification", value: "justification" },
];

const hospitals = [
  "King Fahad Hospital",
  "King Faisal Hospital",
  "King Khalid Hospital",
  "Prince Sultan Hospital",
  "National Guard Hospital",
];

const specialties = [
  "Cardiology",
  "Orthopedics", 
  "Neurosurgery",
  "General Surgery",
  "Pediatric Surgery"
];

// Sample data - expanded with workflow functionality
const allRequests = [
  {
    id: 1,
    patientName: "Nora Mohammed",
    idNumber: "2012345678",
    phone: "0551234567",
    agreedSurgeryDate: "2025-06-25",
    hospital: "King Abdulaziz Hospital",
    specialty: "Cardiology",
    doctorName: "Dr. Ahmed Salem",
    status: REQUEST_STATUSES.NEW,
    coordinator: null,
    createdAt: "2024-01-12T10:00:00Z",
    isDelayed: false,
    attachments: ["medical_report.pdf"],
    notifications: []
  },
  {
    id: 2,
    patientName: "Omar Hassan",
    idNumber: "2018765432",
    phone: "0567890123",
    agreedSurgeryDate: "2025-06-28",
    hospital: "King Abdulaziz Hospital",
    specialty: "Orthopedics",
    doctorName: "Dr. Sarah Ali",
    status: REQUEST_STATUSES.PENDING,
    coordinator: null,
    createdAt: "2024-01-10T14:30:00Z",
    isDelayed: true,
    attachments: ["xray_scan.jpg"],
    notifications: ["Request forwarded to hospital due to delay"]
  },
  {
    id: 3,
    patientName: "Fatima Ali",
    idNumber: "2014567890",
    phone: "0512345678",
    agreedSurgeryDate: "2025-07-02",
    hospital: "Prince Sultan Hospital",
    specialty: "Neurosurgery",
    doctorName: "Dr. Mohammed Hassan",
    status: REQUEST_STATUSES.UNDER_PROCESS,
    coordinator: "John Smith",
    createdAt: "2024-01-08T09:15:00Z",
    isDelayed: false,
    attachments: ["brain_scan.dcm", "consultation_notes.pdf"],
    notifications: []
  },
  {
    id: 4,
    patientName: "Ahmed Al-Rashid",
    idNumber: "2019876543",
    phone: "0523456789",
    agreedSurgeryDate: "2025-07-05",
    hospital: "King Faisal Hospital",
    specialty: "General Surgery",
    doctorName: "Dr. Layla Ahmed",
    status: REQUEST_STATUSES.NEED_JUSTIFICATION,
    coordinator: "John Smith",
    createdAt: "2024-01-05T16:45:00Z",
    isDelayed: false,
    attachments: [],
    notifications: ["Hospital rejected request - additional justification required"]
  },
];

export default function CaseCoordinatorDashboard() {
  const [filter, setFilter] = useState<string>("all");
  const [hospitalFilter, setHhospitalFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("");
  const [requests, setRequests] = useState(allRequests);
  
  // Date filter states
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const coordinatorName = "John Smith";

  // Check for delayed requests (4+ hours during business hours)
  useEffect(() => {
    const checkDelayedRequests = () => {
      const now = new Date();
      const businessStart = 9; // 9 AM
      const businessEnd = 20; // 8 PM
      
      setRequests(prev => prev.map(req => {
        if (req.status === REQUEST_STATUSES.PENDING && !req.coordinator) {
          const createdTime = new Date(req.createdAt);
          const hoursDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
          
          const currentHour = now.getHours();
          const isBusinessHours = currentHour >= businessStart && currentHour <= businessEnd;
          
          if (hoursDiff >= 4 && isBusinessHours && !req.isDelayed) {
            // Auto-forward to hospital
            return {
              ...req,
              isDelayed: true,
              status: REQUEST_STATUSES.DELAYED,
              notifications: [...req.notifications, "Request automatically forwarded to hospital due to delay"]
            };
          }
        }
        return req;
      }));
    };

    const interval = setInterval(checkDelayedRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate statistics for all requests
  const allStats = {
    new: requests.filter(req => req.status === REQUEST_STATUSES.NEW).length,
    pending: requests.filter(req => req.status === REQUEST_STATUSES.PENDING).length,
    underProcess: requests.filter(req => req.status === REQUEST_STATUSES.UNDER_PROCESS).length,
    completed: requests.filter(req => req.status === REQUEST_STATUSES.DONE).length,
    rejected: requests.filter(req => req.status === REQUEST_STATUSES.REJECTED).length,
    needJustification: requests.filter(req => req.status === REQUEST_STATUSES.NEED_JUSTIFICATION).length,
    delayed: requests.filter(req => req.isDelayed).length,
  };

  // Calculate statistics for coordinator's assigned requests
  const myStats = {
    assigned: requests.filter(req => req.coordinator === coordinatorName).length,
    total: requests.length,
    assignmentRate: requests.length > 0 ? Math.round((requests.filter(req => req.coordinator === coordinatorName).length / requests.length) * 100) : 0,
    myUnderProcess: requests.filter(req => req.coordinator === coordinatorName && req.status === REQUEST_STATUSES.UNDER_PROCESS).length,
    myCompleted: requests.filter(req => req.coordinator === coordinatorName && req.status === REQUEST_STATUSES.DONE).length,
    myNeedJustification: requests.filter(req => req.coordinator === coordinatorName && req.status === REQUEST_STATUSES.NEED_JUSTIFICATION).length,
  };

  const getFilteredRequests = () => {
    let filtered = requests;

    // Filter by main filter
    switch (filter) {
      case "mine":
        filtered = filtered.filter(req => req.coordinator === coordinatorName);
        break;
      case "process":
        filtered = filtered.filter(req => req.status === REQUEST_STATUSES.UNDER_PROCESS);
        break;
      case "completed":
        filtered = filtered.filter(req => req.status === REQUEST_STATUSES.DONE);
        break;
      case "delayed":
        filtered = filtered.filter(req => req.isDelayed);
        break;
      case "justification":
        filtered = filtered.filter(req => req.status === REQUEST_STATUSES.NEED_JUSTIFICATION);
        break;
      default:
        // Show all requests
        break;
    }

    // Apply additional filters
    if (hospitalFilter && hospitalFilter !== "all") {
      filtered = filtered.filter(req => req.hospital === hospitalFilter);
    }
    if (specialtyFilter && specialtyFilter !== "all") {
      filtered = filtered.filter(req => req.specialty === specialtyFilter);
    }
    if (doctorFilter) {
      filtered = filtered.filter(req => req.doctorName === doctorFilter);
    }

    // Apply date filters
    if (selectedDates.length > 0 || selectedWeeks.length > 0 || selectedMonths.length > 0) {
      filtered = filtered.filter(req => {
        const requestDate = new Date(req.agreedSurgeryDate);
        
        // Check selected specific dates
        if (selectedDates.length > 0) {
          const matchesDate = selectedDates.some(date => 
            date.toDateString() === requestDate.toDateString()
          );
          if (matchesDate) return true;
        }
        
        // Check selected weeks
        if (selectedWeeks.length > 0) {
          const weekNumber = Math.ceil(requestDate.getDate() / 7);
          const weekLabel = `Week ${weekNumber}`;
          if (selectedWeeks.includes(weekLabel)) return true;
        }
        
        // Check selected months
        if (selectedMonths.length > 0) {
          const monthName = requestDate.toLocaleDateString('en-US', { month: 'long' });
          if (selectedMonths.includes(monthName)) return true;
        }
        
        // If no date filters match and we have date filters, exclude this request
        return selectedDates.length === 0 && selectedWeeks.length === 0 && selectedMonths.length === 0;
      });
    }

    return filtered;
  };

  const assignToMe = (requestId: number) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              coordinator: coordinatorName, 
              status: REQUEST_STATUSES.UNDER_PROCESS,
              notifications: [...req.notifications, `Assigned to ${coordinatorName}`]
            }
          : req
      )
    );

    toast({
      title: "Request Assigned",
      description: `Request ${requestId} has been assigned to you`,
    });
  };

  const updateStatus = (requestId: number, newStatus: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { 
          ...req, 
          status: newStatus,
          notifications: [...req.notifications, `Status updated to ${newStatus}`]
        } : req
      )
    );

    toast({
      title: "Status Updated",
      description: `Request ${requestId} status changed to ${newStatus}`,
    });

    // Send notifications to doctor/nurse for certain status changes
    if (newStatus === REQUEST_STATUSES.NOT_COMPLETED) {
      toast({
        title: "Notification Sent",
        description: "Doctor and nurse have been notified about incomplete request",
      });
    }
  };

  const forwardToHospital = (requestId: number) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { 
          ...req, 
          status: REQUEST_STATUSES.UNDER_PROCESS,
          notifications: [...req.notifications, "Request forwarded to hospital"]
        } : req
      )
    );

    toast({
      title: "Request Forwarded",
      description: `Request ${requestId} has been forwarded to the hospital`,
    });
  };

  const exportToExcel = () => {
    console.log("Exporting case coordinator requests to Excel with filters:", { 
      filter, hospitalFilter, specialtyFilter, doctorFilter, selectedDates, selectedWeeks, selectedMonths 
    });
    toast({
      title: "Export Started",
      description: "Excel file generation in progress...",
    });
  };

  const createNewRequest = () => {
    navigate("/create-request");
  };

  const getStatusBadge = (status: string, isDelayed: boolean = false) => {
    const colors = {
      [REQUEST_STATUSES.NEW]: "bg-blue-100 text-blue-800",
      [REQUEST_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800",
      [REQUEST_STATUSES.UNDER_PROCESS]: "bg-orange-100 text-orange-800",
      [REQUEST_STATUSES.PATIENT_CONTACTED]: "bg-purple-100 text-purple-800",
      [REQUEST_STATUSES.SUBMITTED_TO_INSURANCE]: "bg-cyan-100 text-cyan-800",
      [REQUEST_STATUSES.APPROVED_BY_HOSPITAL]: "bg-green-100 text-green-800",
      [REQUEST_STATUSES.DONE]: "bg-green-200 text-green-900",
      [REQUEST_STATUSES.REJECTED]: "bg-red-100 text-red-800",
      [REQUEST_STATUSES.NEED_JUSTIFICATION]: "bg-pink-100 text-pink-800",
      [REQUEST_STATUSES.NOT_COMPLETED]: "bg-gray-100 text-gray-800",
      [REQUEST_STATUSES.DELAYED]: "bg-red-200 text-red-900"
    };
    
    const baseColor = colors[status] || "bg-gray-100 text-gray-800";
    const delayedColor = isDelayed ? "bg-red-200 text-red-900" : baseColor;
    
    return (
      <div className="flex items-center gap-1">
        <span className={`px-2 py-1 rounded text-xs ${delayedColor}`}>
          {status}
        </span>
        {isDelayed && <AlertTriangle className="w-3 h-3 text-red-600" />}
      </div>
    );
  };

  const filteredRequests = getFilteredRequests();

  const handleClearAllDateFilters = () => {
    setSelectedDates([]);
    setSelectedWeeks([]);
    setSelectedMonths([]);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-green-50 flex flex-col items-center p-6 border-r">
        <Logo size="sm" showText={false} className="mb-4" />
        
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold text-green-900">Case Coordinator</h1>
          <p className="text-xs text-green-700">John Smith</p>
        </div>
        
        <Button className="w-full mb-6 bg-green-600 hover:bg-green-700" onClick={createNewRequest}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Request
        </Button>
        
        {/* All Requests Statistics */}
        <div className="w-full mb-4">
          <h3 className="text-sm font-semibold text-green-900 mb-2">All Requests Overview</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-blue-100 rounded px-3 py-2">
              <span className="text-xs text-blue-800">New:</span>
              <span className="font-bold text-sm text-blue-800">{allStats.new}</span>
            </div>
            <div className="flex items-center justify-between bg-yellow-100 rounded px-3 py-2">
              <span className="text-xs text-yellow-800">Pending:</span>
              <span className="font-bold text-sm text-yellow-800">{allStats.pending}</span>
            </div>
            <div className="flex items-center justify-between bg-orange-100 rounded px-3 py-2">
              <span className="text-xs text-orange-800">Under Process:</span>
              <span className="font-bold text-sm text-orange-800">{allStats.underProcess}</span>
            </div>
            <div className="flex items-center justify-between bg-green-100 rounded px-3 py-2">
              <span className="text-xs text-green-800">Completed:</span>
              <span className="font-bold text-sm text-green-800">{allStats.completed}</span>
            </div>
            <div className="flex items-center justify-between bg-red-100 rounded px-3 py-2">
              <span className="text-xs text-red-800">Rejected:</span>
              <span className="font-bold text-sm text-red-800">{allStats.rejected}</span>
            </div>
            <div className="flex items-center justify-between bg-pink-100 rounded px-3 py-2">
              <span className="text-xs text-pink-800">Need Justification:</span>
              <span className="font-bold text-sm text-pink-800">{allStats.needJustification}</span>
            </div>
            <div className="flex items-center justify-between bg-red-200 rounded px-3 py-2">
              <span className="text-xs text-red-900">Delayed:</span>
              <span className="font-bold text-sm text-red-900">{allStats.delayed}</span>
            </div>
          </div>
        </div>

        {/* My Assigned Requests Statistics */}
        <div className="w-full mb-4">
          <h3 className="text-sm font-semibold text-green-900 mb-2">My Assigned Cases</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-purple-100 rounded px-3 py-2">
              <span className="text-xs text-purple-800">Assigned to Me:</span>
              <span className="font-bold text-sm text-purple-800">
                {myStats.assigned}/{myStats.total} ({myStats.assignmentRate}%)
              </span>
            </div>
            <div className="flex items-center justify-between bg-orange-100 rounded px-3 py-2">
              <span className="text-xs text-orange-800">My Under Process:</span>
              <span className="font-bold text-sm text-orange-800">{myStats.myUnderProcess}</span>
            </div>
            <div className="flex items-center justify-between bg-green-100 rounded px-3 py-2">
              <span className="text-xs text-green-800">My Completed:</span>
              <span className="font-bold text-sm text-green-800">{myStats.myCompleted}</span>
            </div>
            <div className="flex items-center justify-between bg-pink-100 rounded px-3 py-2">
              <span className="text-xs text-pink-800">My Need Justification:</span>
              <span className="font-bold text-sm text-pink-800">{myStats.myNeedJustification}</span>
            </div>
          </div>
        </div>

        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 mt-auto border-green-300 text-green-700 hover:bg-green-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {/* Date Range Filter */}
        <div className="flex justify-end p-4 border-b bg-gray-50">
          <DateRangeFilter
            selectedDates={selectedDates}
            selectedWeeks={selectedWeeks}
            selectedMonths={selectedMonths}
            onDateSelect={setSelectedDates}
            onWeekSelect={setSelectedWeeks}
            onMonthSelect={setSelectedMonths}
            onClearAll={handleClearAllDateFilters}
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 p-6 border-b">
          <div className="flex gap-3 flex-wrap">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
                size="sm"
              >
                {f.label}
              </Button>
            ))}
          </div>
          
          {/* Additional Filters */}
          <div className="flex gap-3 flex-wrap">
            <Select value={hospitalFilter} onValueChange={setHhospitalFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Hospital" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hospitals</SelectItem>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={exportToExcel} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {filter === "mine" ? "My Assigned Requests" : 
             filter === "delayed" ? "Delayed Requests" :
             filter === "justification" ? "Requests Needing Justification" :
             "All Requests"}
          </h2>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Surgery Date</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coordinator</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-400 py-6">
                      No requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{req.patientName}</TableCell>
                      <TableCell>{req.idNumber}</TableCell>
                      <TableCell>{req.phone}</TableCell>
                      <TableCell>{req.agreedSurgeryDate}</TableCell>
                      <TableCell>{req.hospital}</TableCell>
                      <TableCell>{req.specialty}</TableCell>
                      <TableCell>{req.doctorName}</TableCell>
                      <TableCell>
                        {getStatusBadge(req.status, req.isDelayed)}
                      </TableCell>
                      <TableCell>{req.coordinator || "Unassigned"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!req.coordinator && (req.status === REQUEST_STATUSES.NEW || req.status === REQUEST_STATUSES.PENDING) ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => assignToMe(req.id)}
                            >
                              Assign to Me
                            </Button>
                          ) : req.coordinator === coordinatorName ? (
                            <div className="flex gap-1">
                              {req.status === REQUEST_STATUSES.UNDER_PROCESS && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => forwardToHospital(req.id)}
                                  >
                                    Forward to Hospital
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => updateStatus(req.id, REQUEST_STATUSES.NOT_COMPLETED)}
                                  >
                                    Mark Incomplete
                                  </Button>
                                </>
                              )}
                              {req.status === REQUEST_STATUSES.NEED_JUSTIFICATION && (
                                <Button 
                                  size="sm" 
                                  onClick={() => updateStatus(req.id, REQUEST_STATUSES.UNDER_PROCESS)}
                                >
                                  Review Justification
                                </Button>
                              )}
                              {req.status === REQUEST_STATUSES.APPROVED_BY_HOSPITAL && (
                                <Button 
                                  size="sm" 
                                  onClick={() => updateStatus(req.id, REQUEST_STATUSES.DONE)}
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
