
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Clock, AlertTriangle, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  const [hospitalFilter, setHospitalFilter] = useState<string>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("");
  const [requests, setRequests] = useState(allRequests);
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
      filter, hospitalFilter, specialtyFilter, doctorFilter 
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
  const delayedCount = requests.filter(req => req.isDelayed).length;
  const justificationCount = requests.filter(req => req.status === REQUEST_STATUSES.NEED_JUSTIFICATION).length;

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-green-50 flex flex-col items-center p-6 border-r">
        <h1 className="text-xl font-bold mb-6 text-center">Case Coordinator</h1>
        
        <Button className="w-full mb-6 bg-green-600 hover:bg-green-700" onClick={createNewRequest}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Request
        </Button>
        
        <div className="flex flex-col gap-4 w-full mb-6">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 ${stat.color} text-white`}
            >
              <span className="text-xs">{stat.label}:</span>
              <span className="font-bold text-lg">{stat.count}</span>
            </div>
          ))}
          
          {/* Delayed Requests Counter */}
          <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-red-600 text-white">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Delayed:</span>
            <span className="font-bold text-lg">{delayedCount}</span>
          </div>
          
          {/* Need Justification Counter */}
          <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-pink-600 text-white">
            <Bell className="w-4 h-4" />
            <span className="text-xs">Need Justification:</span>
            <span className="font-bold text-lg">{justificationCount}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
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
            <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
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
