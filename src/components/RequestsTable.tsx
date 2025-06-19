
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
                    ) : (
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View
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
