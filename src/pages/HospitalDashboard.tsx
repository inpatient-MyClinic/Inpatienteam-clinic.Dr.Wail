
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, FileText, Clock, CheckCircle, XCircle, AlertCircle, Users, TrendingUp, Download, Printer, Eye, Upload, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Sample data - in a real app, this would come from your backend
const sampleRequests = [
  {
    id: 1,
    patientName: "Ahmed Al-Rashid",
    mrn: "MRN-001",
    serviceDescription: "Cardiac Surgery - CABG",
    specialty: "Cardiology",
    doctor: "Dr. Sarah Johnson",
    expectedSurgeryDate: "2024-01-15",
    status: "Pending",
    submissionDate: "2024-01-10",
    leadTime: 5
  },
  {
    id: 2,
    patientName: "Fatima Al-Zahra",
    mrn: "MRN-002",
    serviceDescription: "Orthopedic Surgery - Knee Replacement",
    specialty: "Orthopedics",
    doctor: "Dr. Michael Chen",
    expectedSurgeryDate: "2024-01-20",
    status: "Approved",
    submissionDate: "2024-01-08",
    leadTime: 12
  },
  {
    id: 3,
    patientName: "Omar Hassan",
    mrn: "MRN-003",
    serviceDescription: "Neurosurgery - Brain Tumor Removal",
    specialty: "Neurosurgery",
    doctor: "Dr. Emily Davis",
    expectedSurgeryDate: "2024-01-25",
    status: "Rejected",
    submissionDate: "2024-01-12",
    leadTime: 13
  },
  {
    id: 4,
    patientName: "Aisha Mohammad",
    mrn: "MRN-004",
    serviceDescription: "General Surgery - Appendectomy",
    specialty: "General Surgery",
    doctor: "Dr. James Wilson",
    expectedSurgeryDate: "2024-01-18",
    status: "Need Justification",
    submissionDate: "2024-01-11",
    leadTime: 7
  }
];

export default function HospitalDashboard() {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("01");
  const [filteredRequests, setFilteredRequests] = useState(sampleRequests);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  
  // Column filters
  const [surgeryDateFilter, setSurgeryDateFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Request modification states
  const [modifiedSurgeryDate, setModifiedSurgeryDate] = useState("");
  const [modifiedStatus, setModifiedStatus] = useState("");
  const [justificationText, setJustificationText] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Apply all filters whenever any filter changes
  useEffect(() => {
    let filtered = [...sampleRequests];

    // Apply status filter from sidebar
    if (activeStatusFilter) {
      filtered = filtered.filter(req => req.status === activeStatusFilter);
    }

    // Apply column filters
    if (surgeryDateFilter) {
      filtered = filtered.filter(req => req.expectedSurgeryDate === surgeryDateFilter);
    }
    if (specialtyFilter) {
      filtered = filtered.filter(req => 
        req.specialty.toLowerCase().includes(specialtyFilter.toLowerCase())
      );
    }
    if (doctorFilter) {
      filtered = filtered.filter(req => 
        req.doctor.toLowerCase().includes(doctorFilter.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Apply date filters
    if (selectedDates.length > 0) {
      filtered = filtered.filter(req => {
        const reqDate = new Date(req.expectedSurgeryDate);
        return selectedDates.some(selectedDate => 
          reqDate.toDateString() === selectedDate.toDateString()
        );
      });
    }

    setFilteredRequests(filtered);
  }, [activeStatusFilter, surgeryDateFilter, specialtyFilter, doctorFilter, statusFilter, selectedDates]);

  const totalRequests = sampleRequests.length;
  const doneRequests = sampleRequests.filter(req => req.status === "Approved").length;
  const approvedRequests = sampleRequests.filter(req => req.status === "Approved").length;
  const rejectedRequests = sampleRequests.filter(req => req.status === "Rejected").length;

  const conversionRate = totalRequests > 0 ? ((doneRequests / totalRequests) * 100).toFixed(1) : "0";
  const approvalRate = totalRequests > 0 ? ((approvedRequests / totalRequests) * 100).toFixed(1) : "0";
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(1) : "0";

  const statusCounts = {
    pending: sampleRequests.filter(req => req.status === "Pending").length,
    approved: sampleRequests.filter(req => req.status === "Approved").length,
    rejected: sampleRequests.filter(req => req.status === "Rejected").length,
    needJustification: sampleRequests.filter(req => req.status === "Need Justification").length,
  };

  const handleStatusIconClick = (status: string) => {
    setActiveStatusFilter(activeStatusFilter === status ? null : status);
  };

  const handleExportToExcel = () => {
    toast({
      title: "Export Initiated",
      description: "Your Excel file is being prepared for download.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRequestModification = (requestId: number) => {
    if (modifiedStatus === "Need Justification" && !justificationText.trim()) {
      toast({
        title: "Error",
        description: "Please provide justification text.",
        variant: "destructive"
      });
      return;
    }

    if (modifiedStatus === "Rejected" && !justificationText.trim()) {
      toast({
        title: "Error",
        description: "Please provide rejection reason.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Request Updated",
      description: "Request has been modified and notifications sent to doctor and case coordinator.",
    });

    // Reset form
    setModifiedSurgeryDate("");
    setModifiedStatus("");
    setJustificationText("");
    setAttachmentFile(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
    }
  };

  const clearAllFilters = () => {
    setActiveStatusFilter(null);
    setSurgeryDateFilter("");
    setSpecialtyFilter("");
    setDoctorFilter("");
    setStatusFilter("");
    setSelectedDates([]);
  };

  const ViewRequestDialog = ({ request }: { request: any }) => {
    const [localSurgeryDate, setLocalSurgeryDate] = useState(request.expectedSurgeryDate);
    const [localStatus, setLocalStatus] = useState("");
    const [localJustification, setLocalJustification] = useState("");
    const [localAttachment, setLocalAttachment] = useState<File | null>(null);

    const handleLocalSubmit = () => {
      if (localStatus === "Need Justification" && !localJustification.trim()) {
        toast({
          title: "Error",
          description: "Please provide justification text.",
          variant: "destructive"
        });
        return;
      }

      if (localStatus === "Rejected" && !localJustification.trim()) {
        toast({
          title: "Error",
          description: "Please provide rejection reason.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Request Updated",
        description: "Request has been modified and notifications sent to doctor and case coordinator.",
      });

      // Reset form
      setLocalSurgeryDate(request.expectedSurgeryDate);
      setLocalStatus("");
      setLocalJustification("");
      setLocalAttachment(null);
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details - {request.patientName}</DialogTitle>
            <DialogDescription>
              View and modify request information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Patient Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Patient Information</Label>
                <div className="mt-2 space-y-1">
                  <p><span className="font-medium">Name:</span> {request.patientName}</p>
                  <p><span className="font-medium">MRN:</span> {request.mrn}</p>
                  <p><span className="font-medium">Specialty:</span> {request.specialty}</p>
                  <p><span className="font-medium">Doctor:</span> {request.doctor}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Service Description</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                  {request.serviceDescription}
                </div>
              </div>
            </div>

            {/* Modification Section */}
            <div className="border-t pt-4">
              <Label className="font-semibold text-lg">Modify Request</Label>
              
              <div className="mt-4 space-y-4">
                {/* Surgery Date Modification */}
                <div>
                  <Label>Agreed Date of Surgery</Label>
                  <Input
                    type="date"
                    value={localSurgeryDate}
                    onChange={(e) => setLocalSurgeryDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Status Change */}
                <div>
                  <Label>Status Change</Label>
                  <Select value={localStatus} onValueChange={setLocalStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Need Justification">Need More Justification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Justification Section - Show for both Need Justification and Rejected */}
                {(localStatus === "Need Justification" || localStatus === "Rejected") && (
                  <div className={`space-y-4 p-4 rounded-lg ${localStatus === "Need Justification" ? "bg-yellow-50" : "bg-red-50"}`}>
                    <div>
                      <Label>
                        {localStatus === "Need Justification" ? "Reason for Justification" : "Reason for Rejection"}
                      </Label>
                      <Textarea
                        placeholder={localStatus === "Need Justification" 
                          ? "Please provide the reason for requesting additional justification..." 
                          : "Please provide the reason for rejection..."
                        }
                        value={localJustification}
                        onChange={(e) => setLocalJustification(e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label>Upload Attachment (Optional)</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setLocalAttachment(file);
                            }
                          }}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="flex-1"
                        />
                        <Button size="sm" variant="outline">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                      {localAttachment && (
                        <p className="text-sm text-green-600 mt-1">
                          File selected: {localAttachment.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  onClick={handleLocalSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!localStatus}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Modifications
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hospital Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {doneRequests} of {totalRequests} requests completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {approvedRequests} of {totalRequests} requests approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {rejectedRequests} of {totalRequests} requests rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Left Sidebar - Status Icons */}
        <div className="w-64 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter by Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeStatusFilter === "Pending" ? "bg-yellow-100 border-2 border-yellow-300" : "hover:bg-gray-50 border"
                }`}
                onClick={() => handleStatusIconClick("Pending")}
              >
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                  <span>Pending</span>
                </div>
                <Badge variant="secondary">{statusCounts.pending}</Badge>
              </div>

              <div 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeStatusFilter === "Approved" ? "bg-green-100 border-2 border-green-300" : "hover:bg-gray-50 border"
                }`}
                onClick={() => handleStatusIconClick("Approved")}
              >
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <span>Approved</span>
                </div>
                <Badge variant="secondary">{statusCounts.approved}</Badge>
              </div>

              <div 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeStatusFilter === "Rejected" ? "bg-red-100 border-2 border-red-300" : "hover:bg-gray-50 border"
                }`}
                onClick={() => handleStatusIconClick("Rejected")}
              >
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-3" />
                  <span>Rejected</span>
                </div>
                <Badge variant="secondary">{statusCounts.rejected}</Badge>
              </div>

              <div 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeStatusFilter === "Need Justification" ? "bg-orange-100 border-2 border-orange-300" : "hover:bg-gray-50 border"
                }`}
                onClick={() => handleStatusIconClick("Need Justification")}
              >
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                  <span>Need Justification</span>
                </div>
                <Badge variant="secondary">{statusCounts.needJustification}</Badge>
              </div>

              {(activeStatusFilter || surgeryDateFilter || specialtyFilter || doctorFilter || statusFilter || selectedDates.length > 0) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="w-full mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Content */}
        <div className="flex-1 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Calendar Filter */}
                <div>
                  <Label>Filter by Day</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDates.length > 0 ? `${selectedDates.length} days selected` : "Select Days"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <CalendarComponent
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={(dates) => setSelectedDates(dates || [])}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Week Filter */}
                <div>
                  <Label>Filter by Week</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month for weeks" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="01">January 2024</SelectItem>
                      <SelectItem value="02">February 2024</SelectItem>
                      <SelectItem value="03">March 2024</SelectItem>
                      <SelectItem value="04">April 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Month Filter with Export/Print buttons */}
                <div>
                  <Label>Filter by Month</Label>
                  <div className="flex gap-2">
                    <Select value={selectedMonths.join(',')} onValueChange={(value) => setSelectedMonths(value ? value.split(',') : [])}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select months" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="01">January</SelectItem>
                        <SelectItem value="02">February</SelectItem>
                        <SelectItem value="03">March</SelectItem>
                        <SelectItem value="04">April</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={handleExportToExcel}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handlePrint}>
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Hospital Requests ({filteredRequests.length} of {totalRequests})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead className="bg-blue-100 text-blue-900">
                    <tr>
                      <th className="p-2 text-left">Patient Name</th>
                      <th className="p-2 text-left">MRN</th>
                      <th className="p-2 text-left">Service</th>
                      <th className="p-2 text-left relative">
                        <div className="flex items-center justify-between">
                          Agreed Date of Surgery
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Filter className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3 bg-white border shadow-lg z-50">
                              <Label className="text-sm font-medium">Filter by Date</Label>
                              <Input
                                type="date"
                                value={surgeryDateFilter}
                                onChange={(e) => setSurgeryDateFilter(e.target.value)}
                                placeholder="Filter by date"
                                className="mt-1"
                              />
                              {surgeryDateFilter && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setSurgeryDateFilter("")}
                                  className="w-full text-xs mt-2"
                                >
                                  Clear
                                </Button>
                              )}
                            </PopoverContent>
                          </Popover>
                        </div>
                      </th>
                      <th className="p-2 text-left relative">
                        <div className="flex items-center justify-between">
                          Specialty
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Filter className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3 bg-white border shadow-lg z-50">
                              <Label className="text-sm font-medium">Filter by Specialty</Label>
                              <Input
                                value={specialtyFilter}
                                onChange={(e) => setSpecialtyFilter(e.target.value)}
                                placeholder="Filter by specialty"
                                className="mt-1"
                              />
                              {specialtyFilter && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setSpecialtyFilter("")}
                                  className="w-full text-xs mt-2"
                                >
                                  Clear
                                </Button>
                              )}
                            </PopoverContent>
                          </Popover>
                        </div>
                      </th>
                      <th className="p-2 text-left relative">
                        <div className="flex items-center justify-between">
                          Doctor
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Filter className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3 bg-white border shadow-lg z-50">
                              <Label className="text-sm font-medium">Filter by Doctor</Label>
                              <Input
                                value={doctorFilter}
                                onChange={(e) => setDoctorFilter(e.target.value)}
                                placeholder="Filter by doctor"
                                className="mt-1"
                              />
                              {doctorFilter && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setDoctorFilter("")}
                                  className="w-full text-xs mt-2"
                                >
                                  Clear
                                </Button>
                              )}
                            </PopoverContent>
                          </Popover>
                        </div>
                      </th>
                      <th className="p-2 text-left relative">
                        <div className="flex items-center justify-between">
                          Status
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Filter className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-3 bg-white border shadow-lg z-50">
                              <Label className="text-sm font-medium">Filter by Status</Label>
                              <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Approved">Approved</SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                  <SelectItem value="Need Justification">Need Justification</SelectItem>
                                </SelectContent>
                              </Select>
                              {statusFilter && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setStatusFilter("")}
                                  className="w-full text-xs mt-2"
                                >
                                  Clear
                                </Button>
                              )}
                            </PopoverContent>
                          </Popover>
                        </div>
                      </th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-gray-400 py-6">
                          No requests match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{request.patientName}</td>
                          <td className="p-2">{request.mrn}</td>
                          <t className="p-2">{request.serviceDescription}</td>
                          <td className="p-2">{new Date(request.expectedSurgeryDate).toLocaleDateString()}</td>
                          <td className="p-2">{request.specialty}</td>
                          <td className="p-2">{request.doctor}</td>
                          <td className="p-2">
                            <Badge variant={
                              request.status === "Approved" ? "default" :
                              request.status === "Rejected" ? "destructive" :
                              request.status === "Pending" ? "secondary" : "outline"
                            }>
                              {request.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <ViewRequestDialog request={request} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Hospital Lead Time Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Hospital Lead Time Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">8.5</div>
                    <div className="text-sm text-gray-600">Average Lead Time (days)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-gray-600">On-Time Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">15%</div>
                    <div className="text-sm text-gray-600">Delayed Requests</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
