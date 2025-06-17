
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Printer, Search, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusChangeModal from "@/components/StatusChangeModal";

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
      status: "Pending",
      paymentStatus: "Pending",
      createdBy: "Dr. Ahmed Salem",
      assignedDoctor: "Dr. Ahmed Salem"
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
      status: "Done",
      paymentStatus: "Paid",
      createdBy: "Nurse Sara",
      assignedDoctor: "Dr. Ahmed Salem"
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
      status: "New",
      paymentStatus: "Pending",
      createdBy: "Dr. Ahmed Salem",
      assignedDoctor: "Dr. Ahmed Salem"
    }
  ]);

  // Filter to show only requests created by this doctor OR assigned to this doctor
  const currentDoctorName = "Dr. Ahmed Salem";
  const filteredRequests = requests.filter(request => {
    const matchesDoctor = request.createdBy === currentDoctorName || request.assignedDoctor === currentDoctorName;
    const matchesSearch = searchTerm === "" || 
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.serviceDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = hospitalFilter === "" || request.hospital === hospitalFilter;
    
    return matchesDoctor && matchesSearch && matchesHospital;
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
    console.log("Exporting doctor requests to Excel with filters:", { dateFilter, hospitalFilter });
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

  const getStatusBadge = (status: string) => {
    const colors = {
      "New": "bg-blue-100 text-blue-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "Done": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      "Paid": "bg-green-100 text-green-800",
      "Pending": "bg-yellow-100 text-yellow-800",
      "Overdue": "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Create Request Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
            alt="Doctor Portal Logo" 
            className="h-8 w-auto"
          />
          <h1 className="text-2xl font-bold text-blue-900">Doctor Dashboard</h1>
        </div>
        <Button onClick={createNewRequest} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Request
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className={`${stat.color} text-white rounded-lg p-4 flex items-center justify-between`}
          >
            <div>
              <p className="text-sm opacity-90">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Panel */}
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

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 border-b">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-blue-900 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSort('patientName')}
                >
                  Patient Name {sortField === 'patientName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-blue-900 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSort('fileNumber')}
                >
                  File Number {sortField === 'fileNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                  Service Description
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-blue-900 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSort('hospital')}
                >
                  Hospital Name {sortField === 'hospital' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-blue-900 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSort('agreedSurgeryDate')}
                >
                  Surgery Date {sortField === 'agreedSurgeryDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-8">
                    No requests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{req.patientName}</td>
                    <td className="px-4 py-3 text-blue-600 font-mono">{req.fileNumber}</td>
                    <td className="px-4 py-3">{req.serviceDescription}</td>
                    <td className="px-4 py-3">{req.hospital}</td>
                    <td className="px-4 py-3">{req.agreedSurgeryDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadge(req.paymentStatus)}`}>
                        {req.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
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
                            onClick={() => updateStatus(req.id, "Done")}
                          >
                            Complete
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
