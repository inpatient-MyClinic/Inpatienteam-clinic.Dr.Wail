import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Clock, XCircle, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  { label: "New Requests", key: "new", color: "bg-blue-600", count: 12 },
  { label: "Patient Contacted", key: "contacted", color: "bg-purple-500", count: 8 },
  { label: "Submitted to Insurance", key: "insurance", color: "bg-orange-500", count: 15 },
  { label: "Approved", key: "approved", color: "bg-green-600", count: 25 },
  { label: "Rejected", key: "rejected", color: "bg-red-500", count: 3 },
];

const filters = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year to Date", value: "ytd" },
];

const demoRequests = [
  {
    id: 1,
    patientName: "Nora Mohammed",
    idNumber: "2012345678",
    phone: "0551234567",
    agreedSurgeryDate: "2025-06-25",
    hospital: "King Abdulaziz Hospital",
    specialty: "Cardiology",
    doctorName: "Dr. Ahmed Salem",
    status: REQUEST_STATUSES.UNDER_PROCESS,
    coordinator: "John Smith",
    assignedHospitalStaff: null,
    notifications: [],
    createdAt: "2024-01-10T10:00:00Z"
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
    status: REQUEST_STATUSES.PATIENT_CONTACTED,
    coordinator: "Jane Doe",
    assignedHospitalStaff: "Hospital Admin 1",
    notifications: ["Patient contacted successfully"],
    createdAt: "2024-01-08T14:30:00Z"
  },
  {
    id: 3,
    patientName: "Fatima Ali",
    idNumber: "2014567890",
    phone: "0512345678",
    agreedSurgeryDate: "2025-07-02",
    hospital: "King Abdulaziz Hospital",
    specialty: "Neurosurgery",
    doctorName: "Dr. Mohammed Hassan",
    status: REQUEST_STATUSES.SUBMITTED_TO_INSURANCE,
    coordinator: "John Smith",
    assignedHospitalStaff: "Hospital Admin 2",
    notifications: ["Submitted to insurance provider"],
    createdAt: "2024-01-05T09:15:00Z"
  },
];

export default function HospitalDashboard() {
  const [filter, setFilter] = useState<string | null>(null);
  const [requests, setRequests] = useState(demoRequests);
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentHospitalStaff = "Hospital Admin 1";
  
  // Filter requests for current hospital
  const filteredRequests = requests.filter(request => 
    request.hospital === "King Abdulaziz Hospital" // Current hospital
  );

  const updateStatus = (requestId: number, newStatus: string, notification?: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { 
          ...req, 
          status: newStatus,
          assignedHospitalStaff: currentHospitalStaff,
          notifications: [...req.notifications, notification || `Status updated to ${newStatus}`]
        } : req
      )
    );

    toast({
      title: "Status Updated",
      description: `Request ${requestId} status changed to ${newStatus}`,
    });

    // Send WhatsApp survey for completed surgeries
    if (newStatus === REQUEST_STATUSES.DONE) {
      const request = requests.find(r => r.id === requestId);
      console.log(`Sending WhatsApp survey link to patient: ${request?.patientName}`);
      toast({
        title: "Survey Sent",
        description: "Post-surgery survey link sent to patient via WhatsApp",
      });
    }
  };

  const contactPatient = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.PATIENT_CONTACTED, "Patient successfully contacted");
  };

  const submitToInsurance = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.SUBMITTED_TO_INSURANCE, "Submitted to insurance provider for approval");
  };

  const approveRequest = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.APPROVED_BY_HOSPITAL, "Request approved by hospital");
  };

  const rejectRequest = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.REJECTED, "Request rejected - additional justification required");
    
    // Notify coordinator about rejection
    toast({
      title: "Rejection Notification Sent",
      description: "Coordinator has been notified about the rejection",
    });
  };

  const markSurgeryComplete = (requestId: number) => {
    updateStatus(requestId, REQUEST_STATUSES.DONE, "Surgery completed successfully");
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      [REQUEST_STATUSES.NEW]: "bg-blue-100 text-blue-800",
      [REQUEST_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800",
      [REQUEST_STATUSES.UNDER_PROCESS]: "bg-orange-100 text-orange-800",
      [REQUEST_STATUSES.PATIENT_CONTACTED]: "bg-purple-100 text-purple-800",
      [REQUEST_STATUSES.SUBMITTED_TO_INSURANCE]: "bg-cyan-100 text-cyan-800",
      [REQUEST_STATUSES.APPROVED_BY_HOSPITAL]: "bg-green-100 text-green-800",
      [REQUEST_STATUSES.DONE]: "bg-green-200 text-green-900",
      [REQUEST_STATUSES.REJECTED]: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getActionButtons = (request: any) => {
    switch (request.status) {
      case REQUEST_STATUSES.UNDER_PROCESS:
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => contactPatient(request.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Contact Patient
            </Button>
          </div>
        );
      
      case REQUEST_STATUSES.PATIENT_CONTACTED:
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => submitToInsurance(request.id)}
              className="flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              Submit to Insurance
            </Button>
          </div>
        );
      
      case REQUEST_STATUSES.SUBMITTED_TO_INSURANCE:
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => approveRequest(request.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => rejectRequest(request.id)}
              className="flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Reject
            </Button>
          </div>
        );
      
      case REQUEST_STATUSES.APPROVED_BY_HOSPITAL:
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => markSurgeryComplete(request.id)}
              className="flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Mark Surgery Complete
            </Button>
          </div>
        );
      
      default:
        return (
          <Button size="sm" variant="outline">
            View Details
          </Button>
        );
    }
  };

  const createNewRequest = () => {
    navigate("/create-request");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
        <h1 className="text-xl font-bold mb-4 text-center text-blue-900">Hospital Dashboard</h1>
        
        <Button className="w-full mb-6" variant="default" onClick={createNewRequest}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Request
        </Button>
        
        <div className="flex flex-col gap-4 w-full mb-8">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 ${stat.color} text-white`}
            >
              <span className="text-xs">{stat.label}:</span>
              <span className="font-bold text-lg">{stat.count}</span>
            </div>
          ))}
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
                <th className="p-2">ID Number</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Surgery Date</th>
                <th className="p-2">Specialty</th>
                <th className="p-2">Doctor</th>
                <th className="p-2">Coordinator</th>
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
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{req.patientName}</td>
                    <td className="p-2">{req.idNumber}</td>
                    <td className="p-2">{req.phone}</td>
                    <td className="p-2">{req.agreedSurgeryDate}</td>
                    <td className="p-2">{req.specialty}</td>
                    <td className="p-2">{req.doctorName}</td>
                    <td className="p-2">{req.coordinator}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {getActionButtons(req)}
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
