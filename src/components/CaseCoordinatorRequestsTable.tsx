import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText, Send, Filter, X, MoreVertical, User, Building, FileCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { CaseCoordinatorRequest, COORDINATOR_REQUEST_STATUSES } from "@/hooks/useCaseCoordinatorRequests";

interface CaseCoordinatorRequestsTableProps {
  filteredRequests: CaseCoordinatorRequest[];
  updateStatus: (requestId: number, newStatus: string) => void;
}

export default function CaseCoordinatorRequestsTable({
  filteredRequests,
  updateStatus
}: CaseCoordinatorRequestsTableProps) {
  const [justificationText, setJustificationText] = useState("");
  
  // Filter states
  const [serviceFilter, setServiceFilter] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  
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
  const uniqueStatuses = [...new Set(filteredRequests.map(req => req.status))];
  const uniqueHospitals = [...new Set(filteredRequests.map(req => req.hospital))];
  const uniqueDoctors = [...new Set(filteredRequests.map(req => req.doctorName))];

  // Filter requests based on all filter criteria
  const tableFilteredRequests = filteredRequests.filter(request => {
    const matchesService = serviceFilter === "" || 
      request.serviceDescription.toLowerCase().includes(serviceFilter.toLowerCase());
    const matchesHospital = hospitalFilter === "all" || request.hospital === hospitalFilter;
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesDoctor = doctorFilter === "all" || request.doctorName === doctorFilter;
    
    return matchesService && matchesHospital && matchesStatus && matchesDoctor;
  });

  // Calculate pagination
  const totalPages = Math.ceil(tableFilteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageRequests = tableFilteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [serviceFilter, hospitalFilter, statusFilter, doctorFilter]);

  const clearAllFilters = () => {
    setServiceFilter("");
    setHospitalFilter("all");
    setStatusFilter("all");
    setDoctorFilter("all");
  };

  const hasActiveFilters = Boolean(
    serviceFilter || 
    hospitalFilter !== "all" || 
    statusFilter !== "all" || 
    doctorFilter !== "all"
  );

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      [COORDINATOR_REQUEST_STATUSES.NEW_REQUEST]: "bg-purple-100 text-purple-800",
      [COORDINATOR_REQUEST_STATUSES.PENDING]: "bg-yellow-100 text-yellow-800",
      [COORDINATOR_REQUEST_STATUSES.UNDER_PROCESS]: "bg-blue-100 text-blue-800",
      [COORDINATOR_REQUEST_STATUSES.PATIENT_CONTACTED]: "bg-purple-100 text-purple-800",
      [COORDINATOR_REQUEST_STATUSES.SUBMITTED_TO_INSURANCE]: "bg-indigo-100 text-indigo-800",
      [COORDINATOR_REQUEST_STATUSES.APPROVED]: "bg-green-100 text-green-800",
      [COORDINATOR_REQUEST_STATUSES.REJECTED]: "bg-red-100 text-red-800",
      [COORDINATOR_REQUEST_STATUSES.DONE]: "bg-green-100 text-green-800",
      [COORDINATOR_REQUEST_STATUSES.NEED_JUSTIFICATION]: "bg-orange-100 text-orange-800",
      [COORDINATOR_REQUEST_STATUSES.NOT_COMPLETED]: "bg-gray-100 text-gray-800",
      [COORDINATOR_REQUEST_STATUSES.DELAYED]: "bg-red-100 text-red-800",
      [COORDINATOR_REQUEST_STATUSES.SCHEDULED]: "bg-cyan-100 text-cyan-800",
      [COORDINATOR_REQUEST_STATUSES.POSTPONED]: "bg-orange-100 text-orange-800",
      [COORDINATOR_REQUEST_STATUSES.CANCELLED]: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const handleAssignToMe = (requestId: number) => {
    toast({
      title: "Assigned",
      description: "Request has been assigned to you",
    });
  };

  const handleSubmitToHospital = (requestId: number) => {
    toast({
      title: "Submitted",
      description: "Request has been submitted to hospital",
    });
  };

  const ViewRequestDialog = ({ request }: { request: CaseCoordinatorRequest }) => {
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
        title: "Case Updated",
        description: "Case has been updated and notifications sent to doctor and hospital",
      });
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Eye className="w-4 h-4 mr-2" />
            View
          </DropdownMenuItem>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Case Details - {request.patientName}</DialogTitle>
            <DialogDescription>
              Complete case information and coordination details
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
                  <p><span className="font-medium">Doctor:</span> {request.doctorName}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Hospital</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {request.hospital}
                </div>
              </div>
            </div>

            {/* Service Description */}
            <div>
              <Label className="font-semibold">Service Description</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                {request.serviceDescription}
              </div>
            </div>

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
            <div className="pt-4 border-t">
              <Label className="font-semibold">Current Status</Label>
              <div className="mt-1">
                {getStatusBadge(request.status)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="overflow-x-auto mb-8">
      {/* Clear All Filters Button */}
      {hasActiveFilters && (
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {tableFilteredRequests.length} of {filteredRequests.length} cases (filtered)
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
            <th className="p-2">Doctor</th>
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
              <td colSpan={7} className="text-center text-gray-400 py-6">
                {hasActiveFilters ? "No cases match the current filters." : "No cases found."}
              </td>
            </tr>
          ) : (
            currentPageRequests.map((req) => (
              <tr key={req.id} className="border-b">
                <td className="p-2">{req.patientName}</td>
                <td className="p-2">{req.mrn}</td>
                <td className="p-2">{req.doctorName}</td>
                <td className="p-2">{req.serviceDescription}</td>
                <td className="p-2">{req.hospital}</td>
                <td className="p-2">
                  {getStatusBadge(req.status)}
                </td>
                <td className="p-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAssignToMe(req.id)}>
                        <User className="w-4 h-4 mr-2" />
                        Assign to Me
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSubmitToHospital(req.id)}>
                        <Building className="w-4 h-4 mr-2" />
                        Submit to Hospital
                      </DropdownMenuItem>
                      <ViewRequestDialog request={req} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
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
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
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
              );
            })}
            
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
      )}
    </div>
  );
}
