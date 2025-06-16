
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "New Requests", key: "new", color: "bg-blue-600", count: 12 },
  { label: "Pending", key: "pending", color: "bg-yellow-500", count: 8 },
  { label: "Scheduled", key: "scheduled", color: "bg-purple-500", count: 15 },
  { label: "Completed", key: "completed", color: "bg-green-600", count: 45 },
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
    status: "Scheduled",
  },
  {
    id: 2,
    patientName: "Omar Hassan",
    idNumber: "2018765432",
    phone: "0567890123",
    agreedSurgeryDate: "2025-06-28",
    hospital: "King Abdulaziz Hospital",
    status: "Pending",
  },
  {
    id: 3,
    patientName: "Fatima Ali",
    idNumber: "2014567890",
    phone: "0512345678",
    agreedSurgeryDate: "2025-07-02",
    hospital: "King Abdulaziz Hospital",
    status: "New",
  },
];

export default function HospitalDashboard() {
  const [filter, setFilter] = useState<string | null>(null);
  // For demonstration, filtered list is static.
  const filteredRequests = filter
    ? demoRequests.filter((r) => r.status === "Scheduled")
    : demoRequests;

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
        <Button className="w-full mb-8" variant="default">
          + Create New Request
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
                <th className="p-2"></th>
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
                    <td className="p-2">{req.status}</td>
                    <td className="p-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
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
