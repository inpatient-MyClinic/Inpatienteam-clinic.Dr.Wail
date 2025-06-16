
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileExcel } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const demoRequests = [
  {
    id: 1,
    patientName: "Layla Hasan",
    idNumber: "2019988776",
    phone: "0554447777",
    agreedSurgeryDate: "2025-07-12",
    hospital: "King Khaled",
    status: "Submitted",
  },
  {
    id: 2,
    patientName: "Khaled Ali",
    idNumber: "2015566778",
    phone: "0508889992",
    agreedSurgeryDate: "2025-07-14",
    hospital: "King Abdulaziz",
    status: "Under Process",
  },
];

export default function NurseDashboard() {
  const [filter, setFilter] = useState<string | null>(null);
  const [requests, setRequests] = useState(demoRequests);
  const navigate = useNavigate();

  const filteredRequests = filter
    ? requests.filter((r) => r.status === "Pending")
    : requests;

  const updateStatus = (requestId: number, newStatus: string) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  };

  const exportToExcel = () => {
    console.log("Exporting nurse requests to Excel with filter:", filter);
    // Implementation for Excel export would go here
  };

  const createNewRequest = () => {
    navigate("/create-request");
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
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
            <FileExcel className="w-4 h-4 mr-2" />
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
                        req.status === "Submitted" ? "bg-blue-100 text-blue-800" :
                        req.status === "Under Process" ? "bg-yellow-100 text-yellow-800" :
                        req.status === "Scheduled" ? "bg-purple-100 text-purple-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        {req.status === "Submitted" && (
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
                            onClick={() => updateStatus(req.id, "Ready")}
                          >
                            Mark Ready
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
