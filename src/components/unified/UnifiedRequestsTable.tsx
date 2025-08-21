import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { UnifiedRequest } from '@/services/unifiedDataService';
import { format } from 'date-fns';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UnifiedRequestsTableProps {
  requests: UnifiedRequest[];
  showPagination?: boolean;
}

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800', 
  'scheduled': 'bg-purple-100 text-purple-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-gray-100 text-gray-800',
  'rejected': 'bg-red-100 text-red-800',
  'postponed': 'bg-orange-100 text-orange-800',
  'privilege': 'bg-indigo-100 text-indigo-800'
};

const urgencyColors: Record<string, string> = {
  'low': 'bg-green-100 text-green-800',
  'normal': 'bg-blue-100 text-blue-800',
  'high': 'bg-orange-100 text-orange-800',
  'critical': 'bg-red-100 text-red-800'
};

export default function UnifiedRequestsTable({ 
  requests, 
  showPagination = true 
}: UnifiedRequestsTableProps) {
  const { updateRequest, currentUser } = useUnifiedData();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const canEdit = (request: UnifiedRequest) => {
    if (!currentUser) return false;
    
    return (
      currentUser.role === 'admin' ||
      request.created_by === currentUser.id ||
      request.assigned_to === currentUser.id ||
      (currentUser.role === 'case-coordinator' && request.hospital_code === currentUser.hospital_code)
    );
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    await updateRequest(requestId, { status: newStatus });
  };

  const handleUrgencyChange = async (requestId: string, newUrgency: string) => {
    await updateRequest(requestId, { urgency: newUrgency });
  };

  const paginatedRequests = showPagination 
    ? requests.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : requests;

  const totalPages = Math.ceil(requests.length / pageSize);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Medical Condition</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.patient_name}</div>
                      {request.patient_id && (
                        <div className="text-sm text-muted-foreground">
                          ID: {request.patient_id}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={request.medical_condition}>
                      {request.medical_condition}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">{request.specialty}</Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.hospital_code}</div>
                      {request.hospital_name && (
                        <div className="text-sm text-muted-foreground">
                          {request.hospital_name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {canEdit(request) ? (
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="postponed">Postponed</SelectItem>
                          <SelectItem value="privilege">Privilege</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={statusColors[request.status] || 'bg-gray-100 text-gray-800'}>
                        {request.status}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {canEdit(request) ? (
                      <Select
                        value={request.urgency}
                        onValueChange={(value) => handleUrgencyChange(request.id, value)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={urgencyColors[request.urgency] || 'bg-blue-100 text-blue-800'}>
                        {request.urgency}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {format(new Date(request.request_date), 'MMM dd, yyyy')}
                  </TableCell>
                  
                  <TableCell>
                    {request.paid_amount > 0 ? (
                      <span className="font-medium">
                        {new Intl.NumberFormat('en-SA', {
                          style: 'currency',
                          currency: 'SAR'
                        }).format(request.paid_amount)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant={request.source_type === 'excel' ? 'secondary' : 'outline'}
                    >
                      {request.source_type}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit(request) && (
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Request
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, requests.length)} of {requests.length} requests
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}