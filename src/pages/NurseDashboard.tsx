
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Clock, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ExportButton from "@/components/ExportButton";

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
  { label: "New Requests", key: "new", color: "bg-blue-600", count: 2 },
  { label: "Pending", key: "pending", color: "bg-yellow-500", count: 5 },
  { label: "Scheduled", key: "scheduled", color: "bg-purple-500", count: 1 },
  { label: "Completed", key: "completed", color: "bg-green-600", count: 3 },
  { label: "Rejected", key: "rejected", color: "bg-red-500", count: 0 },
];

const filters = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year to Date", value: "ytd" },
];

export default function NurseDashboard() {
  const [filter, setFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Sample requests - nurse can only see requests they created
  const [requests, setRequests] = useState([
    {
      id: 1,
      patientName: "Layla Hasan",
      mrn: "2019988776", // Changed from idNumber to mrn for consistency
      serviceDescription: "Cardiac Surgery - Valve Replacement", // Added service description
      hospital: "King Khaled Hospital", // Made consistent with doctor format
      status: REQUEST_STATUSES.PENDING,
      paymentStatus: "Pending", // Added payment status
      assignedDoctor: "Dr. Ahmed Salem",
      createdAt: "2024-01-10T11:00:00Z",
      phone: "0554447777",
      expectedSurgeryDate: "2025-07-12", // Changed from agreedSurgeryDate
      createdBy: "Nurse Sara", // Current nurse
      attachments: ["patient_records.pdf"],
      isDelayed: false,
      notifications: []
    },
    {
      id: 2,
      patientName: "Khaled Ali",
      mrn: "2015566778", // Changed from idNumber to mrn for consistency
      serviceDescription: "Orthopedic Surgery - Hip Replacement", // Added service description
      hospital: "King Abdulaziz Hospital", // Made consistent with doctor format
      status: REQUEST_STATUSES.NOT_COMPLETED,
      paymentStatus: "Pending", // Added payment status
      assignedDoctor: "Dr. Mohammed Ali",
      createdAt: "2024-01-09T15:30:00Z",
      phone: "0508889992",
      expectedSurgeryDate: "2025-07-14", // Changed from agreedSurgeryDate
      createdBy: "Nurse Sara", // Current nurse
      attachments: [],
      isDelayed: false,
      notifications: ["Request marked as incomplete by coordinator - additional documentation required"]
    },
  ]);

  const currentNurseName = "Nurse Sara";

  // Check for delayed requests
  useEffect(() => {
    const checkDelayedRequests = () => {
      const now = new Date();
      const businessStart = 9; // 9 AM
      const businessEnd = 20; // 8 PM
      
      setRequests(prev => prev.map(req => {
        if (req.status === REQUEST_STATUSES.PENDING) {
          const createdTime = new Date(req.createdAt);
          const hoursDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
          
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

    const interval = setInterval(checkDelayedRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter to show only requests created by this nurse
  const filteredRequests = requests.filter(request => 
    request.createdBy === currentNurseName
  );

  // Check if there are active filters
  const hasActiveFilters = Boolean(filter);

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
    console.log("Exporting nurse requests to Excel with filter:", filter);
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
        <span className={`px-2 py-1 rounded text-xs ${delayedColor}`}>
          {status}
        </span>
        {isDelayed && <AlertTriangle className="w-3 h-3 text-red-600" />}
      </div>
    );
  };

  // Handle notifications for incomplete requests
  useEffect(() => {
    const incompleteRequests = requests.filter(req => req.status === REQUEST_STATUSES.NOT_COMPLETED);
    incompleteRequests.forEach(req => {
      toast({
        title: "Action Required",
        description: `Request ${req.id} for ${req.patientName} needs completion`,
        variant: "destructive",
      });
    });
  }, [requests, toast]);

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
          <h1 className="text-lg font-bold text-blue-900">Nurse Dashboard</h1>
          <p className="text-xs text-blue-700">{currentNurseName}</p>
        </div>

        <Button className="w-full mb-8" variant="default" onClick={createNewRequest}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Request
        </Button>
        <div className="flex flex-col gap-4 w-full">
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
            <span className="font-bold text-lg">
              {filteredRequests.filter(req => req.isDelayed).length}
            </span>
          </div>
          
          {/* Incomplete Requests Counter */}
          <div className="flex items-center gap-2 rounded-lg px-4 py-2 bg-orange-600 text-white">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Incomplete:</span>
            <span className="font-bold text-lg">
              {filteredRequests.filter(req => req.status === REQUEST_STATUSES.NOT_COMPLETED).length}
            </span>
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
        {/* Export Button */}
        <div className="mb-4 flex justify-end">
          <ExportButton 
            requests={requests}
            filteredRequests={filteredRequests}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6 justify-end">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              onClick={() => setFilter(filter === f.value ? null : f.value)}
              size="sm"
            >
              {f.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter(null)}
            className="ml-2"
            disabled={!filter}
          >
            Clear Filter
          </Button>
        </div>
        
        {/* Requests table */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm rounded">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="p-2">Patient Name</th>
                <th className="p-2">MRN</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Service Description</th>
                <th className="p-2">Expected Surgery Date</th>
                <th className="p-2">Hospital</th>
                <th className="p-2">Assigned Doctor</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-gray-400 py-6">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b">
                    <td className="p-2">{req.patientName}</td>
                    <td className="p-2">{req.mrn}</td>
                    <td className="p-2">{req.phone}</td>
                    <td className="p-2">{req.serviceDescription}</td>
                    <td className="p-2">{req.expectedSurgeryDate}</td>
                    <td className="p-2">{req.hospital}</td>
                    <td className="p-2">{req.assignedDoctor}</td>
                    <td className="p-2">
                      {getStatusBadge(req.status, req.isDelayed)}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {req.status === REQUEST_STATUSES.NOT_COMPLETED && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(req.id, REQUEST_STATUSES.PENDING)}
                          >
                            Complete & Resubmit
                          </Button>
                        )}
                        {req.status === REQUEST_STATUSES.PENDING && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateStatus(req.id, REQUEST_STATUSES.UNDER_PROCESS)}
                          >
                            Process
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
    </div>
  );
}
