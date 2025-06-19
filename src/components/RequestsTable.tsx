
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Request {
  id: number;
  patientName: string;
  mrn: string;
  serviceDescription: string;
  hospital: string;
  status: string;
  paymentStatus: string;
  assignedDoctor: string;
  createdAt: string;
  originalRequest: string;
  justificationNeeded: boolean;
  medicalHistory?: string;
  additionalNotes?: string;
  attachments?: string[];
}

interface RequestsTableProps {
  requests: Request[];
  onJustificationSubmit: (requestId: number, justification: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getPaymentStatusBadge: (status: string) => JSX.Element;
  REQUEST_STATUSES: Record<string, string>;
}

export default function RequestsTable({
  requests,
  onJustificationSubmit,
  getStatusBadge,
  getPaymentStatusBadge,
  REQUEST_STATUSES
}: RequestsTableProps) {
  const [justificationText, setJustificationText] = useState("");
  const { toast } = useToast();

  const submitJustification = (requestId: number) => {
    if (!justificationText.trim()) {
      toast({
        title: "Error",
        description: "Please provide justification text",
        variant: "destructive"
      });
      return;
    }

    onJustificationSubmit(requestId, justificationText);
    setJustificationText("");
  };

  const ViewRequestDialog = ({ request }: { request: Request }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Details - {request.patientName}</DialogTitle>
          <DialogDescription>
            Complete request information and medical details
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
              </div>
            </div>
            <div>
              <Label className="font-semibold">Referred Hospital</Label>
              <div className="mt-2">
                <Badge variant="outline" className="text-sm">
                  {request.hospital}
                </Badge>
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

          {/* Original Request */}
          <div>
            <Label className="font-semibold">Original Request</Label>
            <div className="mt-1 p-3 bg-blue-50 rounded-md text-sm">
              {request.originalRequest}
            </div>
          </div>

          {/* Medical History */}
          {request.medicalHistory && (
            <div>
              <Label className="font-semibold">Medical History</Label>
              <div className="mt-1 p-3 bg-yellow-50 rounded-md text-sm">
                {request.medicalHistory}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {request.additionalNotes && (
            <div>
              <Label className="font-semibold">Additional Notes</Label>
              <div className="mt-1 p-3 bg-green-50 rounded-md text-sm">
                {request.additionalNotes}
              </div>
            </div>
          )}

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
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="font-semibold">Current Status</Label>
              <div className="mt-1">
                {getStatusBadge(request.status)}
              </div>
            </div>
            <div>
              <Label className="font-semibold">Payment Status</Label>
              <div className="mt-1">
                {getPaymentStatusBadge(request.paymentStatus)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="overflow-x-auto mb-8">
      <table className="w-full border text-sm rounded">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            <th className="p-2">Patient Name</th>
            <th className="p-2">MRN</th>
            <th className="p-2">Service Description</th>
            <th className="p-2">Hospital</th>
            <th className="p-2">Status</th>
            <th className="p-2">Payment Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-gray-400 py-6">
                No requests found.
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id} className="border-b">
                <td className="p-2">{req.patientName}</td>
                <td className="p-2">{req.mrn}</td>
                <td className="p-2">{req.serviceDescription}</td>
                <td className="p-2">{req.hospital}</td>
                <td className="p-2">
                  {getStatusBadge(req.status)}
                </td>
                <td className="p-2">
                  {getPaymentStatusBadge(req.paymentStatus)}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {req.status === REQUEST_STATUSES.NEED_JUSTIFICATION ? (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Add Justification
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Add Justification for {req.patientName}</DialogTitle>
                              <DialogDescription>
                                Review the original request and provide additional justification
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Original Request</Label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                                  {req.originalRequest}
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="justification">Additional Justification</Label>
                                <Textarea
                                  id="justification"
                                  placeholder="Provide additional medical justification for this request..."
                                  value={justificationText}
                                  onChange={(e) => setJustificationText(e.target.value)}
                                  className="mt-1"
                                  rows={4}
                                />
                              </div>
                              <Button 
                                onClick={() => submitJustification(req.id)}
                                className="w-full"
                                disabled={!justificationText.trim()}
                              >
                                Submit Justification
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <ViewRequestDialog request={req} />
                      </>
                    ) : (
                      <ViewRequestDialog request={req} />
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
