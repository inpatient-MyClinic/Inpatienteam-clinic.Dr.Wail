import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DataBackupService, BackupSchedule } from "@/services/dataBackupService";
import { DataSyncService } from "@/services/dataSync";
import { Trash2, Download, Upload, Database, Settings, Shield, Clock } from "lucide-react";

export default function DataBackupManager() {
  const [backupSettings, setBackupSettings] = useState(DataBackupService.getBackupSettings());
  const [backupVersions, setBackupVersions] = useState(DataBackupService.getBackupVersions());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const refreshVersions = () => {
    setBackupVersions(DataBackupService.getBackupVersions());
  };

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
    DataSyncService.initializeProduction();
    toast({
      title: "System Reset Complete",
      description: "All demo data cleared and system ready for production.",
    });
    // Reload the page to reflect cleared data
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleClearPatientData = () => {
    DataBackupService.clearPatientDataOnly();
    toast({
      title: "Patient Data Cleared",
      description: "All patient/request data has been deleted. Users and settings preserved.",
    });
    // Force reload to ensure UI updates
    window.location.reload();
  };

  const handleCleanDemoData = () => {
    DataSyncService.cleanDemoData();
    DataSyncService.syncHospitalNames();
    DataSyncService.syncDoctorNames();
    toast({
      title: "Demo Data Cleaned",
      description: "All demo/test data has been removed and names synchronized.",
    });
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
          
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-6">
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
                        <SelectItem value="monthly">Monthly</SelectItem>
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
            </TabsContent>
            
            <TabsContent value="versions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Backup Versions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {backupVersions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No backup versions available</p>
                    ) : (
                      backupVersions.map((version) => (
                        <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{new Date(version.timestamp).toLocaleString()}</span>
                              {version.isMainVersion && (
                                <Badge variant="default" className="text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Main Version
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {version.data.metadata.totalRequests} requests, {version.data.metadata.totalUsers} users
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!version.isMainVersion && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  DataBackupService.setMainVersion(version.id);
                                  refreshVersions();
                                  toast({ title: "Main version updated" });
                                }}
                              >
                                Set as Main
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const dataStr = JSON.stringify(version.data, null, 2);
                                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                                const linkElement = document.createElement('a');
                                linkElement.setAttribute('href', dataUri);
                                linkElement.setAttribute('download', `backup_${version.id}.json`);
                                linkElement.click();
                              }}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            {!version.isMainVersion && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Backup Version?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this backup version.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => {
                                      DataBackupService.deleteVersion(version.id);
                                      refreshVersions();
                                      toast({ title: "Version deleted" });
                                    }}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="actions" className="space-y-6">
            
            {/* Manual Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Manual Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleManualBackup} className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Create Backup
                    </Button>
                    
                    <Button onClick={handleRestoreBackup} variant="outline" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Restore Backup
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleCleanDemoData} variant="secondary" className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Clean Demo Data
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Clear Patients
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear All Patient Data?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all patient requests and notifications, but keep users and system settings.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearPatientData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, clear patient data
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                </div>
                </div>

                <div className="mt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2 w-full">
                        <Trash2 className="w-4 h-4" />
                        Reset for Production
                      </Button>
                    </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset System for Production?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will clear all demo/test data and initialize the system for production use. A main backup version will be created before clearing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, reset for production
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
                  <p>• Automatic backups support daily, weekly, and monthly schedules</p>
                  <p>• Up to 3 backup versions are kept, plus protected main version</p>
                  <p>• "Clean Demo Data" removes test data and synchronizes names</p>
                  <p>• "Reset for Production" clears everything and creates fresh main backup</p>
                </div>
              </CardContent>
            </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}