
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  currentStatus: string;
  newStatus: string;
  requestId: number;
}

export default function StatusChangeModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
  newStatus,
  requestId
}: StatusChangeModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
    onClose();
  };

  const isBackwardMovement = 
    (currentStatus === "Under Process" && newStatus === "Pending") ||
    (currentStatus === "Approved" && newStatus === "Under Process") ||
    (currentStatus === "Approved" && newStatus === "Need More Justification");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Change Status: {currentStatus} → {newStatus}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Request ID: {requestId}
          </p>
          
          {isBackwardMovement && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ This action will move the request backward in the workflow. 
                Please provide a reason for this change.
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isBackwardMovement ? "Reason for status change (required):" : "Additional notes (optional):"}
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isBackwardMovement ? "Please explain why this status change is needed..." : "Add any additional notes..."}
              rows={3}
              required={isBackwardMovement}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={isBackwardMovement && !reason.trim()}
            >
              Confirm Change
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
