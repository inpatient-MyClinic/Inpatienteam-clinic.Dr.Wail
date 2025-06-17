
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

  // Sample requests data with complete structure
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
      status: "Pending"
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
      status: "Done"
    }
  ]);

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
          <h1 className="text-3xl font-bold text-blue-900">Doctor Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/create-request")} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Request
          </Button>
          <ExportButton requests={requests} />
        </div>
      </div>

      <div className="grid gap-6">
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onStatusChange={handleStatusChange}
          />
        ))}
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
