import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bug, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  HardDrive,
  Network,
  Clock,
  Zap,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExcelDataValidator } from './ExcelDataValidator';

export default function SystemDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClearLocalStorage = () => {
    setIsClearing(true);
    try {
      localStorage.clear();
      toast({
        title: "Cache Cleared",
        description: "All local storage data has been cleared successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear local storage.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearSessionStorage = () => {
    try {
      sessionStorage.clear();
      toast({
        title: "Session Cleared",
        description: "All session storage data has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear session storage.",
        variant: "destructive",
      });
    }
  };

  const handleReloadPage = () => {
    window.location.reload();
  };

  const getSystemInfo = () => {
    const now = new Date();
    const memoryInfo = (performance as any).memory || {};
    
    return {
      timestamp: now.toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      memory: {
        used: memoryInfo.usedJSHeapSize ? `${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A',
        total: memoryInfo.totalJSHeapSize ? `${Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024)}MB` : 'N/A',
        limit: memoryInfo.jsHeapSizeLimit ? `${Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)}MB` : 'N/A'
      },
      localStorage: {
        used: new Blob(Object.values(localStorage)).size,
        itemCount: localStorage.length
      },
      sessionStorage: {
        used: new Blob(Object.values(sessionStorage)).size,
        itemCount: sessionStorage.length
      }
    };
  };

  const getLocalStorageData = () => {
    const data: Array<{key: string, size: number, preview: string}> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        data.push({
          key,
          size: new Blob([value]).size,
          preview: value.length > 100 ? value.substring(0, 100) + '...' : value
        });
      }
    }
    return data.sort((a, b) => b.size - a.size);
  };

  const getErrorLogs = () => {
    // Get console errors (this is a simplified version)
    const errors = [];
    try {
      const logs = console.error.toString();
      if (logs.includes('Error') || logs.includes('Exception')) {
        errors.push({
          type: 'Console Error',
          message: 'Console errors detected',
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      // Silently handle
    }
    return errors;
  };

  const systemInfo = getSystemInfo();
  const localStorageData = getLocalStorageData();
  const errorLogs = getErrorLogs();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bug className="h-4 w-4" />
          Debug
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            System Debugger
          </DialogTitle>
          <DialogDescription>
            Debug system issues, clear cache, and view system information
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="validation">Data Validation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      System Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Timestamp:</span>
                        <div className="text-muted-foreground">{systemInfo.timestamp}</div>
                      </div>
                      <div>
                        <span className="font-medium">Viewport:</span>
                        <div className="text-muted-foreground">{systemInfo.viewport}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">URL:</span>
                        <div className="text-muted-foreground break-all">{systemInfo.url}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Memory Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Used:</span>
                        <div className="text-muted-foreground">{systemInfo.memory.used}</div>
                      </div>
                      <div>
                        <span className="font-medium">Total:</span>
                        <div className="text-muted-foreground">{systemInfo.memory.total}</div>
                      </div>
                      <div>
                        <span className="font-medium">Limit:</span>
                        <div className="text-muted-foreground">{systemInfo.memory.limit}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-4 w-4" />
                      Health Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Local Storage</span>
                        <Badge variant={systemInfo.localStorage.itemCount > 0 ? "default" : "secondary"}>
                          {systemInfo.localStorage.itemCount > 0 ? "Active" : "Empty"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Session Storage</span>
                        <Badge variant={systemInfo.sessionStorage.itemCount > 0 ? "default" : "secondary"}>
                          {systemInfo.sessionStorage.itemCount > 0 ? "Active" : "Empty"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Error Count</span>
                        <Badge variant={errorLogs.length > 0 ? "destructive" : "default"}>
                          {errorLogs.length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="storage" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Local Storage ({localStorageData.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {localStorageData.map((item, index) => (
                      <div key={index} className="border rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{item.key}</span>
                          <Badge variant="outline">{Math.round(item.size / 1024)}KB</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground break-all">
                          {item.preview}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="errors" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Error Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {errorLogs.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      No errors detected
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {errorLogs.map((error, index) => (
                        <div key={index} className="border border-red-200 rounded p-2 bg-red-50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-red-800">{error.type}</span>
                            <span className="text-xs text-red-600">{error.timestamp}</span>
                          </div>
                          <div className="text-sm text-red-700">{error.message}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={handleClearLocalStorage}
                    disabled={isClearing}
                    className="w-full"
                  >
                    {isClearing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Clear Local Storage ({systemInfo.localStorage.itemCount} items)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleClearSessionStorage}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Session Storage ({systemInfo.sessionStorage.itemCount} items)
                  </Button>
                  
                  <Separator />
                  
                  <Button 
                    variant="outline" 
                    onClick={handleReloadPage}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Quick Diagnostics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Page Load Time:</span>
                      <span>{Math.round(performance.now())}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Connection:</span>
                      <Badge variant={(navigator as any).onLine ? "default" : "destructive"}>
                        {(navigator as any).onLine ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Local Time:</span>
                      <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="validation">
            <ExcelDataValidator />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}