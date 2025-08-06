
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Upload, History, X, Shield, Search, FileSpreadsheet, Database, Image, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const userCategories = [
  "Admin",
  "Doctor", 
  "Nurse",
  "Case Coordinator",
  "Hospital",
  "Finance",
  "Customer Service"
];

interface SystemCapability {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  details?: string;
}

interface LogoHistory {
  id: string;
  url: string;
  uploadedAt: string;
  fileName: string;
}

const defaultCapabilities: SystemCapability[] = [
  {
    id: "1",
    name: "Add Users",
    description: "Add users with email validation and automatic role-based permissions",
    status: "Active",
    details: "Complete user registration system with email validation, automatic role assignment based on email domain, and instant activation for authorized users."
  },
  {
    id: "2", 
    name: "Field Permissions",
    description: "Granular field-level permissions for each user category",
    status: "Active",
    details: "Advanced permission system allowing fine-grained control over what data fields each user role can view, edit, or delete across the entire platform."
  },
  {
    id: "3",
    name: "Advanced Filtering", 
    description: "Filter by category, specialty, status with real-time search",
    status: "Active",
    details: "Powerful filtering engine with real-time search capabilities, multi-criteria filtering, and instant results across all user management interfaces."
  },
  {
    id: "4",
    name: "Excel Integration",
    description: "Import users from Excel and export filtered data to CSV", 
    status: "Active",
    details: "Full Excel integration supporting bulk user import with validation, template downloads, duplicate detection, and comprehensive data export capabilities."
  },
  {
    id: "5",
    name: "Persistent Storage",
    description: "All data automatically saved to localStorage with backup capabilities",
    status: "Active",
    details: "Automatic data persistence with local storage backup, real-time synchronization, and data recovery features ensuring no data loss."
  },
  {
    id: "6",
    name: "Logo Management",
    description: "Upload, modify, and manage system logos with history tracking",
    status: "Active",
    details: "Complete logo management system with upload capabilities, version history, restore functionality, and permanent deletion options."
  },
  {
    id: "7",
    name: "Logo History",
    description: "Track and restore previous logo versions with backup functionality",
    status: "Active", 
    details: "Comprehensive logo version control with automatic backup, restoration capabilities, and permanent deletion management for system branding."
  }
];

const SystemSettings = () => {
  const { toast } = useToast();
  const [capabilities, setCapabilities] = useState<SystemCapability[]>([]);
  const [logoHistory, setLogoHistory] = useState<LogoHistory[]>([]);
  const [currentLogo, setCurrentLogo] = useState<string>("/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png");
  const [editingCapability, setEditingCapability] = useState<SystemCapability | null>(null);
  const [newCapability, setNewCapability] = useState<Partial<SystemCapability>>({});
  const [showLogoHistory, setShowLogoHistory] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    // Load capabilities from localStorage or use defaults
    const savedCapabilities = localStorage.getItem('systemCapabilities');
    if (savedCapabilities) {
      setCapabilities(JSON.parse(savedCapabilities));
    } else {
      setCapabilities(defaultCapabilities);
      localStorage.setItem('systemCapabilities', JSON.stringify(defaultCapabilities));
    }

    // Load logo history
    const savedLogoHistory = localStorage.getItem('logoHistory');
    if (savedLogoHistory) {
      setLogoHistory(JSON.parse(savedLogoHistory));
    }

    // Load current logo
    const savedCurrentLogo = localStorage.getItem('currentLogo');
    if (savedCurrentLogo) {
      setCurrentLogo(savedCurrentLogo);
    }
  }, []);

  const saveCapabilities = (newCapabilities: SystemCapability[]) => {
    setCapabilities(newCapabilities);
    localStorage.setItem('systemCapabilities', JSON.stringify(newCapabilities));
  };

  const handleAddCapability = () => {
    if (!newCapability.name || !newCapability.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const capability: SystemCapability = {
      id: Date.now().toString(),
      name: newCapability.name,
      description: newCapability.description,
      status: newCapability.status || "Active",
      details: newCapability.details
    };

    const newCapabilities = [...capabilities, capability];
    saveCapabilities(newCapabilities);
    setNewCapability({});
    toast({
      title: "Success",
      description: "System capability added successfully"
    });
  };

  const handleEditCapability = (capability: SystemCapability) => {
    const updatedCapabilities = capabilities.map(cap => 
      cap.id === capability.id ? capability : cap
    );
    saveCapabilities(updatedCapabilities);
    setEditingCapability(null);
    toast({
      title: "Success", 
      description: "System capability updated successfully"
    });
  };

  const handleDeleteCapability = (id: string) => {
    const newCapabilities = capabilities.filter(cap => cap.id !== id);
    saveCapabilities(newCapabilities);
    toast({
      title: "Success",
      description: "System capability deleted successfully"
    });
  };

  const handleToggleStatus = (id: string) => {
    const updatedCapabilities = capabilities.map(cap => 
      cap.id === id ? { ...cap, status: cap.status === "Active" ? "Inactive" as const : "Active" as const } : cap
    );
    saveCapabilities(updatedCapabilities);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Create URL for preview and save to history
      const logoUrl = URL.createObjectURL(file);
      const historyEntry: LogoHistory = {
        id: Date.now().toString(),
        url: logoUrl,
        uploadedAt: new Date().toISOString(),
        fileName: file.name
      };
      
      // Save current logo to history before changing
      if (currentLogo) {
        const currentHistoryEntry: LogoHistory = {
          id: (Date.now() - 1).toString(),
          url: currentLogo,
          uploadedAt: new Date().toISOString(),
          fileName: "previous-logo"
        };
        const newHistory = [...logoHistory, currentHistoryEntry];
        setLogoHistory(newHistory);
        localStorage.setItem('logoHistory', JSON.stringify(newHistory));
      }

      setCurrentLogo(logoUrl);
      localStorage.setItem('currentLogo', logoUrl);
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully"
      });
    }
  };

  const handleDeleteCurrentLogo = () => {
    if (currentLogo) {
      // Save to history before deleting
      const historyEntry: LogoHistory = {
        id: Date.now().toString(),
        url: currentLogo,
        uploadedAt: new Date().toISOString(),
        fileName: "deleted-logo"
      };
      const newHistory = [...logoHistory, historyEntry];
      setLogoHistory(newHistory);
      localStorage.setItem('logoHistory', JSON.stringify(newHistory));
    }
    
    setCurrentLogo("");
    localStorage.removeItem('currentLogo');
    toast({
      title: "Success",
      description: "Current logo deleted and saved to history"
    });
  };

  const handleRestoreLogo = (historyItem: LogoHistory) => {
    setCurrentLogo(historyItem.url);
    localStorage.setItem('currentLogo', historyItem.url);
    toast({
      title: "Success",
      description: "Logo restored successfully"
    });
  };

  const handlePermanentDeleteFromHistory = (id: string) => {
    const newHistory = logoHistory.filter(item => item.id !== id);
    setLogoHistory(newHistory);
    localStorage.setItem('logoHistory', JSON.stringify(newHistory));
    toast({
      title: "Success",
      description: "Logo permanently deleted from history"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Configure system-wide settings and templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Default User Category</Label>
              <Select defaultValue="Nurse">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">All new users will be assigned to this category by default</p>
            </div>

            {/* OTP Authentication Toggle */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">OTP Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require OTP verification for user login</p>
                </div>
                <Switch
                  checked={localStorage.getItem('otpEnabled') === 'true'}
                  onCheckedChange={(checked) => {
                    localStorage.setItem('otpEnabled', checked.toString());
                    console.log('OTP Setting changed:', checked);
                    console.log('localStorage value set to:', localStorage.getItem('otpEnabled'));
                    toast({
                      title: checked ? "OTP Enabled" : "OTP Disabled",
                      description: checked 
                        ? "Users will need to enter OTP codes to login" 
                        : "Users can login directly without OTP verification"
                    });
                  }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <span>Current setting:</span>
                <Badge variant={localStorage.getItem('otpEnabled') === 'true' ? 'default' : 'secondary'}>
                  {localStorage.getItem('otpEnabled') === 'true' ? 'OTP Required' : 'Direct Login'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                When disabled, users can login with just email/password. Useful for testing or environments without email service.
              </p>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Excel Upload Templates</h3>
              <Button variant="outline">Download User Template</Button>
              <p className="text-sm text-muted-foreground mt-1">Download Excel template for bulk user import</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Management */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Management</CardTitle>
          <CardDescription>Manage system logo with history tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label>Current Logo</Label>
                <div className="mt-2 p-4 border rounded-lg bg-muted/20">
                  {currentLogo ? (
                    <Logo size="md" showText={true} />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No logo uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Logo
                    </span>
                  </Button>
                </Label>
              </div>
              
              {currentLogo && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Current
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Current Logo</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the current logo and save it to history. Are you sure?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteCurrentLogo}>
                        Delete & Save to History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              <Button variant="outline" onClick={() => setShowLogoHistory(true)}>
                <History className="w-4 h-4 mr-2" />
                View History ({logoHistory.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Capabilities */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>System Capabilities</CardTitle>
              <CardDescription>Complete user management functionality with enterprise-grade features - Click any feature to see details</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Capability
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New System Capability</DialogTitle>
                  <DialogDescription>
                    Define a new system capability or feature
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newCapability.name || ""}
                      onChange={(e) => setNewCapability({...newCapability, name: e.target.value})}
                      placeholder="Capability name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCapability.description || ""}
                      onChange={(e) => setNewCapability({...newCapability, description: e.target.value})}
                      placeholder="Capability description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="details">Details (Optional)</Label>
                    <Textarea
                      id="details"
                      value={newCapability.details || ""}
                      onChange={(e) => setNewCapability({...newCapability, details: e.target.value})}
                      placeholder="Additional details"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newCapability.status === "Active"}
                      onCheckedChange={(checked) => setNewCapability({...newCapability, status: checked ? "Active" : "Inactive"})}
                    />
                    <Label>Active by default</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddCapability}>Add Capability</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((capability) => {
              const getCapabilityIcon = (name: string) => {
                switch(name) {
                  case "Add Users": return <Plus className="w-6 h-6" />;
                  case "Field Permissions": return <Shield className="w-6 h-6" />;
                  case "Advanced Filtering": return <Search className="w-6 h-6" />;
                  case "Excel Integration": return <FileSpreadsheet className="w-6 h-6" />;
                  case "Persistent Storage": return <Database className="w-6 h-6" />;
                  case "Logo Management": return <Image className="w-6 h-6" />;
                  case "Logo History": return <History className="w-6 h-6" />;
                  default: return <Settings className="w-6 h-6" />;
                }
              };

              const getIconBgColor = (name: string) => {
                switch(name) {
                  case "Add Users": return "bg-blue-100 text-blue-600";
                  case "Field Permissions": return "bg-green-100 text-green-600";
                  case "Advanced Filtering": return "bg-orange-100 text-orange-600";
                  case "Excel Integration": return "bg-purple-100 text-purple-600";
                  case "Persistent Storage": return "bg-teal-100 text-teal-600";
                  case "Logo Management": return "bg-pink-100 text-pink-600";
                  case "Logo History": return "bg-indigo-100 text-indigo-600";
                  default: return "bg-gray-100 text-gray-600";
                }
              };

              return (
                <Dialog key={capability.id}>
                  <DialogTrigger asChild>
                    <div className="border rounded-lg p-6 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20 bg-card">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${getIconBgColor(capability.name)}`}>
                          {getCapabilityIcon(capability.name)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={capability.status === "Active" ? "default" : "secondary"} className="text-xs">
                            {capability.status}
                          </Badge>
                          <Switch
                            checked={capability.status === "Active"}
                            onCheckedChange={() => handleToggleStatus(capability.id)}
                          />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{capability.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {capability.description}
                        </p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${getIconBgColor(capability.name)}`}>
                          {getCapabilityIcon(capability.name)}
                        </div>
                        <div>
                          <DialogTitle className="text-xl">{capability.name}</DialogTitle>
                          <DialogDescription>Detailed information about this system capability</DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center space-x-2">
                          <span>Status</span>
                          <Badge variant={capability.status === "Active" ? "default" : "secondary"}>
                            {capability.status}
                          </Badge>
                        </h4>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-muted-foreground">{capability.description}</p>
                      </div>
                      {capability.details && (
                        <div>
                          <h4 className="font-medium mb-2">Technical Details</h4>
                          <p className="text-muted-foreground leading-relaxed">{capability.details}</p>
                        </div>
                      )}
                      
                      {/* Special content for Logo Management */}
                      {capability.name === "Logo Management" && (
                        <div className="border-t pt-6">
                          <h4 className="font-medium mb-4">Logo Management Actions</h4>
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg bg-muted/20">
                              <div className="flex items-center justify-center mb-3">
                                {currentLogo ? (
                                  <Logo size="md" showText={true} />
                                ) : (
                                  <div className="text-center text-muted-foreground py-8">
                                    No logo uploaded
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-2 justify-center">
                                <div>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    id="logo-upload-dialog"
                                  />
                                  <Label htmlFor="logo-upload-dialog">
                                    <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                      <span>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload New
                                      </span>
                                    </Button>
                                  </Label>
                                </div>
                                {currentLogo && (
                                  <Button variant="destructive" size="sm" onClick={handleDeleteCurrentLogo}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Current
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Special content for Logo History */}
                      {capability.name === "Logo History" && (
                        <div className="border-t pt-6">
                          <h4 className="font-medium mb-4">Logo History ({logoHistory.length} items)</h4>
                          {logoHistory.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 border rounded-lg">
                              No logo history available
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                              {logoHistory.slice(0, 6).map((item) => (
                                <div key={item.id} className="border rounded-lg p-3 bg-muted/20">
                                  <div className="aspect-video bg-white rounded mb-2 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={item.url} 
                                      alt={item.fileName}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  <p className="text-xs font-medium truncate">{item.fileName}</p>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {new Date(item.uploadedAt).toLocaleDateString()}
                                  </p>
                                  <div className="flex space-x-1">
                                    <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => handleRestoreLogo(item)}>
                                      Restore
                                    </Button>
                                    <Button size="sm" variant="destructive" className="text-xs h-7 px-2" onClick={() => handlePermanentDeleteFromHistory(item.id)}>
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {logoHistory.length > 6 && (
                            <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => setShowLogoHistory(true)}>
                              View All History ({logoHistory.length} items)
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setEditingCapability(capability)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit System Capability</DialogTitle>
                            </DialogHeader>
                            {editingCapability && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={editingCapability.name}
                                    onChange={(e) => setEditingCapability({...editingCapability, name: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editingCapability.description}
                                    onChange={(e) => setEditingCapability({...editingCapability, description: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-details">Details</Label>
                                  <Textarea
                                    id="edit-details"
                                    value={editingCapability.details || ""}
                                    onChange={(e) => setEditingCapability({...editingCapability, details: e.target.value})}
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button onClick={() => editingCapability && handleEditCapability(editingCapability)}>
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Capability</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{capability.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCapability(capability.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>

          {/* All Systems Operational Status */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800 mb-2">All Systems Operational</h3>
            <p className="text-sm text-green-700">
              All {capabilities.filter(cap => cap.status === "Active").length} core system capabilities are fully functional and actively managing your user data. 
              Click any feature above to see detailed information about its current status and capabilities.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logo History Dialog */}
      <Dialog open={showLogoHistory} onOpenChange={setShowLogoHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Logo History</DialogTitle>
            <DialogDescription>
              View and manage previously uploaded logos
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {logoHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No logo history available
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {logoHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                      <img 
                        src={item.url} 
                        alt={item.fileName}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <p className="text-sm font-medium truncate">{item.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => handleRestoreLogo(item)}>
                        Restore
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Permanently Delete Logo</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this logo from history. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handlePermanentDeleteFromHistory(item.id)}>
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemSettings;
