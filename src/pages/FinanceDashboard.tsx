
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const stats = [
  { label: "Total Done", key: "total", color: "bg-blue-600", count: 45 },
  { label: "Paid", key: "paid", color: "bg-green-600", count: 30 },
  { label: "Unpaid", key: "unpaid", color: "bg-red-500", count: 15 },
];

// Sample done requests data
const doneRequests = [
  {
    id: 1,
    patientName: "Nora Mohammed",
    idNumber: "2012345678",
    phone: "0551234567",
    hospitalMRN: "MRN001234",
    hospitalName: "King Abdulaziz Hospital",
    procedure: "Cardiac Surgery",
    treatingDoctor: "Dr. Ahmed Al-Rashid",
    isPaid: false,
    completionDate: "2025-06-15",
  },
  {
    id: 2,
    patientName: "Omar Hassan",
    idNumber: "2018765432",
    phone: "0567890123",
    hospitalMRN: "MRN005678",
    hospitalName: "Prince Sultan Hospital",
    procedure: "Orthopedic Surgery",
    treatingDoctor: "Dr. Sarah Al-Mahmoud",
    isPaid: true,
    completionDate: "2025-06-10",
  },
  {
    id: 3,
    patientName: "Fatima Ali",
    idNumber: "2014567890",
    phone: "0512345678",
    hospitalMRN: "MRN009876",
    hospitalName: "King Faisal Hospital",
    procedure: "General Surgery",
    treatingDoctor: "Dr. Mohammed Al-Zahra",
    isPaid: false,
    completionDate: "2025-06-08",
  },
];

const hospitals = ["All Hospitals", "King Abdulaziz Hospital", "Prince Sultan Hospital", "King Faisal Hospital"];
const months = ["All Months", "January", "February", "March", "April", "May", "June"];
const years = ["2025", "2024", "2023"];

export default function FinanceDashboard() {
  const [requests, setRequests] = useState(doneRequests);
  const [selectedHospital, setSelectedHospital] = useState("All Hospitals");
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [selectedYear, setSelectedYear] = useState("2025");

  const markAsPaid = (requestId: number) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, isPaid: true } : req
      )
    );
  };

  const exportToExcel = () => {
    // This would export the filtered data to Excel
    console.log("Exporting to Excel with filters:", {
      hospital: selectedHospital,
      month: selectedMonth,
      year: selectedYear
    });
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
        <h1 className="text-xl font-bold mb-6 text-center">Finance Dashboard</h1>
        
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
        <div className="flex flex-wrap gap-3 p-6 border-b">
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Hospital" />
            </SelectTrigger>
            <SelectContent>
              {hospitals.map((hospital) => (
                <SelectItem key={hospital} value={hospital}>
                  {hospital}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={exportToExcel} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>

        {/* Requests Table */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Completed Requests</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Hospital MRN</TableHead>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Treating Doctor</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.patientName}</TableCell>
                    <TableCell>{req.idNumber}</TableCell>
                    <TableCell>{req.phone}</TableCell>
                    <TableCell>{req.hospitalMRN}</TableCell>
                    <TableCell>{req.hospitalName}</TableCell>
                    <TableCell>{req.procedure}</TableCell>
                    <TableCell>{req.treatingDoctor}</TableCell>
                    <TableCell>{req.completionDate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {req.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!req.isPaid ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsPaid(req.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Mark Paid
                        </Button>
                      ) : (
                        <span className="text-green-600 text-sm">✓ Paid</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
