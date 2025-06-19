
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Clock, AlertTriangle, ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [justificationText, setJustificationText] = useState("");
  
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
      assignedDoctor: "Dr. Ahmed Salem", // Current doctor
      createdAt: "2024-01-10T11:00:00Z",
      originalRequest: "Patient requires cardiac bypass surgery due to severe coronary artery disease.",
      justificationNeeded: false
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
      justificationNeeded: true
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
      justificationNeeded: false
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
      justificationNeeded: false
    }
  ]);

  const currentDoctorName = "Dr. Ahmed Salem";

  // Doctor's hospital privileges
  const doctorPrivileges = [
    "King Khaled Hospital",
    "King Abdulaziz Hospital", 
    "King Faisal Hospital",
    "Prince Sultan Hospital"
  ];

  // Filter requests by selected statuses
  const filteredRequests = requests.filter(request => {
    if (selectedStatuses.length === 0) return true;
    return selectedStatuses.includes(request.status);
  });

  // Analytics calculations
  const totalRequests = requests.length;
  const doneRequests = requests.filter(req => req.status === REQUEST_STATUSES.DONE).length;
  const rejectedRequests = requests.filter(req => req.status === REQUEST_STATUSES.REJECTED).length;
  const conversionRate = totalRequests > 0 ? ((doneRequests / totalRequests) * 100).toFixed(1) : 0;
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : 0;

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

  const exportToExcel = () => {
    console.log("Exporting doctor requests to Excel with filter:", filter);
    toast({
      title: "Export Started",
      description: "Excel file generation in progress...",
    });
  };

  const createNewRequest = () => {
    navigate("/create-request");
  };

  const submitJustification = (requestId: number) => {
    if (!justificationText.trim()) {
      toast({
        title: "Error",
        description: "Please provide justification text",
        variant: "destructive"
      });
      return;
    }

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

    setJustificationText("");
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
        
        <div className="flex flex-col gap-2 w-full mb-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Filter by Status:</p>
          {stats.map((stat) => (
            <div
              key={stat.key}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 cursor-pointer transition-opacity ${
                selectedStatuses.length === 0 || selectedStatuses.includes(stat.label) 
                  ? stat.color 
                  : stat.color + ' opacity-50'
              } text-white`}
              onClick={() => handleStatusClick(stat.label)}
            >
              <span className="text-xs">{stat.label}:</span>
              <span className="font-bold text-lg">{stat.count}</span>
            </div>
          ))}
          
          {selectedStatuses.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearStatusFilter}
              className="mt-2"
            >
              Clear Filter
            </Button>
          )}
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
          <Button onClick={exportToExcel} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
        
        {/* Requests table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border text-sm rounded">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="p-2">Patient Name</th>
                <th className="p-2">MRN</th>
                <th className="p-2">Service Description</th>
                <th className="p-2">Hospital</th>
                <th className="p-2">Status</th>
                <th className="p-2">Payment Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-6">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b">
                    <td className="p-2">{req.patientName}</td>
                    <td className="p-2">{req.mrn}</td>
                    <td className="p-2">{req.serviceDescription}</td>
                    <td className="p-2">{req.hospital}</td>
                    <td className="p-2">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="p-2">
                      {getPaymentStatusBadge(req.paymentStatus)}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {req.status === REQUEST_STATUSES.NEED_JUSTIFICATION ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Add Justification
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Add Justification for {req.patientName}</DialogTitle>
                                <DialogDescription>
                                  Review the original request and provide additional justification
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Original Request</Label>
                                  <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                                    {req.originalRequest}
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="justification">Additional Justification</Label>
                                  <Textarea
                                    id="justification"
                                    placeholder="Provide additional medical justification for this request..."
                                    value={justificationText}
                                    onChange={(e) => setJustificationText(e.target.value)}
                                    className="mt-1"
                                    rows={4}
                                  />
                                </div>
                                <Button 
                                  onClick={() => submitJustification(req.id)}
                                  className="w-full"
                                  disabled={!justificationText.trim()}
                                >
                                  Submit Justification
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
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

        {/* Hospital Privileges */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Hospital Privileges</CardTitle>
            <CardDescription>Hospitals where you have active privileges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {doctorPrivileges.map((hospital, index) => (
                <Badge key={index} variant="secondary" className="justify-center p-2">
                  {hospital}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Performance metrics for your requests</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Conversion Rate</h3>
              <p className="text-4xl font-bold text-green-600">{conversionRate}%</p>
              <p className="text-sm text-gray-500">
                ({doneRequests} done / {totalRequests} total requests)
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Rejection Rate</h3>
              <p className="text-4xl font-bold text-red-600">{rejectionRate}%</p>
              <p className="text-sm text-gray-500">
                ({rejectedRequests} rejected / {totalRequests} total requests)
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
