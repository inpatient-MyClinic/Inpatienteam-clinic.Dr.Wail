import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Send, CheckCircle, MessageSquare, UserCheck, X } from "lucide-react";

interface CommentViewDialogProps {
  comment: string;
  patientId: string;
  npsScore: number;
  coordinatorName?: string;
  requestId: string;
  recoverySubmitted?: boolean;
  complaintClosed?: boolean;
  onSendCompliment: (requestId: string, coordinatorName: string, comment: string) => void;
  onSubmitRecovery: (requestId: string, recoveryNote: string) => void;
  onCloseComplaint: (requestId: string) => void;
}

export default function CommentViewDialog({
  comment,
  patientId,
  npsScore,
  coordinatorName,
  requestId,
  recoverySubmitted,
  complaintClosed,
  onSendCompliment,
  onSubmitRecovery,
  onCloseComplaint
}: CommentViewDialogProps) {
  const [recoveryNote, setRecoveryNote] = useState("");
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [showComplimentForm, setShowComplimentForm] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState("");
  const [coordinatorsList, setCoordinatorsList] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  // Load coordinators list
  useEffect(() => {
    const loadCoordinators = () => {
      const requests = JSON.parse(localStorage.getItem("medical_requests") || "[]");
      const coordinators: string[] = [...new Set(requests
        .filter((req: any) => req.assignedCoordinator || req.caseCoordinator)
        .map((req: any) => req.assignedCoordinator || req.caseCoordinator)
        .filter(Boolean)
      )] as string[];
      
      // Add some default coordinators if none found
      if (coordinators.length === 0) {
        coordinators.push("Saud Al-Harthi", "Rashed Al-Dibban", "Ahmed Mohamed", "Sara Abdullah");
      }
      
      setCoordinatorsList(coordinators);
    };

    if (isOpen) {
      loadCoordinators();
    }
  }, [isOpen]);

  const handleSendCompliment = () => {
    if (selectedCoordinator) {
      onSendCompliment(requestId, selectedCoordinator, comment);
      setActionTaken("compliment");
      setShowComplimentForm(false);
      setSelectedCoordinator("");
    }
  };

  const handleSubmitRecovery = () => {
    if (recoveryNote.trim()) {
      onSubmitRecovery(requestId, recoveryNote);
      setActionTaken("recovery");
      setShowRecoveryForm(false);
      setRecoveryNote("");
    }
  };

  const handleCloseComplaint = () => {
    onCloseComplaint(requestId);
    setActionTaken("closed");
  };

  // Initialize state based on props
  useEffect(() => {
    if (recoverySubmitted) {
      setActionTaken("recovery");
    } else if (complaintClosed) {
      setActionTaken("closed");
    }
  }, [recoverySubmitted, complaintClosed]);

  const resetForms = () => {
    setShowRecoveryForm(false);
    setShowComplimentForm(false);
    setRecoveryNote("");
    setSelectedCoordinator("");
    setActionTaken(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForms();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Patient Comment Management
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              NPS: {npsScore}
            </span>
            {actionTaken && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Action: {actionTaken}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Patient ID: {patientId}</p>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="whitespace-pre-wrap">{comment}</p>
            </div>
          </div>

          {/* Action Options - Only available if no action has been taken */}
          {!actionTaken && !recoverySubmitted && !complaintClosed && (
            <div className="grid grid-cols-1 gap-3">
              {/* Send Thanks/Compliment to Coordinator */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Send Thanks to Coordinator</h4>
                {!showComplimentForm ? (
                  <Button 
                    onClick={() => setShowComplimentForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Send Thanks to Coordinator
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="coordinatorSelect">Select Coordinator</Label>
                      <Select value={selectedCoordinator} onValueChange={setSelectedCoordinator}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose coordinator to thank" />
                        </SelectTrigger>
                        <SelectContent>
                          {coordinatorsList.map((coordinator) => (
                            <SelectItem key={coordinator} value={coordinator}>
                              {coordinator}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSendCompliment}
                        disabled={!selectedCoordinator}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send Thanks
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowComplimentForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit for Recovery */}
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-800 mb-2">Submit for Recovery</h4>
                {!showRecoveryForm ? (
                  <Button 
                    onClick={() => setShowRecoveryForm(true)} 
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit for Recovery
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="recoveryNote">Recovery Action Note (Required)</Label>
                      <Textarea
                        id="recoveryNote"
                        placeholder="Add notes for the case coordinator about required recovery actions..."
                        value={recoveryNote}
                        onChange={(e) => setRecoveryNote(e.target.value)}
                        className="mt-1"
                        rows={3}
                        required
                      />
                      {!recoveryNote.trim() && (
                        <p className="text-sm text-red-600 mt-1">Recovery note is required</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSubmitRecovery}
                        disabled={!recoveryNote.trim()}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Submit to Case Coordinator
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRecoveryForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Complaint */}
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">Close Complaint</h4>
                <p className="text-sm text-red-700 mb-3">
                  Mark this comment as resolved and close the complaint.
                </p>
                <Button 
                  onClick={handleCloseComplaint}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close Complaint
                </Button>
              </div>
            </div>
          )}

          {/* Show status if action already taken */}
          {(recoverySubmitted || complaintClosed || actionTaken) && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  {recoverySubmitted && "Recovery case has been submitted to case coordinator"}
                  {complaintClosed && "Complaint has been closed"}
                  {actionTaken === "compliment" && "Thanks sent to coordinator successfully!"}
                  {actionTaken === "recovery" && "Recovery case submitted to case coordinator!"}
                  {actionTaken === "closed" && "Complaint has been closed!"}
                </span>
              </div>
              {(recoverySubmitted || complaintClosed) && (
                <p className="text-sm text-blue-600 mt-2">
                  No further actions can be taken on this case.
                </p>
              )}
            </div>
          )}

          {/* Action Taken Confirmation (for new actions) */}
          {actionTaken && !recoverySubmitted && !complaintClosed && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  {actionTaken === "compliment" && "Thanks sent to coordinator successfully!"}
                  {actionTaken === "recovery" && "Recovery case submitted to case coordinator!"}
                  {actionTaken === "closed" && "Complaint has been closed!"}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {actionTaken ? "Done" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}