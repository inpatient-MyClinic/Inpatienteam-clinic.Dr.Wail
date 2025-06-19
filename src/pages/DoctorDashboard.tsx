import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Clock, TrendingUp, Users, Plus, Search, Filter, CheckCircle, AlertCircle, XCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoctorPrivilegeView from "@/components/DoctorPrivilegeView";

const REQUEST_STATUSES = ["Pending", "In Progress", "Completed", "Rejected"];

type Request = {
  id: string;
  title: string;
  date: string;
  time: string;
  status: string;
  description: string;
};

const mockRequests: Request[] = [
  {
    id: "1",
    title: "Medication Refill",
    date: "2024-07-15",
    time: "10:00 AM",
    status: "Pending",
    description: "Request for a refill of Lisinopril 20mg."
  },
  {
    id: "2",
    title: "Lab Results Review",
    date: "2024-07-14",
    time: "02:30 PM",
    status: "In Progress",
    description: "Review of recent blood test results."
  },
  {
    id: "3",
    title: "Appointment Scheduling",
    date: "2024-07-16",
    time: "11:15 AM",
    status: "Completed",
    description: "Schedule a follow-up appointment with the patient."
  },
  {
    id: "4",
    title: "Referral Request",
    date: "2024-07-17",
    time: "09:45 AM",
    status: "Rejected",
    description: "Request to refer patient to a cardiologist."
  },
  {
    id: "5",
    title: "Medical Report Update",
    date: "2024-07-18",
    time: "03:00 PM",
    status: "Pending",
    description: "Update patient's medical report with new diagnosis."
  }
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(mockRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredRequests = useMemo(() => {
    let filtered = requests;

    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter(request => request.status === selectedStatus);
    }

    return filtered;
  }, [requests, searchQuery, selectedStatus]);

  const handleCreateRequest = () => {
    navigate("/create-request");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Doctor Dashboard</h1>
            <div className="flex items-center gap-4">
              <Button onClick={handleCreateRequest}>
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="privileges">Hospital Privileges</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Summary of your activities and statistics</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 border-r pr-4">
                  <CalendarDays className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-2xl font-semibold">15</p>
                    <p className="text-sm text-gray-500">Appointments Today</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-r pr-4">
                  <Clock className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="text-2xl font-semibold">3</p>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="text-2xl font-semibold">85%</p>
                    <p className="text-sm text-gray-500">Request Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Requests</CardTitle>
                <CardDescription>View and manage your requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search requests..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        {REQUEST_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.title}</TableCell>
                        <TableCell>{request.date}</TableCell>
                        <TableCell>{request.time}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{request.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privileges" className="space-y-6">
            <DoctorPrivilegeView />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Insights into your performance and activities</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Request Completion Rate</h3>
                  <p className="text-4xl font-bold text-blue-600">85%</p>
                  <p className="text-sm text-gray-500">Percentage of requests completed on time</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Average Response Time</h3>
                  <p className="text-4xl font-bold text-green-600">2.5 Hrs</p>
                  <p className="text-sm text-gray-500">Average time taken to respond to a request</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DoctorDashboard;
