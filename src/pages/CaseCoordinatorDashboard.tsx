import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  { label: "All Requests", key: "all", color: "bg-blue-600", count: 25 },
  { label: "My Requests", key: "mine", color: "bg-green-600", count: 8 },
  { label: "Under Process", key: "process", color: "bg-yellow-500", count: 12 },
  { label: "Completed", key: "completed", color: "bg-purple-500", count: 45 },
];

const filters = [
  { label: "All Requests", value: "all" },
  { label: "My Name", value: "mine" },
  { label: "Under Process", value: "process" },
  { label: "Completed", value: "completed" },
];

// Sample data - in real app this would come from a database
const allRequests = [
  {
    id: 1,
    patientName: "Nora Mohammed",
    idNumber: "2012345678",
    phone: "0551234567",
    agreedSurgeryDate: "2025-06-25",
    hospital: "King Abdulaziz Hospital",
    status: "New",
    coordinator: null,
  },
  {
    id: 2,
    patientName: "Omar Hassan",
    idNumber: "2018765432",
    phone: "0567890123",
    agreedSurgeryDate: "2025-06-28",
    hospital: "King Abdulaziz Hospital",
    status: "New",
    coordinator: null,
  },
  {
    id: 3,
    patientName: "Fatima Ali",
    idNumber: "2014567890",
    phone: "0512345678",
    agreedSurgeryDate: "2025-07-02",
    hospital: "Prince Sultan Hospital",
    status: "Under Process",
    coordinator: "John Smith",
  },
  {
    id: 4,
    patientName: "Ahmed Al-Rashid",
    idNumber: "2019876543",
    phone: "0523456789",
    agreedSurgeryDate: "2025-07-05",
    hospital: "King Faisal Hospital",
    status: "New",
    coordinator: null,
  },
];

const myRequests = [
  {
    id: 3,
    patientName: "Fatima Ali",
    idNumber: "2014567890",
    phone: "0512345678",
    agreedSurgeryDate: "2025-07-02",
    hospital: "Prince Sultan Hospital",
    status: "Under Process",
    coordinator: "John Smith",
  },
];

export default function CaseCoordinatorDashboard() {
  const [filter, setFilter] = useState<string>("all");
  const [requests, setRequests] = useState(allRequests);
  const navigate = useNavigate();
  const coordinatorName = "John Smith"; // This would come from auth context

  const getFilteredRequests = () => {
    switch (filter) {
      case "mine":
        return requests.filter(req => req.coordinator === coordinatorName);
      case "process":
        return requests.filter(req => req.status === "Under Process");
      case "completed":
        return requests.filter(req => req.status === "Completed");
      default:
        return requests;
    }
  };

  const assignToMe = (requestId: number) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, coordinator: coordinatorName, status: "Under Process" }
          : req
      )
    );
  };

  const updateStatus = (requestId: number, newStatus: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  const exportToExcel = () => {
    console.log("Exporting case coordinator requests to Excel with filter:", filter);
    // Implementation for Excel export would go here
  };

  const createNewRequest = () => {
    navigate("/create-request");
  };

  const filteredRequests = getFilteredRequests();
  const leftSideRequests = filter === "mine" ? myRequests : allRequests;
  const rightSideRequests = filter === "mine" ? requests.filter(req => req.coordinator === coordinatorName) : [];

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-green-50 flex flex-col items-center p-6 border-r">
        <h1 className="text-xl font-bold mb-6 text-center">Case Coordinator</h1>
        
        <Button className="w-full mb-6 bg-green-600 hover:bg-green-700" onClick={createNewRequest}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Request
        </Button>
        
        <div className="flex flex-col gap-4 w-full mb-6">
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

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 p-6 border-b justify-end">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              onClick={() => setFilter(f.value)}
              size="sm"
            >
              {f.label}
            </Button>
          ))}
          <Button onClick={exportToExcel} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>

        <div className="flex h-full">
          {/* Left Side - All Requests or My Requests List */}
          <div className="flex-1 p-6 border-r">
            <h2 className="text-lg font-semibold mb-4">
              {filter === "mine" ? "My Assigned Requests" : "All Requests"}
            </h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Surgery Date</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Coordinator</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leftSideRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-400 py-6">
                        No requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    leftSideRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>{req.patientName}</TableCell>
                        <TableCell>{req.idNumber}</TableCell>
                        <TableCell>{req.phone}</TableCell>
                        <TableCell>{req.agreedSurgeryDate}</TableCell>
                        <TableCell>{req.hospital}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            req.status === "New" ? "bg-blue-100 text-blue-800" :
                            req.status === "Under Process" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {req.status}
                          </span>
                        </TableCell>
                        <TableCell>{req.coordinator || "Unassigned"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!req.coordinator && req.status === "New" ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => assignToMe(req.id)}
                              >
                                Assign to Me
                              </Button>
                            ) : req.coordinator === coordinatorName && req.status === "Under Process" ? (
                              <Button 
                                size="sm" 
                                onClick={() => updateStatus(req.id, "Completed")}
                              >
                                Complete
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right Side - Filtered Requests (when filtering by "My Name") */}
          {filter === "mine" && (
            <div className="flex-1 p-6">
              <h2 className="text-lg font-semibold mb-4">My Active Requests</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Surgery Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rightSideRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-400 py-6">
                          No requests assigned to you.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rightSideRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{req.patientName}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                              {req.status}
                            </span>
                          </TableCell>
                          <TableCell>{req.agreedSurgeryDate}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
