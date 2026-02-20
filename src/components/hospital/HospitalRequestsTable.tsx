
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import ViewRequestDialog from "./ViewRequestDialog";

interface HospitalRequestsTableProps {
  filteredRequests: any[];
  totalRequests: number;
  surgeryDateFilter: string;
  setSurgeryDateFilter: (value: string) => void;
  specialtyFilter: string;
  setSpecialtyFilter: (value: string) => void;
  doctorFilter: string;
  setDoctorFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export default function HospitalRequestsTable({
  filteredRequests,
  totalRequests,
  surgeryDateFilter,
  setSurgeryDateFilter,
  specialtyFilter,
  setSpecialtyFilter,
  doctorFilter,
  setDoctorFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery
}: HospitalRequestsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [surgeryDateFilter, specialtyFilter, doctorFilter, statusFilter]);

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
    <Card>
      <CardHeader>
        <CardTitle>Hospital Requests ({filteredRequests.length} of {totalRequests})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search by MRN / Patient ID */}
        <div className="mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by MRN or Patient ID..."
            className="max-w-sm"
          />
        </div>

        {/* Pagination Info */}
        <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} entries
          </div>
          <div>
            Page {currentPage} of {totalPages}
          </div>
        </div>

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
              {currentPageRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-6">
                    No requests match the current filters.
                  </td>
                </tr>
              ) : (
                currentPageRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{request.patientName}</td>
                    <td className="p-2">{request.mrn}</td>
                    <td className="p-2">{request.serviceDescription}</td>
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

        {renderPagination()}
      </CardContent>
    </Card>
  );
}
