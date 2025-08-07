import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Settings } from "lucide-react";
import ViewRequestDialog from "@/components/ViewRequestDialog/ViewRequestDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TableWithPagination from "@/components/ui/table-with-pagination";
import AssignmentDialog from "./AssignmentDialog";
import EditRequestDialog from "./EditRequestDialog";

interface AdminTask {
  id: string;
  patientMRN: string;
  type: string;
  description: string;
  user: string;
  status: string;
  date: string;
  specialty: string;
  hospital: string;
  caseCoordinator: string;
  requestDate: Date;
  completionDate: Date | null;
}

interface PaginatedAdminTableProps {
  data: AdminTask[];
  currentUserRole?: string;
  onStatusFilter?: (status: string | null) => void;
}

interface PaginationSettings {
  rowsPerPage: number;
  globalDefault: number;
  userSpecific: Record<string, number>;
}

export default function PaginatedAdminTable({ data, currentUserRole = "admin", onStatusFilter }: PaginatedAdminTableProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [paginationSettings, setPaginationSettings] = useState<PaginationSettings>(() => {
    const saved = localStorage.getItem('adminPaginationSettings');
    return saved ? JSON.parse(saved) : {
      rowsPerPage: 10,
      globalDefault: 10,
      userSpecific: {}
    };
  });
  const { toast } = useToast();

  // Calculate status totals
  const statusTotals = data.reduce((acc, item) => {
    const status = item.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get specific status counts
  const doneCount = (statusTotals["Done"] || 0) + (statusTotals["Completed"] || 0);
  const pendingCount = statusTotals["Pending"] || 0;
  const scheduledCount = statusTotals["Scheduled"] || 0;
  const cancelledCount = (statusTotals["Cancelled"] || 0) + (statusTotals["Case Canceled"] || 0);
  const plannedNVDCount = statusTotals["Planned NVD"] || 0;

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('adminPaginationSettings', JSON.stringify(paginationSettings));
  }, [paginationSettings]);

  // Convert AdminTask to request format for ViewRequestDialog - using actual Excel data
  const convertToRequest = (task: AdminTask) => {
    const getValidDateString = (date: Date | null) => {
      if (!date || isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      return date.toISOString();
    };

    // Get the original request data from storage to access all Excel fields
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    const originalRequest = requests.find((req: any) => 
      req.patientMRN === task.patientMRN || 
      req.id === parseInt(task.id.replace('REQ', ''))
    );

    // If we found the original request, use its data; otherwise use task data
    const requestData = originalRequest || {};

    return {
      id: parseInt(task.id.replace('REQ', '')) || 1,
      patientName: requestData.patientName || `Patient for ${requestData.__EMPTY_1 || task.patientMRN}`,
      mrn: requestData.__EMPTY_1 || task.patientMRN || requestData.patientMRN || `MRN-${task.id}`,
      serviceDescription: requestData.serviceDescription || task.description,
      doctorName: requestData.doctorName || task.user,
      hospital: requestData.hospitalName || requestData.referredToHospital || task.hospital,
      specialty: requestData.specialty || task.specialty,
      status: requestData.operationStatus || requestData.status || task.status,
      createdAt: requestData.dateCreated ? `${requestData.dateCreated}T${requestData.timeCreated || '00:00'}:00Z` : getValidDateString(task.requestDate),
      assignedCoordinator: requestData.assignedCoordinator || task.caseCoordinator,
      
      // Patient contact information from Excel
      phone: requestData.patientMobileNo || requestData.patientPhone || "",
      idNumber: requestData.patientNationalId || "",
      age: requestData.age || "",
      gender: requestData.gender || "",
      nationality: requestData.nationality || "",
      
      // Medical information from Excel
      diagnosis: requestData.diagnosis || requestData.history || "",
      urgency: requestData.urgency || "Normal",
      expectedSurgeryDate: requestData.expectedSurgeryDate || requestData.agreedBookingDate || "",
      medicalHistory: requestData.history || "",
      currentMedications: requestData.currentMedications || "",
      allergies: requestData.allergies || "",
      
      // Insurance information from Excel
      insuranceCompany: requestData.insuranceType || "",
      policyNumber: requestData.insuranceNumber || "",
      contactPerson: requestData.caseManager || "",
      contactPhone: requestData.patientMobileNo || "",
      contactEmail: requestData.email || "",
      
      // Additional Excel fields
      notes: requestData.notes || "",
      rejectionReason: requestData.reasonPendingCancellation || "",
      
      // Hospital specific data
      hospitalMRN: requestData.__EMPTY_1 || task.patientMRN || requestData.hospitalMRN || "",
      hospitalFileNumber: requestData.hospitalFileNumber || "",
      clinicBranch: requestData.clinicBranch || "",
      
      // Case management data
      receivedDocuments: requestData.receivedDocuments || "",
      smsIntroduction: requestData.smsIntroduction || "",
      patientContacted: requestData.patientContacted || "",
      
      // Financial data
      orderSubmission: requestData.orderSubmission || "",
      approvalNumber: requestData.approvalNumber || "",
      approvalStatus: requestData.approvalStatus || "",
      preOpStatus: requestData.preOpStatus || "",
      
      // Specialty specific fields
      requiredImplant: requestData.requiredImplant || "",
      lastMenstrualPeriod: requestData.lastMenstrualPeriod || "",
      estimatedDueDate: requestData.estimatedDueDate || "",
      opdBookingDate: requestData.opdBookingDate || ""
    };
  };

  // Define table columns for the new pagination component
  const columns = [
    {
      key: "patientMRN",
      label: "Patient MRN",
      filterable: true,
      sortable: true
    },
    {
      key: "description",
      label: "Description", 
      filterable: true,
      sortable: true
    },
    {
      key: "user",
      label: "User",
      filterable: true,
      sortable: true
    },
    {
      key: "hospital",
      label: "Hospital",
      filterable: true,
      sortable: true
    },
    {
      key: "specialty",
      label: "Specialty",
      filterable: true,
      sortable: true
    },
    {
      key: "status",
      label: "Status",
      filterable: true,
      sortable: true,
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: "date",
      label: "Date",
      filterable: true,
      sortable: true
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <ViewRequestDialog 
                request={convertToRequest(row)}
                currentUserRole={currentUserRole}
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <EditRequestDialog 
                request={convertToRequest(row)}
                onSave={handleEditRequest}
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <AssignmentDialog 
                request={convertToRequest(row)}
                onAssign={handleAssignRequest}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const handleRowsPerPageChange = (newRowsPerPage: number, isGlobal: boolean = false, targetUser?: string) => {
    if (isGlobal) {
      setPaginationSettings(prev => ({
        ...prev,
        globalDefault: newRowsPerPage,
        rowsPerPage: newRowsPerPage
      }));
      toast({
        title: "Global Setting Updated",
        description: `Default rows per page set to ${newRowsPerPage} for all users.`
      });
    } else if (targetUser) {
      setPaginationSettings(prev => ({
        ...prev,
        userSpecific: {
          ...prev.userSpecific,
          [targetUser]: newRowsPerPage
        }
      }));
      toast({
        title: "User Setting Updated",
        description: `Rows per page set to ${newRowsPerPage} for ${targetUser}.`
      });
    } else {
      setPaginationSettings(prev => ({
        ...prev,
        rowsPerPage: newRowsPerPage
      }));
    }
  };

  const handleEditRequest = (requestId: string, updatedData: any) => {
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    const updatedRequests = requests.map((req: any) => {
      if (req.id === parseInt(requestId) || req.id === requestId) {
        return { ...req, ...updatedData, updatedAt: new Date().toISOString() };
      }
      return req;
    });
    
    localStorage.setItem('medical_requests', JSON.stringify(updatedRequests));
    
    // Trigger a storage event to update other components
    window.dispatchEvent(new Event('storage'));
  };

  const handleAssignRequest = (requestId: string, coordinatorName: string) => {
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    const updatedRequests = requests.map((req: any) => {
      if (req.id === parseInt(requestId) || req.id === requestId) {
        return { 
          ...req, 
          assignedCoordinator: coordinatorName,
          coordinatorActionTime: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    });
    
    localStorage.setItem('medical_requests', JSON.stringify(updatedRequests));
    
    // Log the assignment
    const auditTrail = JSON.parse(localStorage.getItem('audit_trail') || '[]');
    auditTrail.push({
      id: Date.now().toString(),
      requestId,
      action: 'Manual Assignment',
      userName: 'Admin',
      userEmail: 'admin@myclinic.com.sa',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      details: { assignedTo: coordinatorName }
    });
    localStorage.setItem('audit_trail', JSON.stringify(auditTrail));
    
    // Trigger a storage event to update other components
    window.dispatchEvent(new Event('storage'));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'case canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Admin Requests</h2>
            <p className="text-sm text-gray-600">
              {data.length} total requests
            </p>
          </div>
          
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pagination Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Current View Rows per Page</Label>
                  <Select 
                    value={paginationSettings.rowsPerPage.toString()} 
                    onValueChange={(value) => handleRowsPerPageChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 rows</SelectItem>
                      <SelectItem value="10">10 rows</SelectItem>
                      <SelectItem value="20">20 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
                      <SelectItem value="100">100 rows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Global Default for All Users</Label>
                  <Select 
                    value={paginationSettings.globalDefault.toString()} 
                    onValueChange={(value) => handleRowsPerPageChange(parseInt(value), true)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 rows</SelectItem>
                      <SelectItem value="10">10 rows</SelectItem>
                      <SelectItem value="20">20 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
                      <SelectItem value="100">100 rows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>User-Specific Settings</Label>
                  <div className="text-sm text-gray-600 mt-1">
                    {Object.keys(paginationSettings.userSpecific).length === 0 ? (
                      "No user-specific settings configured"
                    ) : (
                      Object.entries(paginationSettings.userSpecific).map(([user, rows]) => (
                        <div key={user} className="flex justify-between items-center py-1">
                          <span>{user}</span>
                          <span>{rows} rows</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Totals Summary - Clickable Filters */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
          <button 
            className="flex flex-col items-center p-2 bg-white rounded border hover:bg-green-50 transition-colors cursor-pointer"
            onClick={() => onStatusFilter && onStatusFilter('Done')}
          >
            <span className="font-semibold text-green-600">{doneCount}</span>
            <span className="text-gray-600">Done/Completed</span>
          </button>
          <button 
            className="flex flex-col items-center p-2 bg-white rounded border hover:bg-yellow-50 transition-colors cursor-pointer"
            onClick={() => onStatusFilter && onStatusFilter('Pending')}
          >
            <span className="font-semibold text-yellow-600">{pendingCount}</span>
            <span className="text-gray-600">Pending</span>
          </button>
          <button 
            className="flex flex-col items-center p-2 bg-white rounded border hover:bg-blue-50 transition-colors cursor-pointer"
            onClick={() => onStatusFilter && onStatusFilter('Scheduled')}
          >
            <span className="font-semibold text-blue-600">{scheduledCount}</span>
            <span className="text-gray-600">Scheduled</span>
          </button>
          <button 
            className="flex flex-col items-center p-2 bg-white rounded border hover:bg-red-50 transition-colors cursor-pointer"
            onClick={() => onStatusFilter && onStatusFilter('Cancelled')}
          >
            <span className="font-semibold text-red-600">{cancelledCount}</span>
            <span className="text-gray-600">Cancelled</span>
          </button>
          <button 
            className="flex flex-col items-center p-2 bg-white rounded border hover:bg-purple-50 transition-colors cursor-pointer"
            onClick={() => onStatusFilter && onStatusFilter('Planned NVD')}
          >
            <span className="font-semibold text-purple-600">{plannedNVDCount}</span>
            <span className="text-gray-600">Planned NVD</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <TableWithPagination
          data={data}
          columns={columns}
          initialRowsPerPage={paginationSettings.rowsPerPage}
        />
      </div>
    </div>
  );
}