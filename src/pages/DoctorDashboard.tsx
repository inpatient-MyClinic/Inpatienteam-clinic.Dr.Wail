
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusChangeModal from "@/components/StatusChangeModal";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Under Process": return "bg-blue-100 text-blue-800";
      case "Approved": return "bg-green-100 text-green-800";
      case "Done": return "bg-purple-100 text-purple-800";
      case "Need More Justification": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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

  const exportToExcel = () => {
    const headers = ["Patient Name", "ID Number", "Phone", "Surgery Date", "Hospital", "Status", "Expected Revenue", "Actual Revenue"];
    const csvContent = [
      headers.join(","),
      ...requests.map(req => [
        req.patientName,
        req.idNumber,
        req.phone,
        req.agreedSurgeryDate,
        req.hospital,
        req.status,
        req.expectedRevenue,
        req.actualRevenue || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "doctor_requests.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-900">Doctor Dashboard</h1>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/create-request")} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Request
          </Button>
          <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {requests.map((request) => (
          <Card key={request.id} className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-900">
                  Request #{request.id} - {request.patientName}
                </CardTitle>
                <Badge className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Patient ID</p>
                  <p className="font-medium">{request.idNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{request.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Surgery Date</p>
                  <p className="font-medium">{request.agreedSurgeryDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hospital</p>
                  <p className="font-medium">{request.hospital}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hospital MRN</p>
                  <p className="font-medium">{request.hospitalMRN}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Revenue</p>
                  <p className="font-medium">{request.expectedRevenue ? `${request.expectedRevenue.toLocaleString()} SAR` : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {request.status === "Pending" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(request, "Under Process")}
                  >
                    Move to Under Process
                  </Button>
                )}
                {request.status === "Under Process" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(request, "Approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(request, "Pending")}
                    >
                      Back to Pending
                    </Button>
                  </>
                )}
                {request.status === "Approved" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(request, "Done")}
                    >
                      Mark as Done
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(request, "Need More Justification")}
                    >
                      Need More Justification
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
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
