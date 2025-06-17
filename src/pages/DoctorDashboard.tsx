
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusChangeModal from "@/components/StatusChangeModal";
import ExportButton from "@/components/ExportButton";

const stats = [
  { label: "New Requests", key: "new", color: "bg-blue-600", count: 1 },
  { label: "Pending", key: "pending", color: "bg-yellow-500", count: 2 },
  { label: "Scheduled", key: "scheduled", color: "bg-purple-500", count: 1 },
  { label: "Completed", key: "completed", color: "bg-green-600", count: 2 },
  { label: "Rejected", key: "rejected", color: "bg-red-500", count: 0 },
];

const filters = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year to Date", value: "ytd" },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  // Sample requests data - includes requests created by doctor AND under doctor's name
  const [requests, setRequests] = useState([
    {
      id: 1,
      patientName: "Ahmed Hassan",
      idNumber: "1234567890",
      phone: "+966501234567",
      agreedSurgeryDate: "2024-01-15",
      hospital: "King Fahad Hospital",
      hospitalMRN: "MRN001",
      expectedRevenue: 15000,
      actualRevenue: 0,
      status: "Pending",
      createdBy: "Dr. Ahmed Salem",
      assignedDoctor: "Dr. Ahmed Salem"
    },
    {
      id: 2,
      patientName: "Fatima Ali",
      idNumber: "0987654321",
      phone: "+966509876543",
      agreedSurgeryDate: "2024-01-20",
      hospital: "King Faisal Hospital",
      hospitalMRN: "MRN002",
      expectedRevenue: 25000,
      actualRevenue: 25000,
      status: "Done",
      createdBy: "Nurse Sara",
      assignedDoctor: "Dr. Ahmed Salem"
    }
  ]);

  // Filter to show only requests created by this doctor OR assigned to this doctor
  const currentDoctorName = "Dr. Ahmed Salem";
  const filteredRequests = requests.filter(request => 
    request.createdBy === currentDoctorName || request.assignedDoctor === currentDoctorName
  );

  const handleStatusChange = (request: any, status: string) => {
    setSelectedRequest(request);
    setNewStatus(status);
    setStatusModalOpen(true);
  };

  const handleStatusConfirm = (reason: string) => {
    if (selectedRequest) {
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: newStatus }
          : req
      ));
      console.log(`Status changed for request ${selectedRequest.id} to ${newStatus}. Reason: ${reason}`);
    }
    setStatusModalOpen(false);
    setSelectedRequest(null);
    setNewStatus("");
  };

  const updateStatus = (requestId: number, newStatus: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  const exportToExcel = () => {
    console.log("Exporting doctor requests to Excel with filter:", filter);
    // Implementation for Excel export would go here
  };

  const createNewRequest = () => {
    navigate("/create-request");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
        <div className="flex items-center gap-2 mb-8">
          <img 
            src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
            alt="Doctor Portal Logo" 
            className="h-8 w-auto"
          />
          <h1 className="text-xl font-bold text-blue-900">Doctor Dashboard</h1>
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
        </div>
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
        <div className="overflow-x-auto">
          <table className="w-full border text-sm rounded">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="p-2">Patient Name</th>
                <th className="p-2">ID Number</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Agreed Date of Surgery</th>
                <th className="p-2">Hospital</th>
                <th className="p-2">Status</th>
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
                    <td className="p-2">{req.idNumber}</td>
                    <td className="p-2">{req.phone}</td>
                    <td className="p-2">{req.agreedSurgeryDate}</td>
                    <td className="p-2">{req.hospital}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        req.status === "Under Process" ? "bg-blue-100 text-blue-800" :
                        req.status === "Approved" ? "bg-green-100 text-green-800" :
                        req.status === "Done" ? "bg-purple-100 text-purple-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {req.status === "Pending" && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(req.id, "Under Process")}
                          >
                            Process
                          </Button>
                        )}
                        {req.status === "Under Process" && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(req.id, "Approved")}
                          >
                            Approve
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
