import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { servicesBySpecialty } from "@/data/medicalData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import EnhancedPricingAccess from "./settings/EnhancedPricingAccess";

const hospitals = [
  "King Fahad Hospital",
  "King Faisal Hospital", 
  "King Abdulaziz Hospital",
  "Prince Sultan Hospital",
  "King Khalid Hospital",
  "King Saud Hospital",
  "National Guard Hospital",
  "Specialized Hospital"
];

interface PricingChange {
  id: string;
  service: string;
  hospital: string;
  newPrice: number;
  oldPrice: number;
  modifiedBy: string;
  modifiedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  userType: 'hospital' | 'doctor' | 'finance' | 'admin';
}

interface UserAccess {
  canView: boolean;
  userType: 'hospital' | 'doctor' | 'finance' | 'admin';
  hospitalCode?: string;
}

const ServicePricingTable = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [pricing, setPricing] = useState<{[key: string]: {[hospital: string]: number}}>({});
  const [pendingChanges, setPendingChanges] = useState<PricingChange[]>([]);
  const [userAccess, setUserAccess] = useState<{[userId: string]: UserAccess}>({});

  // Check if current user is admin
  const isAdmin = () => {
    return user?.email?.includes('admin') || 
           user?.email === 'wail.ahmed@myclinic.com.sa' ||
           user?.email === 'inpatienteam@gmail.com' ||
           localStorage.getItem('userRole') === 'admin';
  };

  useEffect(() => {
    // Load saved data from localStorage
    const savedPricing = localStorage.getItem('servicePricing');
    const savedPendingChanges = localStorage.getItem('pendingPricingChanges');
    const savedUserAccess = localStorage.getItem('pricingUserAccess');
    
    if (savedPricing) setPricing(JSON.parse(savedPricing));
    if (savedPendingChanges) setPendingChanges(JSON.parse(savedPendingChanges));
    if (savedUserAccess) setUserAccess(JSON.parse(savedUserAccess));

    // Load sample pricing data if empty
    if (!savedPricing) {
      const samplePricing = {
        "Cardiac Catheterization": {
          "King Fahad Hospital": 15000,
          "King Faisal Hospital": 14500,
          "King Abdulaziz Hospital": 16000
        },
        "Angioplasty": {
          "King Fahad Hospital": 25000,
          "King Faisal Hospital": 24000,
          "King Abdulaziz Hospital": 26000
        }
      };
      setPricing(samplePricing);
      localStorage.setItem('servicePricing', JSON.stringify(samplePricing));
    }
  }, []);

  const getCurrentUserAccess = () => {
    if (!user?.id) return null;
    
    if (isAdmin()) {
      return { canView: true, userType: 'admin' as const, hospitalCode: undefined };
    }
    
    return userAccess[user.id] || null;
  };

  const handlePriceChange = (service: string, hospital: string, price: string) => {
    const newPrice = parseFloat(price) || 0;
    const oldPrice = pricing[service]?.[hospital] || 0;
    const currentAccess = getCurrentUserAccess();
    
    // Admin can modify directly
    if (isAdmin()) {
      setPricing(prev => {
        const updated = {
          ...prev,
          [service]: {
            ...prev[service],
            [hospital]: newPrice
          }
        };
        localStorage.setItem('servicePricing', JSON.stringify(updated));
        return updated;
      });
      
      toast({
        title: "Price Updated",
        description: `Price for ${service} at ${hospital} updated to ${newPrice} SAR`,
      });
      return;
    }
    
    if (!currentAccess?.canView) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to modify pricing",
        variant: "destructive"
      });
      return;
    }

    // For hospital users, only allow changes to their own hospital
    if (currentAccess.userType === 'hospital' && currentAccess.hospitalCode && currentAccess.hospitalCode !== hospital) {
      toast({
        title: "Access Denied",
        description: "You can only modify pricing for your hospital",
        variant: "destructive"
      });
      return;
    }

    // Create pending change for non-admin users
    const change: PricingChange = {
      id: Date.now().toString(),
      service,
      hospital,
      newPrice,
      oldPrice,
      modifiedBy: user?.email || 'Unknown',
      modifiedAt: new Date().toISOString(),
      status: 'pending',
      userType: currentAccess.userType
    };

    setPendingChanges(prev => {
      const updated = [...prev.filter(c => !(c.service === service && c.hospital === hospital)), change];
      localStorage.setItem('pendingPricingChanges', JSON.stringify(updated));
      return updated;
    });

    toast({
      title: "Change Submitted",
      description: "Your pricing change is pending admin approval",
    });
  };

  const approvePendingChange = (changeId: string) => {
    const change = pendingChanges.find(c => c.id === changeId);
    if (!change) return;

    // Update actual pricing
    setPricing(prev => {
      const updated = {
        ...prev,
        [change.service]: {
          ...prev[change.service],
          [change.hospital]: change.newPrice
        }
      };
      localStorage.setItem('servicePricing', JSON.stringify(updated));
      return updated;
    });

    // Remove from pending changes
    setPendingChanges(prev => {
      const updated = prev.filter(c => c.id !== changeId);
      localStorage.setItem('pendingPricingChanges', JSON.stringify(updated));
      return updated;
    });

    toast({
      title: "Change Approved",
      description: `Pricing change for ${change.service} at ${change.hospital} has been approved`,
    });
  };

  const rejectPendingChange = (changeId: string) => {
    const change = pendingChanges.find(c => c.id === changeId);
    
    setPendingChanges(prev => {
      const updated = prev.filter(c => c.id !== changeId);
      localStorage.setItem('pendingPricingChanges', JSON.stringify(updated));
      return updated;
    });

    toast({
      title: "Change Rejected",
      description: change ? `Pricing change for ${change.service} at ${change.hospital} has been rejected` : "Change rejected",
    });
  };

  const getCurrentUserDisplayPrice = (service: string, hospital: string) => {
    // For non-admin users, show pending changes
    if (!isAdmin()) {
      const pendingChange = pendingChanges.find(c => c.service === service && c.hospital === hospital);
      if (pendingChange) {
        return pendingChange.newPrice;
      }
    }
    return pricing[service]?.[hospital] || "";
  };

  const getPendingChangeForCell = (service: string, hospital: string) => {
    return pendingChanges.find(c => c.service === service && c.hospital === hospital);
  };

  const getFilteredHospitals = () => {
    const currentAccess = getCurrentUserAccess();
    
    if (isAdmin()) {
      return hospitals;
    }
    
    if (currentAccess?.userType === 'hospital' && currentAccess.hospitalCode) {
      return [currentAccess.hospitalCode];
    }
    
    return hospitals;
  };

  const canViewPricing = () => {
    if (isAdmin()) {
      return true;
    }
    
    const currentAccess = getCurrentUserAccess();
    return currentAccess?.canView || false;
  };

  const availableServices = selectedSpecialty ? servicesBySpecialty[selectedSpecialty] || [] : [];

  return (
    <Tabs defaultValue="pricing" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pricing">Service Pricing</TabsTrigger>
        <TabsTrigger value="access">Access Control</TabsTrigger>
        {pendingChanges.length > 0 && (
          <TabsTrigger value="pending">
            Pending Changes ({pendingChanges.length})
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="pricing">
        <Card>
          <CardHeader>
            <CardTitle>Service Pricing by Hospital</CardTitle>
            {isAdmin() && (
              <p className="text-sm text-muted-foreground text-green-600">
                Admin Access: You can view and modify all pricing directly
              </p>
            )}
            {!canViewPricing() && (
              <p className="text-sm text-muted-foreground text-red-600">
                You don't have access to view pricing. Contact your administrator.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {canViewPricing() ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Specialty</Label>
                    <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(servicesBySpecialty).map(specialty => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty.charAt(0).toUpperCase() + specialty.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedSpecialty && (
                  <div className="overflow-x-auto">
                    {!isAdmin() && (
                      <div className="mb-4 flex gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                          <span>Hospital Changes (Pending Approval)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                          <span>Doctor/Finance Changes (Pending Approval)</span>
                        </div>
                      </div>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service Description</TableHead>
                          {getFilteredHospitals().map(hospital => (
                            <TableHead key={hospital}>{hospital}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableServices.map(service => (
                          <TableRow key={service}>
                            <TableCell className="font-medium">{service}</TableCell>
                            {getFilteredHospitals().map(hospital => {
                              const pendingChange = getPendingChangeForCell(service, hospital);
                              
                              // Only show pending styling for non-admin users
                              const cellClass = (pendingChange && !isAdmin())
                                ? (pendingChange.userType === 'hospital' 
                                    ? "bg-blue-50 border-blue-200" 
                                    : "bg-green-50 border-green-200")
                                : "";
                              
                              return (
                                <TableCell key={hospital}>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={getCurrentUserDisplayPrice(service, hospital)}
                                      onChange={(e) => handlePriceChange(service, hospital, e.target.value)}
                                      className={`w-24 ${cellClass}`}
                                    />
                                    {pendingChange && !isAdmin() && (
                                      <Badge 
                                        variant="secondary" 
                                        className={`absolute -top-2 -right-2 text-xs ${
                                          pendingChange.userType === 'hospital' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-green-100 text-green-800'
                                        }`}
                                      >
                                        Pending
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Access to pricing is restricted. Contact your administrator for access.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="access">
        <EnhancedPricingAccess 
          userAccess={userAccess}
          onUpdateAccess={setUserAccess}
          isCurrentUserAdmin={isAdmin()}
        />
      </TabsContent>

      {pendingChanges.length > 0 && (
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Pricing Changes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and approve/reject pricing modifications from users
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingChanges.map((change) => (
                  <div key={change.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {change.service} - {change.hospital}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Price change: {change.oldPrice} SAR → {change.newPrice} SAR
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Modified by: {change.modifiedBy} ({change.userType}) at {new Date(change.modifiedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant={change.userType === 'hospital' ? 'default' : 'secondary'}
                          className={change.userType === 'hospital' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                        >
                          {change.userType === 'hospital' ? 'Hospital Change' : 'Doctor/Finance Change'}
                        </Badge>
                        {isAdmin() && (
                          <>
                            <Button size="sm" onClick={() => approvePendingChange(change.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => rejectPendingChange(change.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ServicePricingTable;