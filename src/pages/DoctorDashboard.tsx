
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Printer, Search, Filter, X, Clock, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusChangeModal from "@/components/StatusChangeModal";
import { useToast } from "@/hooks/use-toast";

// Request workflow statuses
const REQUEST_STATUSES = {
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
  { label: "New Requests", key: "new", color: "bg-blue-600", count: 1 },
  { label: "Pending", key: "pending", color: "bg-yellow-500", count: 2 },
  { label: "Rejected", key: "rejected", color: "bg-red-500", count: 0 },
  { label: "Done", key: "done", color: "bg-green-600", count: 2 },
];

const dateFilters = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Quarter", value: "quarter" },
];

const hospitals = [
  "King Fahad Hospital",
  "King Faisal Hospital", 
  "King Khalid Hospital",
  "Prince Sultan Hospital",
  "National Guard Hospital",
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [hospitalFilter, setHospitalFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Sample requests data - includes requests created by doctor AND under doctor's name
  const [requests, setRequests] = useState([
    {
      id: 1,
      patientName: "Ahmed Hassan",
      fileNumber: "F001234", 
      idNumber: "1234567890",
      phone: "+966501234567",
      serviceDescription: "Cardiac Surgery - Bypass",
      agreedSurgeryDate: "2024-01-15",
      hospital: "King Fahad Hospital",
      hospitalMRN: "MRN001",
      expectedRevenue: 15000,
      actualRevenue: 0,
      status: REQUEST_STATUSES.PENDING,
      paymentStatus: "Pending",
      createdBy: "Dr. Ahmed Salem",
      assignedDoctor: "Dr. Ahmed Salem",
      createdAt: "2024-01-10T10:30:00Z",
      attachments: ["medical_report.pdf", "xray_scan.jpg"],
      isDelayed: false,
      notifications: []
    },
    {
      id: 2,
      patientName: "Fatima Ali",
      fileNumber: "F001235",
      idNumber: "0987654321", 
      phone: "+966509876543",
      serviceDescription: "Orthopedic Surgery - Knee Replacement",
      agreedSurgeryDate: "2024-01-20",
      hospital: "King Faisal Hospital",
      hospitalMRN: "MRN002",
      expectedRevenue: 25000,
      actualRevenue: 25000,
      status: REQUEST_STATUSES.DONE,
      paymentStatus: "Paid",
      createdBy: "Nurse Sara",
      assignedDoctor: "Dr. Ahmed Salem", 
      createdAt: "2024-01-08T14:15:00Z",
      attachments: ["consultation_notes.pdf"],
      isDelayed: false,
      notifications: []
    },
    {
      id: 3,
      patientName: "Omar Al-Rashid",
      fileNumber: "F001236",
      idNumber: "1122334455",
      phone: "+966501112233", 
      serviceDescription: "Neurosurgery - Brain Tumor Removal",
      agreedSurgeryDate: "2024-01-25",
      hospital: "King Khalid Hospital",
      hospitalMRN: "MRN003",
      expectedRevenue: 40000,
      actualRevenue: 0,
      status: REQUEST_STATUSES.UNDER_PROCESS,
      paymentStatus: "Pending",
      createdBy: "Dr. Ahmed Salem",
      assignedDoctor: "Dr. Ahmed Salem",
      createdAt: "2024-01-12T09:00:00Z",
      attachments: ["brain_scan.dcm", "medical_history.pdf"],
      isDelayed: true,
      notifications: ["Request forwarded to hospital due to delay"]
    }
  ]);

  // Check for delayed requests (4+ hours during business hours)
  useEffect(() => {
    const checkDelayedRequests = () => {
      const now = new Date();
      const businessStart = 9; // 9 AM
      const businessEnd = 20; // 8 PM
      
      setRequests(prev => prev.map(req => {
        if (req.status === REQUEST_STATUSES.PENDING) {
          const createdTime = new Date(req.createdAt);
          const hoursDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
          
          // Check if it's been 4+ hours during business hours
          const currentHour = now.getHours();
          const isBusinessHours = currentHour >= businessStart && currentHour <= businessEnd;
          
          if (hoursDiff >= 4 && isBusinessHours && !req.isDelayed) {
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

    const interval = setInterval(checkDelayedRequests, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Filter to show only requests created by this doctor OR assigned to this doctor
  const currentDoctorName = "Dr. Ahmed Salem";
  const doctorRequests = requests.filter(request => {
    return request.createdBy === currentDoctorName || request.assignedDoctor === currentDoctorName;
  });

  // Calculate rejection statistics for this doctor
  const rejectedRequests = doctorRequests.filter(req => req.status === REQUEST_STATUSES.REJECTED).length;
  const totalRequests = doctorRequests.length;
  const rejectionRate = totalRequests > 0 ? Math.round((rejectedRequests / totalRequests) * 100) : 0;

  // Update stats to reflect doctor's actual data
  const doctorStats = [
    { label: "New Requests", key: "new", color: "bg-blue-600", 
      count: doctorRequests.filter(req => req.status === REQUEST_STATUSES.PENDING).length },
    { label: "Under Process", key: "process", color: "bg-yellow-500", 
      count: doctorRequests.filter(req => req.status === REQUEST_STATUSES.UNDER_PROCESS).length },
    { label: "Completed", key: "done", color: "bg-green-600", 
      count: doctorRequests.filter(req => req.status === REQUEST_STATUSES.DONE).length },
    { label: "Rejected", key: "rejected", color: "bg-red-500", 
      count: rejectedRequests },
  ];

  const filteredRequests = doctorRequests.filter(request => {
    const matchesSearch = searchTerm === "" || 
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.serviceDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = hospitalFilter === "" || request.hospital === hospitalFilter;
    
    return matchesSearch && matchesHospital;
  });

  const handleStatusChange = (request: any, status: string) => {
    setSelectedRequest(request);
    setNewStatus(status);
    setStatusModalOpen(true);
  };

  const handleStatusConfirm = (reason: string) => {
    if (selectedRequest) {
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: newStatus,
              notifications: [...req.notifications, `Status changed to ${newStatus}. Reason: ${reason}`]
            }
          : req
      ));
      
      toast({
        title: "Status Updated",
        description: `Request ${selectedRequest.id} status changed to ${newStatus}`,
      });

      // If marked as done, trigger post-surgery survey
      if (newStatus === REQUEST_STATUSES.DONE) {
        console.log(`Sending WhatsApp survey link to patient: ${selectedRequest.patientName}`);
        toast({
          title: "Survey Sent",
          description: "Post-surgery survey link sent to patient via WhatsApp",
        });
      }
    }
    setStatusModalOpen(false);
    setSelectedRequest(null);
    setNewStatus("");
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
  };

  const exportToExcel = () => {
    console.log("Exporting doctor requests to Excel with filters:", { dateFilter, hospitalFilter });
    toast({
      title: "Export Started",
      description: "Excel file generation in progress...",
    });
    // Implementation for Excel export would go here
  };

  const printList = () => {
    console.log("Printing current list view");
    window.print();
  };

  const createNewRequest = () => {
    navigate("/create-request");
  };

  const clearFilters = () => {
    setDateFilter("");
    setHospitalFilter("");
    setSearchTerm("");
    setSortField("");
    setSortDirection("asc");
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusBadge = (status: string, isDelayed: boolean = false) => {
    const colors = {
      [REQUEST_STATUSES.PENDING]: "bg-blue-100 text-blue-800",
      [REQUEST_STATUSES.UNDER_PROCESS]: "bg-yellow-100 text-yellow-800",
      [REQUEST_STATUSES.PATIENT_CONTACTED]: "bg-purple-100 text-purple-800",
      [REQUEST_STATUSES.SUBMITTED_TO_INSURANCE]: "bg-orange-100 text-orange-800",
      [REQUEST_STATUSES.APPROVED_BY_HOSPITAL]: "bg-cyan-100 text-cyan-800",
      [REQUEST_STATUSES.DONE]: "bg-green-100 text-green-800",
      [REQUEST_STATUSES.REJECTED]: "bg-red-100 text-red-800",
      [REQUEST_STATUSES.NEED_JUSTIFICATION]: "bg-pink-100 text-pink-800",
      [REQUEST_STATUSES.NOT_COMPLETED]: "bg-gray-100 text-gray-800",
      [REQUEST_STATUSES.DELAYED]: "bg-red-200 text-red-900"
    };
    
    const baseColor = colors[status] || "bg-gray-100 text-gray-800";
    const delayedColor = isDelayed ? "bg-red-200 text-red-900" : baseColor;
    
    return (
      <div className="flex items-center gap-1">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${delayedColor}`}>
          {status}
        </span>
        {isDelayed && <AlertTriangle className="w-3 h-3 text-red-600" />}
      </div>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      "Paid": "bg-green-100 text-green-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "Overdue": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const canUpdateStatus = (request: any) => {
    // Doctor can update status if they created the request or it's assigned to them
    return request.createdBy === currentDoctorName || request.assignedDoctor === currentDoctorName;
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
        <div className="text-center mb-4">
          <img 
            src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
            alt="My Clinic Logo" 
            className="h-8 w-auto mx-auto mb-2"
          />
          <h1 className="text-lg font-bold text-blue-900">Doctor Dashboard</h1>
          <p className="text-xs text-blue-700">{currentDoctorName}</p>
        </div>

        <Button className="w-full mb-8" variant="default" onClick={createNewRequest}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Request
        </Button>
        
        <div className="flex flex-col gap-4 w-full">
          {doctorStats.map((stat) => (
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
            <span className="font-bold text-lg">
              {filteredRequests.filter(req => req.isDelayed).length}
            </span>
          </div>

          {/* Rejection Rate */}
          <div className="flex flex-col gap-1 rounded-lg px-4 py-3 bg-red-100 text-red-800 border border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Rejection Rate:</span>
              <span className="font-bold text-lg">{rejectionRate}%</span>
            </div>
            <div className="text-xs text-red-600">
              {rejectedRequests} rejected out of {totalRequests} total
            </div>
          </div>
        </div>

        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 mt-auto border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-white p-6">
        {/* Filter bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search patients, files, services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {dateFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Hospital Filter */}
            <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>

          {/* Export/Print Options */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={printList} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print List
            </Button>
          </div>
        </div>

        {/* Requests table */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm rounded">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th 
                  className="p-2 cursor-pointer hover:bg-blue-200"
                  onClick={() => handleSort('patientName')}
                >
                  Patient Name {sortField === 'patientName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="p-2 cursor-pointer hover:bg-blue-200"
                  onClick={() => handleSort('fileNumber')}
                >
                  File Number {sortField === 'fileNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2">Service Description</th>
                <th 
                  className="p-2 cursor-pointer hover:bg-blue-200"
                  onClick={() => handleSort('hospital')}
                >
                  Hospital Name {sortField === 'hospital' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="p-2 cursor-pointer hover:bg-blue-200"
                  onClick={() => handleSort('agreedSurgeryDate')}
                >
                  Surgery Date {sortField === 'agreedSurgeryDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2">Status</th>
                <th className="p-2">Payment Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-6">
                    No requests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{req.patientName}</td>
                    <td className="p-2 text-blue-600 font-mono">{req.fileNumber}</td>
                    <td className="p-2">{req.serviceDescription}</td>
                    <td className="p-2">{req.hospital}</td>
                    <td className="p-2">{req.agreedSurgeryDate}</td>
                    <td className="p-2">
                      {getStatusBadge(req.status, req.isDelayed)}
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusBadge(req.paymentStatus)}`}>
                        {req.paymentStatus}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {canUpdateStatus(req) && req.status === REQUEST_STATUSES.PENDING && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(req.id, REQUEST_STATUSES.UNDER_PROCESS)}
                          >
                            Process
                          </Button>
                        )}
                        {canUpdateStatus(req) && req.status === REQUEST_STATUSES.UNDER_PROCESS && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(req, REQUEST_STATUSES.DONE)}
                          >
                            Complete
                          </Button>
                        )}
                        {req.status === REQUEST_STATUSES.NOT_COMPLETED && canUpdateStatus(req) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateStatus(req.id, REQUEST_STATUSES.PENDING)}
                          >
                            Resubmit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <StatusChangeModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusConfirm}
        currentStatus={selectedRequest?.status || ""}
        newStatus={newStatus}
        requestId={selectedRequest?.id || 0}
      />
    </div>
  );
};

export default DoctorDashboard;
