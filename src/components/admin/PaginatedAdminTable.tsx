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
}

interface PaginationSettings {
  rowsPerPage: number;
  globalDefault: number;
  userSpecific: Record<string, number>;
}

export default function PaginatedAdminTable({ data, currentUserRole = "admin" }: PaginatedAdminTableProps) {
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

    // Debug logging
    console.log('Converting task to request:');
    console.log('Task:', task);
    console.log('Found original request:', originalRequest);
    console.log('All requests in storage:', requests);

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
            <DropdownMenuItem>
              Edit Request
            </DropdownMenuItem>
            <DropdownMenuItem>
              Assign to User
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