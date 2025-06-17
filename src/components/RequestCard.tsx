
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface Request {
  id: number;
  patientName: string;
  idNumber: string;
  phone: string;
  agreedSurgeryDate: string;
  hospital: string;
  hospitalMRN: string;
  expectedRevenue: number;
  actualRevenue: number;
  status: string;
}

interface RequestCardProps {
  request: Request;
  onStatusChange: (request: Request, status: string) => void;
}

const RequestCard = ({ request, onStatusChange }: RequestCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Under Process": return "bg-blue-100 text-blue-800";
      case "Approved": return "bg-green-100 text-green-800";
      case "Done": return "bg-purple-100 text-purple-800";
      case "Need More Justification": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-900">
            Request #{request.id} - {request.patientName}
          </CardTitle>
          <Badge className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Patient ID</p>
            <p className="font-medium">{request.idNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{request.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Surgery Date</p>
            <p className="font-medium">{request.agreedSurgeryDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hospital</p>
            <p className="font-medium">{request.hospital}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hospital MRN</p>
            <p className="font-medium">{request.hospitalMRN}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expected Revenue</p>
            <p className="font-medium">{request.expectedRevenue ? `${request.expectedRevenue.toLocaleString()} SAR` : 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {request.status === "Pending" && (
            <Button
              size="sm"
              onClick={() => onStatusChange(request, "Under Process")}
            >
              Move to Under Process
            </Button>
          )}
          {request.status === "Under Process" && (
            <>
              <Button
                size="sm"
                onClick={() => onStatusChange(request, "Approved")}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(request, "Pending")}
              >
                Back to Pending
              </Button>
            </>
          )}
          {request.status === "Approved" && (
            <>
              <Button
                size="sm"
                onClick={() => onStatusChange(request, "Done")}
              >
                Mark as Done
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(request, "Need More Justification")}
              >
                Need More Justification
              </Button>
            </>
          )}
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestCard;
