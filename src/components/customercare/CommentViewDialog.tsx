import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Send, CheckCircle, MessageSquare } from "lucide-react";

interface CommentViewDialogProps {
  comment: string;
  patientId: string;
  npsScore: number;
  coordinatorName?: string;
  requestId: string;
  onSendCompliment: (requestId: string, coordinatorName: string, comment: string) => void;
  onSubmitRecovery: (requestId: string, recoveryNote: string) => void;
}

export default function CommentViewDialog({
  comment,
  patientId,
  npsScore,
  coordinatorName,
  requestId,
  onSendCompliment,
  onSubmitRecovery
}: CommentViewDialogProps) {
  const [recoveryNote, setRecoveryNote] = useState("");
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isCompliment = npsScore >= 9;
  const isComplaint = npsScore <= 6;
  const hasCoordinatorMention = coordinatorName && comment.toLowerCase().includes(coordinatorName.toLowerCase());

  const handleSendCompliment = () => {
    if (coordinatorName) {
      onSendCompliment(requestId, coordinatorName, comment);
      setIsOpen(false);
    }
  };

  const handleSubmitRecovery = () => {
    if (recoveryNote.trim()) {
      onSubmitRecovery(requestId, recoveryNote);
      setIsOpen(false);
      setShowRecoveryForm(false);
      setRecoveryNote("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            Patient Comments
            {isCompliment && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Compliment (NPS: {npsScore})
              </span>
            )}
            {isComplaint && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                Complaint (NPS: {npsScore})
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

          {/* Action buttons based on NPS score */}
          <div className="flex flex-col gap-3">
            {isCompliment && coordinatorName && hasCoordinatorMention && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Send Compliment to Coordinator</h4>
                <p className="text-sm text-green-700 mb-3">
                  This positive feedback mentions {coordinatorName}. Send this compliment to them?
                </p>
                <Button onClick={handleSendCompliment} className="bg-green-600 hover:bg-green-700">
                  <Send className="w-4 h-4 mr-2" />
                  Send to {coordinatorName}
                </Button>
              </div>
            )}

            {isComplaint && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">Submit for Recovery</h4>
                <p className="text-sm text-red-700 mb-3">
                  This complaint requires attention. Submit to case coordinator for recovery action?
                </p>
                
                {!showRecoveryForm ? (
                  <Button 
                    onClick={() => setShowRecoveryForm(true)} 
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit for Recovery
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="recoveryNote">Recovery Action Note</Label>
                      <Textarea
                        id="recoveryNote"
                        placeholder="Add notes for the case coordinator about required recovery actions..."
                        value={recoveryNote}
                        onChange={(e) => setRecoveryNote(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitRecovery} className="bg-red-600 hover:bg-red-700">
                        Submit to Case Coordinator
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowRecoveryForm(false);
                          setRecoveryNote("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {npsScore >= 7 && npsScore <= 8 && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  This is neutral feedback (NPS: {npsScore}). No special action required.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}