
import React, { useState } from "react";
import { Clock, AlertTriangle, FileQuestion, Eye, Send, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { NurseRequest, REQUEST_STATUSES } from "@/hooks/useNurseRequests";

interface NurseStatsProps {
  filteredRequests: NurseRequest[];
  activeStatusFilter: string | null;
  onStatusFilterClick: (status: string | null) => void;
}

export default function NurseStats({ 
  filteredRequests, 
  activeStatusFilter, 
  onStatusFilterClick 
}: NurseStatsProps) {
  const { toast } = useToast();
  const [justificationText, setJustificationText] = useState("");

  const getStatusCount = (status: string) => {
    return filteredRequests.filter(req => req.status === status).length;
  };

  const getDelayedRequests = () => {
    return filteredRequests.filter(req => req.isDelayed);
  };

  const getNeedJustificationRequests = () => {
    return filteredRequests.filter(req => req.status === REQUEST_STATUSES.NEED_JUSTIFICATION);
  };

  const submitJustification = (requestId: number) => {
    if (!justificationText.trim()) {
      toast({
        title: "Error",
        description: "Please provide justification text",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically call updateStatus
    setJustificationText("");
    
    toast({
      title: "Justification Submitted",
      description: "Request has been forwarded with additional justification",
    });
  };

  const stats = [
    { label: "New Requests", status: REQUEST_STATUSES.PENDING, color: "bg-blue-600" },
    { label: "Under Process", status: REQUEST_STATUSES.UNDER_PROCESS, color: "bg-yellow-500" },
    { label: "Patient Contacted", status: REQUEST_STATUSES.PATIENT_CONTACTED, color: "bg-purple-500" },
    { label: "Submitted to Insurance", status: REQUEST_STATUSES.SUBMITTED_TO_INSURANCE, color: "bg-orange-500" },
    { label: "Approved by Hospital", status: REQUEST_STATUSES.APPROVED_BY_HOSPITAL, color: "bg-cyan-500" },
    { label: "Completed", status: REQUEST_STATUSES.DONE, color: "bg-green-600" },
    { label: "Rejected", status: REQUEST_STATUSES.REJECTED, color: "bg-red-500" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {stats.map((stat) => (
        <Button
          key={stat.status}
          onClick={() => onStatusFilterClick(activeStatusFilter === stat.status ? null : stat.status)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-all ${stat.color} ${
            activeStatusFilter === stat.status ? 'ring-2 ring-white ring-offset-2' : ''
          } hover:opacity-90`}
          variant="ghost"
        >
          <span className="text-xs">{stat.label}:</span>
          <span className="font-bold text-lg">{getStatusCount(stat.status)}</span>
        </Button>
      ))}
      
      {/* Delayed Requests Counter */}
      <Button
        onClick={() => onStatusFilterClick(activeStatusFilter === 'delayed' ? null : 'delayed')}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 bg-red-600 text-white transition-all ${
          activeStatusFilter === 'delayed' ? 'ring-2 ring-white ring-offset-2' : ''
        } hover:opacity-90`}
        variant="ghost"
      >
        <Clock className="w-4 h-4" />
        <span className="text-xs">Delayed:</span>
        <span className="font-bold text-lg">
          {filteredRequests.filter(req => req.isDelayed).length}
        </span>
      </Button>
      
      {/* Incomplete Requests Counter */}
      <Button
        onClick={() => onStatusFilterClick(activeStatusFilter === REQUEST_STATUSES.NOT_COMPLETED ? null : REQUEST_STATUSES.NOT_COMPLETED)}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 bg-orange-600 text-white transition-all ${
          activeStatusFilter === REQUEST_STATUSES.NOT_COMPLETED ? 'ring-2 ring-white ring-offset-2' : ''
        } hover:opacity-90`}
        variant="ghost"
      >
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs">Incomplete:</span>
        <span className="font-bold text-lg">
          {filteredRequests.filter(req => req.status === REQUEST_STATUSES.NOT_COMPLETED).length}
        </span>
      </Button>

      {/* Need Justification Counter with Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className={`flex items-center gap-2 rounded-lg px-4 py-2 bg-pink-600 text-white transition-all ${
              activeStatusFilter === REQUEST_STATUSES.NEED_JUSTIFICATION ? 'ring-2 ring-white ring-offset-2' : ''
            } hover:opacity-90`}
            variant="ghost"
          >
            <FileQuestion className="w-4 h-4" />
            <span className="text-xs">Need Justification:</span>
            <span className="font-bold text-lg">
              {getNeedJustificationRequests().length}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-pink-800">Requests Needing Justification</DialogTitle>
            <DialogDescription>
              These patients require additional medical justification as requested by hospital or case coordinator
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {getNeedJustificationRequests().length === 0 ? (
              <p className="text-center text-gray-500 py-8">No requests currently need justification</p>
            ) : (
              getNeedJustificationRequests().map((req) => (
                <div key={req.id} className="border rounded-lg p-4 space-y-4">
                  {/* Patient Info Header */}
                  <div className="flex justify-between items-start bg-pink-50 p-3 rounded">
                    <div>
                      <h3 className="font-semibold text-pink-900">{req.patientName}</h3>
                      <p className="text-sm text-pink-700">MRN: {req.mrn} | Hospital: {req.hospital}</p>
                    </div>
                    <span className="px-2 py-1 bg-pink-200 text-pink-800 rounded text-xs">
                      Justification Required
                    </span>
                  </div>

                  {/* Why Justification Needed */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <Label className="font-semibold text-yellow-800">Justification Request Details</Label>
                    <div className="mt-2 space-y-2">
                      <div className="bg-white p-2 rounded text-sm">
                        <p className="font-medium text-gray-700">Hospital Review Team:</p>
                        <p>"Additional clinical documentation required for this {req.specialty} procedure. Please provide detailed medical necessity and recent diagnostic findings."</p>
                      </div>
                      <div className="bg-white p-2 rounded text-sm">
                        <p className="font-medium text-gray-700">Case Coordinator:</p>
                        <p>"Insurance pre-authorization pending. Need comprehensive justification including treatment timeline and clinical assessment."</p>
                      </div>
                    </div>
                  </div>

                  {/* Original Request */}
                  <div>
                    <Label className="font-semibold">Original Service Request</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                      {req.serviceDescription}
                    </div>
                  </div>

                  {/* Justification Form */}
                  <div className="bg-green-50 p-3 rounded">
                    <Label className="font-semibold text-green-800">Provide Additional Justification</Label>
                    <Textarea
                      placeholder="Include detailed medical rationale, current symptoms, previous treatments, and urgency factors..."
                      value={justificationText}
                      onChange={(e) => setJustificationText(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-3">
                      <Button 
                        onClick={() => submitJustification(req.id)}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!justificationText.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Submit
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        Add Documents
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delayed Requests with Details Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className={`flex items-center gap-2 rounded-lg px-4 py-2 bg-red-600 text-white transition-all ${
              activeStatusFilter === 'delayed' ? 'ring-2 ring-white ring-offset-2' : ''
            } hover:opacity-90`}
            variant="ghost"
          >
            <Clock className="w-4 h-4" />
            <span className="text-xs">Delayed:</span>
            <span className="font-bold text-lg">
              {getDelayedRequests().length}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-red-800">Delayed Requests</DialogTitle>
            <DialogDescription>
              These requests have been delayed due to various reasons. Click to see details and take action.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {getDelayedRequests().length === 0 ? (
              <p className="text-center text-gray-500 py-8">No delayed requests</p>
            ) : (
              getDelayedRequests().map((req) => (
                <div key={req.id} className="border rounded-lg p-4 space-y-3">
                  {/* Patient Header */}
                  <div className="flex justify-between items-start bg-red-50 p-3 rounded">
                    <div>
                      <h3 className="font-semibold text-red-900">{req.patientName}</h3>
                      <p className="text-sm text-red-700">MRN: {req.mrn} | Hospital: {req.hospital}</p>
                    </div>
                    <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs">
                      DELAYED
                    </span>
                  </div>

                  {/* Delay Reasons */}
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                    <Label className="font-semibold text-orange-800">Why This Request is Delayed</Label>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="bg-white p-2 rounded">
                        <p className="font-medium text-gray-700">Primary Delay Reason:</p>
                        <p>• Missing required documentation from referring physician</p>
                        <p>• Insurance pre-authorization processing time exceeded</p>
                        <p>• Hospital capacity constraints for this specialty</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="font-medium text-gray-700">Current Status:</p>
                        <p>Waiting for {req.status === REQUEST_STATUSES.SUBMITTED_TO_INSURANCE ? 'insurance approval' : 'hospital response'}</p>
                        <p className="text-xs text-gray-500 mt-1">Last updated: 2 days ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Required */}
                  <div className="bg-blue-50 p-3 rounded">
                    <Label className="font-semibold text-blue-800">Action Required</Label>
                    <p className="text-sm mt-1">Follow up with case coordinator or contact hospital for status update</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View Full Details
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Contact Coordinator
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Status Filter */}
      {activeStatusFilter && (
        <Button
          onClick={() => onStatusFilterClick(null)}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 mt-2"
        >
          Clear Status Filter
        </Button>
      )}
    </div>
  );
}
