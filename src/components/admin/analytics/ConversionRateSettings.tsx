import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ConversionRateSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  includeDone: boolean;
  includeScheduled: boolean;
  includePlannedNVD: boolean;
  doneCount: number;
  scheduledCount: number;
  plannedNVDCount: number;
  totalRequests: number;
  onToggleDone: () => void;
  onToggleScheduled: () => void;
  onTogglePlannedNVD: () => void;
}

export default function ConversionRateSettings({
  open,
  onOpenChange,
  includeDone,
  includeScheduled,
  includePlannedNVD,
  doneCount,
  scheduledCount,
  plannedNVDCount,
  totalRequests,
  onToggleDone,
  onToggleScheduled,
  onTogglePlannedNVD
}: ConversionRateSettingsProps) {
  const { toast } = useToast();

  // Calculate preview conversion rate
  const includedCount = (includeDone ? doneCount : 0) + 
                       (includeScheduled ? scheduledCount : 0) + 
                       (includePlannedNVD ? plannedNVDCount : 0);
  const previewRate = totalRequests > 0 ? (includedCount / totalRequests * 100).toFixed(1) : "0";

  const handleSave = () => {
    // Save settings to localStorage
    const settings = {
      includeDone,
      includeScheduled,
      includePlannedNVD
    };
    localStorage.setItem('conversionRateSettings', JSON.stringify(settings));
    
    toast({
      title: "Settings Saved",
      description: "Conversion rate calculation preferences have been saved.",
    });
    
    onOpenChange(false);
  };

  const handleReset = () => {
    // Reset to default settings
    if (!includeDone) onToggleDone();
    if (!includeScheduled) onToggleScheduled();
    if (!includePlannedNVD) onTogglePlannedNVD();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conversion Rate Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {previewRate}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {includedCount} of {totalRequests} requests
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Include in Conversion Rate:</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="done-toggle">Done/Completed</Label>
                <p className="text-xs text-muted-foreground">{doneCount} requests</p>
              </div>
              <Switch
                id="done-toggle"
                checked={includeDone}
                onCheckedChange={onToggleDone}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="scheduled-toggle">Scheduled</Label>
                <p className="text-xs text-muted-foreground">{scheduledCount} requests</p>
              </div>
              <Switch
                id="scheduled-toggle"
                checked={includeScheduled}
                onCheckedChange={onToggleScheduled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="planned-toggle">Planned NVD</Label>
                <p className="text-xs text-muted-foreground">{plannedNVDCount} requests</p>
              </div>
              <Switch
                id="planned-toggle"
                checked={includePlannedNVD}
                onCheckedChange={onTogglePlannedNVD}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}