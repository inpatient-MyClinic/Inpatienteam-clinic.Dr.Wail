import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  FileText,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { settingsDataService } from "@/services/settingsDataService";
import { useToast } from "@/hooks/use-toast";

const SettingsDataManager = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  
  const dataSummary = settingsDataService.getDataSummary();
  const hasAnyData = settingsDataService.hasData();

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      const success = settingsDataService.clearAllData();
      if (success) {
        // Force a page reload to reset all components
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Failed to clear all data",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportData = () => {
    try {
      settingsDataService.exportAllData();
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const success = await settingsDataService.importAllData(file);
      if (success) {
        // Force a page reload to refresh all components with new data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Settings Data Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Data Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Data Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(dataSummary).map(([key, count]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600">{key}</div>
                </div>
              ))}
            </div>
            
            {!hasAnyData && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">No data found</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Your settings are empty. Start by adding users, hospital codes, or other configuration data.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Export Data */}
            <Card className="p-4">
              <div className="text-center space-y-2">
                <Download className="w-8 h-8 mx-auto text-blue-600" />
                <h4 className="font-semibold">Export All Data</h4>
                <p className="text-sm text-gray-600">
                  Download a backup of all your settings data
                </p>
                <Button 
                  onClick={handleExportData}
                  className="w-full"
                  disabled={!hasAnyData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Backup
                </Button>
              </div>
            </Card>

            {/* Import Data */}
            <Card className="p-4">
              <div className="text-center space-y-2">
                <Upload className="w-8 h-8 mx-auto text-green-600" />
                <h4 className="font-semibold">Import Data</h4>
                <p className="text-sm text-gray-600">
                  Restore settings from a backup file
                </p>
                <div className="w-full">
                  <Label htmlFor="import-file" className="sr-only">Import backup file</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    disabled={isImporting}
                    className="w-full"
                  />
                  {isImporting && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm text-blue-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Importing...
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Clear All Data */}
            <Card className="p-4 border-red-200">
              <div className="text-center space-y-2">
                <Trash2 className="w-8 h-8 mx-auto text-red-600" />
                <h4 className="font-semibold text-red-700">Clear All Data</h4>
                <p className="text-sm text-gray-600">
                  Permanently delete all settings data
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={!hasAnyData || isClearing}
                    >
                      {isClearing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear All Data
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Clear All Settings Data?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete all settings data including:
                        <ul className="mt-2 space-y-1">
                          <li>• All user accounts and permissions</li>
                          <li>• Hospital codes and configurations</li>
                          <li>• Service pricing data</li>
                          <li>• Audit trail records</li>
                          <li>• Custom fields and admin settings</li>
                          <li>• All other configuration data</li>
                        </ul>
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <strong className="text-red-800">This action cannot be undone!</strong>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAllData}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Clear All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Data Persistence Information</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• All settings data is automatically saved to your browser's local storage</p>
                  <p>• Data persists between sessions and page refreshes</p>
                  <p>• Use "Export Backup" to save your data externally</p>
                  <p>• Use "Import Data" to restore from a backup file</p>
                  <p>• Clearing browser data will remove all settings</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            Data is automatically saved and will persist across page refreshes
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsDataManager;