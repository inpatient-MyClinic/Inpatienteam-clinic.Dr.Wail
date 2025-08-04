import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings } from "lucide-react";
import ViewRequestDialog from "@/components/ViewRequestDialog/ViewRequestDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AdminTask {
  id: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Convert AdminTask to request format for ViewRequestDialog
  const convertToRequest = (task: AdminTask) => {
    const getValidDateString = (date: Date | null) => {
      if (!date || isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      return date.toISOString();
    };

    return {
      id: parseInt(task.id) || 1,
      patientName: `Patient for ${task.description}`,
      mrn: `MRN-${task.id}`,
      serviceDescription: task.description,
      doctorName: task.user,
      hospital: task.hospital,
      specialty: task.specialty,
      status: task.status,
      createdAt: getValidDateString(task.requestDate),
      assignedCoordinator: task.caseCoordinator,
      phone: "",
      idNumber: "",
      age: "",
      gender: "",
      nationality: "",
      diagnosis: "",
      urgency: "Normal",
      expectedSurgeryDate: "",
      medicalHistory: "",
      currentMedications: "",
      allergies: "",
      insuranceCompany: "",
      policyNumber: "",
      contactPerson: "",
      contactPhone: "",
      contactEmail: "",
      notes: "",
      rejectionReason: ""
    };
  };

  // Filter data based on search term
  const filteredData = data.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const { rowsPerPage } = paginationSettings;
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset to first page when rows per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

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
              Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} requests
            </p>
          </div>
          
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            
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
                      value={rowsPerPage.toString()} 
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
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm">{item.id}</TableCell>
                <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                <TableCell>{item.user}</TableCell>
                <TableCell className="max-w-xs truncate">{item.hospital}</TableCell>
                <TableCell>{item.specialty}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{item.date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <ViewRequestDialog 
                          request={convertToRequest(item)}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <Select 
            value={rowsPerPage.toString()} 
            onValueChange={(value) => handleRowsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-600 px-2">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}