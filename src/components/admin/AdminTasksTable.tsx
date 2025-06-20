
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Coordinator</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.type}</TableCell>
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
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.priority === "High" ? "bg-red-100 text-red-800" :
                  item.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {item.priority}
                </span>
              </TableCell>
              <TableCell>{item.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
