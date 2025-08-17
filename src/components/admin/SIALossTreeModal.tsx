import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface SIALossTreeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsUpdate: () => void;
}

const statusOptions = [
  'Cancelled', 'Policy Rejection', 'Insurance Rejection', 'Cancelled decision',
  'Pending', 'Reschedule', 'Privilege', 'Postponed'
];

export default function SIALossTreeModal({ open, onOpenChange, onSettingsUpdate }: SIALossTreeModalProps) {
  const [cancelledStatuses, setCancelledStatuses] = useState<string[]>(['Cancelled', 'Policy Rejection', 'Insurance Rejection']);
  const [pendingStatuses, setPendingStatuses] = useState<string[]>(['Pending', 'Reschedule', 'Privilege']);

  const handleSave = () => {
    // TODO: Save to sia_settings table
    onSettingsUpdate();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Loss Tree</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2 text-destructive">Cancelled/Rejected Statuses</h4>
            <div className="space-y-2">
              {statusOptions.map(status => (
                <div key={`cancelled-${status}`} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`cancelled-${status}`}
                    checked={cancelledStatuses.includes(status)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCancelledStatuses([...cancelledStatuses, status]);
                      } else {
                        setCancelledStatuses(cancelledStatuses.filter(s => s !== status));
                      }
                    }}
                  />
                  <label htmlFor={`cancelled-${status}`} className="text-sm">{status}</label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-warning">Pending Statuses</h4>
            <div className="space-y-2">
              {statusOptions.map(status => (
                <div key={`pending-${status}`} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`pending-${status}`}
                    checked={pendingStatuses.includes(status)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPendingStatuses([...pendingStatuses, status]);
                      } else {
                        setPendingStatuses(pendingStatuses.filter(s => s !== status));
                      }
                    }}
                  />
                  <label htmlFor={`pending-${status}`} className="text-sm">{status}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}