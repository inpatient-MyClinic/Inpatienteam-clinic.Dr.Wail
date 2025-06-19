import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText, Send, Filter, X, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

interface Request {
  id: number;
  patientName: string;
  mrn: string;
  serviceDescription: string;
  hospital: string;
  status: string;
  paymentStatus: string;
  assignedDoctor: string;
  createdAt: string;
  originalRequest: string;
  justificationNeeded: boolean;
  medicalHistory?: string;
  additionalNotes?: string;
  attachments?: string[];
  expectedSurgeryDate?: string;
}

interface RequestsTableProps {
  requests: Request[];
  onJustificationSubmit: (requestId: number, justification: string) => void;
  onRequestModification: (requestId: number, expectedSurgeryDate: string, hospital: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getPaymentStatusBadge: (status: string) => JSX.Element;
  REQUEST_STATUSES: Record<string, string>;
}

export default function RequestsTable({
  requests,
  onJustificationSubmit,
  onRequestModification,
  getStatusBadge,
  getPaymentStatusBadge,
  REQUEST_STATUSES
}: RequestsTableProps) {
  const [justificationText, setJustificationText] = useState("");
  
  // Filter states
  const [serviceFilter, setServiceFilter] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();

  const availableHospitals = [
    "King Khaled Hospital",
    "King Abdulaziz Hospital", 
    "King Faisal Hospital",
    "Prince Sultan Hospital",
    "King Fahd Hospital",
    "National Guard Hospital"
  ];

  // Get unique values for filter dropdowns
  const uniqueStatuses = [...new Set(requests.map(req => req.status))];
  const uniquePaymentStatuses = [...new Set(requests.map(req => req.paymentStatus))];
  const uniqueHospitals = [...new Set(requests.map(req => req.hospital))];

  // Filter requests based on all filter criteria
  const filteredRequests = requests.filter(request => {
    const matchesService = serviceFilter === "" || 
      request.serviceDescription.toLowerCase().includes(serviceFilter.toLowerCase());
    const matchesHospital = hospitalFilter === "all" || request.hospital === hospitalFilter;
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === "all" || request.paymentStatus === paymentStatusFilter;
    
    return matchesService && matchesHospital && matchesStatus && matchesPaymentStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [serviceFilter, hospitalFilter, statusFilter, paymentStatusFilter]);

  const clearAllFilters = () => {
    setServiceFilter("");
    setHospitalFilter("all");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
  };

  const hasActiveFilters = serviceFilter || hospitalFilter !== "all" || statusFilter !== "all" || paymentStatusFilter !== "all";

  const submitJustification = (requestId: number) => {
    if (!justificationText.trim()) {
      toast({
        title: "Error",
        description: "Please provide justification text",
        variant: "destructive"
      });
      return;
    }

    onJustificationSubmit(requestId, justificationText);
    setJustificationText("");
  };

  const ViewRequestDialog = ({ request }: { request: Request }) => {
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

      onRequestModification(request.id, localSurgeryDate, localHospital);
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

            {/* Original Request */}
            <div>
              <Label className="font-semibold">Original Request</Label>
              <div className="mt-1 p-3 bg-blue-50 rounded-md text-sm">
                {request.originalRequest}
              </div>
            </div>

            {/* Medical History */}
            {request.medicalHistory && (
              <div>
                <Label className="font-semibold">Medical History</Label>
                <div className="mt-1 p-3 bg-yellow-50 rounded-md text-sm">
                  {request.medicalHistory}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {request.additionalNotes && (
              <div>
                <Label className="font-semibold">Additional Notes</Label>
                <div className="mt-1 p-3 bg-green-50 rounded-md text-sm">
                  {request.additionalNotes}
                </div>
              </div>
            )}

            {/* Attachments */}
            {request.attachments && request.attachments.length > 0 && (
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
            )}

            {/* Status Information */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="font-semibold">Current Status</Label>
                <div className="mt-1">
                  {getStatusBadge(request.status)}
                </div>
              </div>
              <div>
                <Label className="font-semibold">Payment Status</Label>
                <div className="mt-1">
                  {getPaymentStatusBadge(request.paymentStatus)}
                </div>
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
      {/* Clear All Filters Button */}
      {hasActiveFilters && (
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredRequests.length} of {requests.length} requests (filtered)
          </div>
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} entries
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
            <th className="p-2">Agreed Date of Surgery</th>
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
            <th className="p-2 relative">
              <div className="flex items-center justify-between">
                Payment Status
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Filter className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3 bg-white border shadow-lg z-50">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Filter by Payment</Label>
                      <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select payment status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">All payment statuses</SelectItem>
                          {uniquePaymentStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {paymentStatusFilter !== "all" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPaymentStatusFilter("all")}
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
                {hasActiveFilters ? "No requests match the current filters." : "No requests found."}
              </td>
            </tr>
          ) : (
            currentPageRequests.map((req) => (
              <tr key={req.id} className="border-b">
                <td className="p-2">{req.patientName}</td>
                <td className="p-2">{req.mrn}</td>
                <td className="p-2">{req.serviceDescription}</td>
                <td className="p-2">{req.hospital}</td>
                <td className="p-2">
                  {req.expectedSurgeryDate ? 
                    new Date(req.expectedSurgeryDate).toLocaleDateString() : 
                    "Not set"
                  }
                </td>
                <td className="p-2">
                  {getStatusBadge(req.status)}
                </td>
                <td className="p-2">
                  {getPaymentStatusBadge(req.paymentStatus)}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {req.status === REQUEST_STATUSES.NEED_JUSTIFICATION ? (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Add Justification
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Add Justification for {req.patientName}</DialogTitle>
                              <DialogDescription>
                                Review the original request and provide additional justification
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Original Request</Label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                                  {req.originalRequest}
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="justification">Additional Justification</Label>
                                <Textarea
                                  id="justification"
                                  placeholder="Provide additional medical justification for this request..."
                                  value={justificationText}
                                  onChange={(e) => setJustificationText(e.target.value)}
                                  className="mt-1"
                                  rows={4}
                                />
                              </div>
                              <Button 
                                onClick={() => submitJustification(req.id)}
                                className="w-full"
                                disabled={!justificationText.trim()}
                              >
                                Submit Justification
                              </Button>
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
