
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { NurseRequest, REQUEST_STATUSES } from "@/hooks/useNurseRequests";

interface NurseRequestsTableProps {
  filteredRequests: NurseRequest[];
  updateStatus: (requestId: number, newStatus: string) => void;
}

export default function NurseRequestsTable({ 
  filteredRequests, 
  updateStatus 
}: NurseRequestsTableProps) {
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm rounded">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-2">Patient Name</th>
            <th className="p-2">MRN</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Service Description</th>
            <th className="p-2">Expected Surgery Date</th>
            <th className="p-2">Hospital</th>
            <th className="p-2">Assigned Doctor</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-gray-400 py-6">
                No requests found.
              </td>
            </tr>
          ) : (
            filteredRequests.map((req) => (
              <tr key={req.id} className="border-b">
                <td className="p-2">{req.patientName}</td>
                <td className="p-2">{req.mrn}</td>
                <td className="p-2">{req.phone}</td>
                <td className="p-2">{req.serviceDescription}</td>
                <td className="p-2">{req.expectedSurgeryDate}</td>
                <td className="p-2">{req.hospital}</td>
                <td className="p-2">{req.assignedDoctor}</td>
                <td className="p-2">
                  {getStatusBadge(req.status, req.isDelayed)}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                    {req.status === REQUEST_STATUSES.NOT_COMPLETED && (
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus(req.id, REQUEST_STATUSES.PENDING)}
                      >
                        Complete & Resubmit
                      </Button>
                    )}
                    {req.status === REQUEST_STATUSES.PENDING && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStatus(req.id, REQUEST_STATUSES.UNDER_PROCESS)}
                      >
                        Process
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
