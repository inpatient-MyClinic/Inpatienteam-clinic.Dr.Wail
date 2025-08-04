
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical } from "lucide-react";
import ViewRequestDialog from "@/components/ViewRequestDialog/ViewRequestDialog";

interface AdminTask {
  id: string;
  type: string;
  description: string;
  user: string;
  status: string;
  date: string;
  priority: string;
  specialty: string;
  hospital: string;
  caseCoordinator: string;
  requestDate: Date;
  completionDate: Date | null;
}

interface AdminTasksTableProps {
  filteredData: AdminTask[];
}

export default function AdminTasksTable({ filteredData }: AdminTasksTableProps) {
  // Convert AdminTask to request format for ViewRequestDialog
  const convertToRequest = (task: AdminTask) => {
    // Safely handle potentially invalid dates
    const getValidDateString = (date: Date | null) => {
      if (!date || isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      return date.toISOString();
    };

    return {
      id: parseInt(task.id),
      patientName: `Patient for ${task.description}`,
      mrn: `MRN-${task.id}`,
      serviceDescription: task.description,
      doctorName: task.user,
      hospital: task.hospital,
      specialty: task.specialty,
      status: task.status,
      createdAt: getValidDateString(task.requestDate),
      assignedCoordinator: task.caseCoordinator,
      // Add other required fields with defaults
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

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Recent Admin Tasks</h2>
        <p className="text-sm text-gray-600">Showing {filteredData.length} tasks</p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Coordinator</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.user}</TableCell>
              <TableCell>{item.hospital}</TableCell>
              <TableCell>{item.specialty}</TableCell>
              <TableCell>{item.caseCoordinator}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.status === "Completed" ? "bg-green-100 text-green-800" :
                  item.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {item.status}
                </span>
              </TableCell>
              <TableCell>{item.date}</TableCell>
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
                        currentUserRole="admin"
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Assign to User
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
