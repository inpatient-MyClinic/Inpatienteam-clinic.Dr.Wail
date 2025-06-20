import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MessagingIcons from "@/components/messaging/MessagingIcons";
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
  { label: "Survey Sent", key: "sent", color: "bg-green-600", count: 35 },
  { label: "Pending Survey", key: "pending", color: "bg-yellow-500", count: 10 },
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
    surveySent: false,
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
    surveySent: true,
    completionDate: "2025-06-10",
  },
];

const timeFilters = ["All Time", "This Week", "This Month", "Last Month", "This Year"];

export default function CustomerCareDashboard() {
  const [requests, setRequests] = useState(doneRequests);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("All Time");
  const navigate = useNavigate();

  // Calculate unread messages for customer-care role
  const unreadCount = 2; // This would typically come from a hook or API

  const sendSurvey = (requestId: number) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, surveySent: true } : req
      )
    );
    // This would send WhatsApp survey to the patient
    console.log("Sending WhatsApp survey to patient for request:", requestId);
  };

  const exportToExcel = () => {
    console.log("Exporting customer care data to Excel with filter:", selectedTimeFilter);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-[19rem] bg-purple-50 flex flex-col items-center p-6 border-r">
        <div className="text-center mb-6">
          <img 
            src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
            alt="My Clinic Logo" 
            className="h-8 w-auto mx-auto mb-2"
          />
          <h1 className="text-xl font-bold text-purple-900">Customer Care</h1>
          <p className="text-sm text-purple-700">Dashboard</p>
        </div>
        
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

        <Button 
          variant="outline"
          onClick={() => navigate("/role-selection")}
          className="w-full flex items-center gap-2 mt-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roles
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 p-6 border-b bg-white justify-between">
          <Select value={selectedTimeFilter} onValueChange={setSelectedTimeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Time Period" />
            </SelectTrigger>
            <SelectContent>
              {timeFilters.map((filter) => (
                <SelectItem key={filter} value={filter}>
                  {filter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <MessagingIcons currentUserRole="customer-care" unreadCount={unreadCount} />
            <Button onClick={exportToExcel} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Completed Requests - Survey Management</h2>
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
                  <TableHead>Survey Status</TableHead>
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
                        req.surveySent ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {req.surveySent ? "Survey Sent" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!req.surveySent ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendSurvey(req.id)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Send Survey
                        </Button>
                      ) : (
                        <span className="text-green-600 text-sm">✓ Sent</span>
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
