import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Download, Upload, Trash2, Database, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataBackupService, BackupSchedule } from "@/services/dataBackupService";

export default function DataBackupManager() {
  const [backupSettings, setBackupSettings] = useState(DataBackupService.getBackupSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleScheduleChange = (schedule: BackupSchedule) => {
    const newSettings = { ...backupSettings, schedule };
    setBackupSettings(newSettings);
    DataBackupService.saveBackupSettings(newSettings);
    
    if (schedule === 'now') {
      DataBackupService.downloadBackup();
      toast({
        title: "Backup Created",
        description: "Backup file has been downloaded to your device.",
      });
    } else {
      toast({
        title: "Backup Schedule Updated",
        description: `Backup schedule set to: ${schedule}`,
      });
    }
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...backupSettings, time };
    setBackupSettings(newSettings);
    DataBackupService.saveBackupSettings(newSettings);
  };

  const handleEnabledChange = (enabled: boolean) => {
    const newSettings = { ...backupSettings, enabled };
    setBackupSettings(newSettings);
    DataBackupService.saveBackupSettings(newSettings);
    
    toast({
      title: enabled ? "Backup Enabled" : "Backup Disabled",
      description: enabled ? "Automatic backups are now enabled." : "Automatic backups have been disabled.",
    });
  };

  const handleManualBackup = () => {
    DataBackupService.downloadBackup();
    toast({
      title: "Backup Created",
      description: "Manual backup has been downloaded successfully.",
    });
  };

  const handleRestoreBackup = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await DataBackupService.restoreFromFile(file);
      toast({
        title: "Backup Restored",
        description: "Data has been successfully restored from backup.",
      });
      // Reload the page to reflect restored data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Failed to restore backup. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleClearAllData = () => {
    DataBackupService.clearAllData();
    toast({
      title: "All Data Cleared",
      description: "All application data has been permanently deleted.",
    });
    // Reload the page to reflect cleared data
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json"
        className="hidden"
      />
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex flex-col h-20 gap-2">
            <Database className="w-5 h-5" />
            <span className="text-xs">Data Backup</span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Data Backup Management</DialogTitle>
            <DialogDescription>
              Configure automatic backups and manage your system data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Backup Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Backup Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="backup-enabled">Enable Automatic Backups</Label>
                  <Switch
                    id="backup-enabled"
                    checked={backupSettings.enabled}
                    onCheckedChange={handleEnabledChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Backup Schedule</Label>
                    <Select
                      value={backupSettings.schedule}
                      onValueChange={handleScheduleChange}
                      disabled={!backupSettings.enabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Backup Now</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Backup Time</Label>
                    <Input
                      type="time"
                      value={backupSettings.time}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      disabled={!backupSettings.enabled || backupSettings.schedule === 'disabled'}
                    />
                  </div>
                </div>
                
                {backupSettings.lastBackup && (
                  <p className="text-sm text-muted-foreground">
                    Last backup: {new Date(backupSettings.lastBackup).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Manual Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Manual Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={handleManualBackup} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Create Backup
                  </Button>
                  
                  <Button onClick={handleRestoreBackup} variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Restore Backup
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all application data including requests, users, notifications, and settings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Yes, delete everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
            
            {/* Backup Information */}
            <Card>
              <CardHeader>
                <CardTitle>Backup Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Backups include all requests, users, settings, and notifications</p>
                  <p>• Automatic backups are saved locally and downloaded to your device</p>
                  <p>• Manual backups are immediately downloaded as JSON files</p>
                  <p>• Use "Clear All Data" to reset the system for production use</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}