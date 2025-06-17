
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusChangeModal from "@/components/StatusChangeModal";
import RequestCard from "@/components/RequestCard";
import ExportButton from "@/components/ExportButton";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState("");

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
      createdBy: "Dr. Ahmed Salem", // This request was created by this doctor
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
      createdBy: "Nurse Sara", // This request was created by nurse but assigned to this doctor
      assignedDoctor: "Dr. Ahmed Salem"
    }
  ]);

  // Filter to show only requests created by this doctor OR assigned to this doctor
  const currentDoctorName = "Dr. Ahmed Salem"; // This would come from auth context
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
            alt="Doctor Portal Logo" 
            className="h-12 w-auto"
          />
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Requests created by you or assigned to you</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/create-request")} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Request
          </Button>
          <ExportButton requests={filteredRequests} />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onStatusChange={handleStatusChange}
          />
        ))}
        {filteredRequests.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No requests found. Create your first request or wait for assignments.</p>
          </div>
        )}
      </div>

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
