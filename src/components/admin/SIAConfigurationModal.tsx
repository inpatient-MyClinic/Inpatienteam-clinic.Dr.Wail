import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface SIAConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsUpdate: () => void;
}

const statusOptions = [
  'Completed', 'Scheduled', 'Planned NVD', 'Pending', 'Cancelled',
  'Policy Rejection', 'Insurance Rejection', 'Postponed', 'Reschedule'
];

export default function SIAConfigurationModal({ open, onOpenChange, onSettingsUpdate }: SIAConfigurationModalProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Completed', 'Scheduled', 'Planned NVD']);

  const handleSave = () => {
    // TODO: Save to sia_settings table
    onSettingsUpdate();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Conversion Rate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select which statuses should count as "completed" for conversion rate calculation:
          </p>
          <div className="space-y-2">
            {statusOptions.map(status => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox 
                  id={status}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedStatuses([...selectedStatuses, status]);
                    } else {
                      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                    }
                  }}
                />
                <label htmlFor={status} className="text-sm">{status}</label>
              </div>
            ))}
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