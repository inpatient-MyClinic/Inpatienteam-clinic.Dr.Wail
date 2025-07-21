import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, Download, FileText, Send, Filter, X, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { NurseRequest, REQUEST_STATUSES } from "@/hooks/useNurseRequests";

interface NurseRequestsTableProps {
  filteredRequests: NurseRequest[];
  updateStatus: (requestId: number, newStatus: string) => void;
}

const availableHospitals = [
  "King Khaled Hospital",
  "King Abdulaziz Hospital", 
  "King Faisal Hospital",
  "Prince Sultan Hospital",
  "King Fahd Hospital",
  "National Guard Hospital"
];

export default function NurseRequestsTable({ 
  filteredRequests, 
  updateStatus 
}: NurseRequestsTableProps) {
  const { toast } = useToast();
  
  // Filter states
  const [serviceFilter, setServiceFilter] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [surgeryDateFilter, setSurgeryDateFilter] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [justificationText, setJustificationText] = useState("");

  // Get unique values for filter dropdowns
  const uniqueStatuses = [...new Set(filteredRequests.map(req => req.status))];
  const uniqueHospitals = [...new Set(filteredRequests.map(req => req.hospital))];

  // Apply table-specific filters
  const tableFilteredRequests = filteredRequests.filter(request => {
    const matchesService = serviceFilter === "" || 
      request.serviceDescription.toLowerCase().includes(serviceFilter.toLowerCase());
    const matchesHospital = hospitalFilter === "all" || request.hospital === hospitalFilter;
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSurgeryDate = surgeryDateFilter === "" || 
      (request.expectedSurgeryDate && request.expectedSurgeryDate.includes(surgeryDateFilter));
    
    return matchesService && matchesHospital && matchesStatus && matchesSurgeryDate;
  });

  // Calculate pagination
  const totalPages = Math.ceil(tableFilteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageRequests = tableFilteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [serviceFilter, hospitalFilter, statusFilter, surgeryDateFilter]);

  const clearTableFilters = () => {
    setServiceFilter("");
    setHospitalFilter("all");
    setStatusFilter("all");
    setSurgeryDateFilter("");
  };

  const hasTableFilters = Boolean(serviceFilter || hospitalFilter !== "all" || statusFilter !== "all" || surgeryDateFilter);

  const getStatusBadge = (status: string, isDelayed: boolean = false) => {
    const colors = {
      [REQUEST_STATUSES.PENDING]: "bg-blue-100 text-blue-800",
      [REQUEST_STATUSES.UNDER_PROCESS]: "bg-yellow-100 text-yellow-800",
      [REQUEST_STATUSES.PATIENT_CONTACTED]: "bg-purple-100 text-purple-800",
      [REQUEST_STATUSES.SUBMITTED_TO_INSURANCE]: "bg-orange-100 text-orange-800",
      [REQUEST_STATUSES.APPROVED_BY_HOSPITAL]: "bg-cyan-100 text-cyan-800",
      [REQUEST_STATUSES.DONE]: "bg-green-100 text-green-800",
      [REQUEST_STATUSES.REJECTED]: "bg-red-100 text-red-800",
      [REQUEST_STATUSES.NEED_JUSTIFICATION]: "bg-pink-100 text-pink-800",
      [REQUEST_STATUSES.NOT_COMPLETED]: "bg-gray-100 text-gray-800",
      [REQUEST_STATUSES.DELAYED]: "bg-red-200 text-red-900"
    };
    
    const baseColor = colors[status] || "bg-gray-100 text-gray-800";
    const delayedColor = isDelayed ? "bg-red-200 text-red-900" : baseColor;
    
    return (
      <div className="flex items-center gap-1">
        <span className={`px-2 py-1 rounded text-xs ${delayedColor}`}>
          {status}
        </span>
        {isDelayed && <AlertTriangle className="w-3 h-3 text-red-600" />}
      </div>
    );
  };

  const submitJustification = (requestId: number) => {
    if (!justificationText.trim()) {
      toast({
        title: "Error",
        description: "Please provide justification text",
        variant: "destructive"
      });
      return;
    }

    updateStatus(requestId, REQUEST_STATUSES.UNDER_PROCESS);
    setJustificationText("");
    
    toast({
      title: "Justification Submitted",
      description: "Request has been forwarded to hospital with additional justification",
    });
  };

  const ViewRequestDialog = ({ request }: { request: NurseRequest }) => {
    const [localSurgeryDate, setLocalSurgeryDate] = useState(request.expectedSurgeryDate || "");
    const [localHospital, setLocalHospital] = useState(request.hospital || "");
    const [localHasModifications, setLocalHasModifications] = useState(false);

    const handleLocalFieldChange = (field: 'surgeryDate' | 'hospital', value: string) => {
      if (field === 'surgeryDate') {
        setLocalSurgeryDate(value);
        setLocalHasModifications(value !== request.expectedSurgeryDate || localHospital !== request.hospital);
      } else {
        setLocalHospital(value);
        setLocalHasModifications(value !== request.hospital || localSurgeryDate !== request.expectedSurgeryDate);
      }
    };

    const handleLocalSubmit = () => {
      if (!localSurgeryDate || !localHospital) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      setLocalHasModifications(false);
      
      toast({
        title: "Request Modified",
        description: "Request has been updated and notifications sent to case coordinator and hospital",
      });
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
              Complete request information and medical details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Patient & Hospital Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Patient Information</Label>
                <div className="mt-2 space-y-1">
                  <p><span className="font-medium">Name:</span> {request.patientName}</p>
                  <p><span className="font-medium">MRN:</span> {request.mrn}</p>
                  <p><span className="font-medium">Phone:</span> {request.phone}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Referred Hospital</Label>
                <div className="mt-2">
                  <Select value={localHospital} onValueChange={(value) => handleLocalFieldChange('hospital', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableHospitals.map((hospital) => (
                        <SelectItem key={hospital} value={hospital}>
                          {hospital}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Expected Surgery Date */}
            <div>
              <Label className="font-semibold">Expected Surgery Date</Label>
              <div className="mt-2">
                <Input
                  type="date"
                  value={localSurgeryDate}
                  onChange={(e) => handleLocalFieldChange('surgeryDate', e.target.value)}
                />
              </div>
            </div>

            {/* Service Description */}
            <div>
              <Label className="font-semibold">Service Description</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                {request.serviceDescription}
              </div>
            </div>

            {/* Medical History */}
            <div>
              <Label className="font-semibold">Medical History</Label>
              <div className="mt-1 p-3 bg-yellow-50 rounded-md text-sm">
                Patient has history of cardiac conditions and previous surgeries. Requires special attention during procedure.
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label className="font-semibold">Additional Notes</Label>
              <div className="mt-1 p-3 bg-green-50 rounded-md text-sm">
                Patient is allergic to certain medications. Please review allergy list before procedure.
              </div>
            </div>

            {/* Attachments */}
            <div>
              <Label className="font-semibold">Attachments</Label>
              <div className="mt-2 space-y-2">
                {request.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">{attachment}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Information */}
            <div className="pt-4 border-t">
              <Label className="font-semibold">Current Status</Label>
              <div className="mt-1">
                {getStatusBadge(request.status, request.isDelayed)}
              </div>
            </div>

            {/* Submit Modifications Button */}
            {localHasModifications && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleLocalSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2 text-white" />
                  Submit Modifications
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(1);
                  }}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}
          
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(page);
                }}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(totalPages);
                  }}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="overflow-x-auto mb-8">
      {/* Clear Table Filters Button */}
      {hasTableFilters && (
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {tableFilteredRequests.length} of {filteredRequests.length} requests (table filtered)
          </div>
          <Button
            variant="ghost"
            onClick={clearTableFilters}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            Clear Table Filters
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {startIndex + 1} to {Math.min(endIndex, tableFilteredRequests.length)} of {tableFilteredRequests.length} entries
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <table className="w-full border text-sm rounded">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-2">Patient Name</th>
            <th className="p-2">MRN</th>
            <th className="p-2">Phone</th>
            <th className="p-2 relative">
              <div className="flex items-center justify-between">
                Service Description
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Filter className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 bg-white border shadow-lg z-50">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Filter by Service</Label>
                      <Input
                        placeholder="Search services..."
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                        className="w-full"
                      />
                      {serviceFilter && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setServiceFilter("")}
                          className="w-full text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </th>
            <th className="p-2 relative">
              <div className="flex items-center justify-between">
                Hospital
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Filter className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3 bg-white border shadow-lg z-50">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Filter by Hospital</Label>
                      <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select hospital" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">All hospitals</SelectItem>
                          {uniqueHospitals.map((hospital) => (
                            <SelectItem key={hospital} value={hospital}>
                              {hospital}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {hospitalFilter !== "all" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setHospitalFilter("all")}
                          className="w-full text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </th>
            <th className="p-2 relative">
              <div className="flex items-center justify-between">
                Agreed Date of Surgery
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Filter className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 bg-white border shadow-lg z-50">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Filter by Surgery Date</Label>
                      <Input
                        type="date"
                        value={surgeryDateFilter}
                        onChange={(e) => setSurgeryDateFilter(e.target.value)}
                        className="w-full"
                      />
                      {surgeryDateFilter && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSurgeryDateFilter("")}
                          className="w-full text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </th>
            <th className="p-2 relative">
              <div className="flex items-center justify-between">
                Status
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Filter className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3 bg-white border shadow-lg z-50">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Filter by Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">All statuses</SelectItem>
                          {uniqueStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {statusFilter !== "all" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setStatusFilter("all")}
                          className="w-full text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPageRequests.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center text-gray-400 py-6">
                {hasTableFilters ? "No requests match the current filters." : "No requests found."}
              </td>
            </tr>
          ) : (
            currentPageRequests.map((req) => (
              <tr key={req.id} className="border-b">
                <td className="p-2">{req.patientName}</td>
                <td className="p-2">{req.mrn}</td>
                <td className="p-2">{req.phone}</td>
                <td className="p-2">{req.serviceDescription}</td>
                <td className="p-2">{req.hospital}</td>
                <td className="p-2">
                  {req.expectedSurgeryDate ? 
                    new Date(req.expectedSurgeryDate).toLocaleDateString() : 
                    "Not set"
                  }
                </td>
                <td className="p-2">
                  {getStatusBadge(req.status, req.isDelayed)}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {req.status === REQUEST_STATUSES.NEED_JUSTIFICATION ? (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="bg-pink-50 border-pink-200 text-pink-800 hover:bg-pink-100">
                              Need Justification
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-pink-800">Justification Required - {req.patientName}</DialogTitle>
                              <DialogDescription>
                                The hospital or case coordinator has requested additional justification for this case
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Patient Information */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                                <div>
                                  <Label className="font-semibold text-blue-900">Patient Details</Label>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <p><span className="font-medium">Name:</span> {req.patientName}</p>
                                    <p><span className="font-medium">MRN:</span> {req.mrn}</p>
                                    <p><span className="font-medium">Phone:</span> {req.phone}</p>
                                  </div>
                                </div>
                                <div>
                                  <Label className="font-semibold text-blue-900">Request Details</Label>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <p><span className="font-medium">Hospital:</span> {req.hospital}</p>
                                    <p><span className="font-medium">Specialty:</span> {req.specialty}</p>
                                    <p><span className="font-medium">Surgery Date:</span> {req.expectedSurgeryDate || "Not set"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Original Request */}
                              <div>
                                <Label className="font-semibold">Original Service Request</Label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm">
                                  {req.serviceDescription}
                                </div>
                              </div>

                              {/* Justification Request from Hospital/Case Coordinator */}
                              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                                <Label className="font-semibold text-yellow-800">Why Justification is Needed</Label>
                                <div className="mt-2 space-y-2">
                                  <div className="p-3 bg-white rounded border">
                                    <p className="text-sm font-medium text-gray-700">Hospital Review Comments:</p>
                                    <p className="text-sm mt-1">
                                      "This case requires additional medical justification to support the necessity of the procedure. 
                                      Please provide more detailed clinical rationale including current symptoms, previous treatment attempts, 
                                      and urgency indicators."
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      - Dr. Sarah Al-Mahmoud, Medical Review Committee
                                    </p>
                                  </div>
                                  
                                  <div className="p-3 bg-white rounded border">
                                    <p className="text-sm font-medium text-gray-700">Case Coordinator Notes:</p>
                                    <p className="text-sm mt-1">
                                      "Insurance pre-authorization requires additional documentation. 
                                      Please include recent diagnostic reports, treatment timeline, and clinical assessment."
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      - Case Coordinator Ahmed Hassan
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Current Attachments */}
                              <div>
                                <Label className="font-semibold">Current Attachments</Label>
                                <div className="mt-2 space-y-2">
                                  {req.attachments.length > 0 ? req.attachments.map((attachment, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                      <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                        <span className="text-sm">{attachment}</span>
                                      </div>
                                      <Button size="sm" variant="ghost" className="text-blue-600">
                                        <Download className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )) : (
                                    <p className="text-sm text-gray-500 italic">No attachments uploaded yet</p>
                                  )}
                                </div>
                              </div>

                              {/* Additional Justification Form */}
                              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                                <Label className="font-semibold text-green-800">Provide Additional Justification</Label>
                                <Textarea
                                  placeholder="Address the specific concerns mentioned above. Include:
• Detailed clinical rationale
• Current patient symptoms and assessment
• Previous treatment attempts and outcomes
• Urgency factors and medical necessity
• Any additional supporting medical evidence"
                                  value={justificationText}
                                  onChange={(e) => setJustificationText(e.target.value)}
                                  className="mt-2"
                                  rows={6}
                                />
                                <div className="flex gap-3">
                                  <Button 
                                    onClick={() => submitJustification(req.id)}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    disabled={!justificationText.trim()}
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Justification
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    className="flex-1"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Upload Additional Documents
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <ViewRequestDialog request={req} />
                      </>
                    ) : (
                      <ViewRequestDialog request={req} />
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {renderPagination()}
    </div>
  );
}
