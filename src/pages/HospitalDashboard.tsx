import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Clock, XCircle, Plus, ArrowLeft, TrendingUp, Timer } from "lucide-react";
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
    createdAt: "2024-01-10T10:00:00Z",
    patientContactedAt: null,
    approvedAt: null
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
    createdAt: "2024-01-08T14:30:00Z",
    patientContactedAt: "2024-01-09T10:15:00Z",
    approvedAt: null
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
    status: REQUEST_STATUSES.APPROVED_BY_HOSPITAL,
    coordinator: "John Smith",
    assignedHospitalStaff: "Hospital Admin 2",
    notifications: ["Submitted to insurance provider", "Request approved by hospital"],
    createdAt: "2024-01-05T09:15:00Z",
    patientContactedAt: "2024-01-06T11:30:00Z",
    approvedAt: "2024-01-10T16:45:00Z"
  },
  {
    id: 4,
    patientName: "Ahmed Khalil",
    idNumber: "2016789012",
    phone: "0523456789",
    agreedSurgeryDate: "2025-07-05",
    hospital: "King Abdulaziz Hospital",
    specialty: "General Surgery",
    doctorName: "Dr. Layla Hassan",
    status: REQUEST_STATUSES.DONE,
    coordinator: "Jane Doe",
    assignedHospitalStaff: "Hospital Admin 1",
    notifications: ["Patient contacted successfully", "Request approved by hospital", "Surgery completed successfully"],
    createdAt: "2024-01-03T08:00:00Z",
    patientContactedAt: "2024-01-04T09:30:00Z",
    approvedAt: "2024-01-08T14:20:00Z"
  }
];

export default function HospitalDashboard() {
  const [filter, setFilter] = useState<string | null>(null);
  const [requests, setRequests] = useState(demoRequests);
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentHospitalStaff = "Hospital Admin 1";
  const currentHospital = "King Abdulaziz Hospital";
  
  // Filter requests for current hospital
  const filteredRequests = requests.filter(request => 
    request.hospital === currentHospital
  );

  // Calculate lead time metrics for current hospital only
  const leadTimeMetrics = useMemo(() => {
    const hospitalRequests = requests.filter(req => req.hospital === currentHospital);
    
    // Patient Contact Lead Time (from creation to patient contacted)
    const contactLeadTimes = hospitalRequests
      .filter(req => req.patientContactedAt)
      .map(req => {
        const created = new Date(req.createdAt);
        const contacted = new Date(req.patientContactedAt!);
        return (contacted.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      });

    // Approval Lead Time (from creation to approval)
    const approvalLeadTimes = hospitalRequests
      .filter(req => req.approvedAt)
      .map(req => {
        const created = new Date(req.createdAt);
        const approved = new Date(req.approvedAt!);
        return (approved.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
      });

    const avgContactLeadTime = contactLeadTimes.length > 0 
      ? contactLeadTimes.reduce((a, b) => a + b, 0) / contactLeadTimes.length 
      : 0;

    const avgApprovalLeadTime = approvalLeadTimes.length > 0 
      ? approvalLeadTimes.reduce((a, b) => a + b, 0) / approvalLeadTimes.length 
      : 0;

    const contactRate = hospitalRequests.length > 0 
      ? (contactLeadTimes.length / hospitalRequests.length) * 100 
      : 0;

    const approvalRate = hospitalRequests.length > 0 
      ? (approvalLeadTimes.length / hospitalRequests.length) * 100 
      : 0;

    return {
      avgContactLeadTime: Math.round(avgContactLeadTime),
      avgApprovalLeadTime: Math.round(avgApprovalLeadTime),
      contactRate: Math.round(contactRate),
      approvalRate: Math.round(approvalRate),
      totalRequests: hospitalRequests.length
    };
  }, [requests, currentHospital]);

  const updateStatus = (requestId: number, newStatus: string, notification?: string) => {
    const now = new Date().toISOString();
    
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { 
          ...req, 
          status: newStatus,
          assignedHospitalStaff: currentHospitalStaff,
          notifications: [...req.notifications, notification || `Status updated to ${newStatus}`],
          patientContactedAt: newStatus === REQUEST_STATUSES.PATIENT_CONTACTED ? now : req.patientContactedAt,
          approvedAt: newStatus === REQUEST_STATUSES.APPROVED_BY_HOSPITAL ? now : req.approvedAt
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
        <p className="text-sm text-blue-700 mb-4">{currentHospital}</p>
        
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
        {/* Hospital Lead Time Performance */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Hospital Lead Time Performance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-600" />
                  Avg Contact Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {leadTimeMetrics.avgContactLeadTime}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Time to contact patient
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  Avg Approval Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {leadTimeMetrics.avgApprovalLeadTime}h
                </div>
                <p className="text-xs text-muted-foreground">
                  Time to approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  Contact Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {leadTimeMetrics.contactRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Patients contacted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  Approval Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {leadTimeMetrics.approvalRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Requests approved
                </p>
              </CardContent>
            </Card>
          </div>
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
