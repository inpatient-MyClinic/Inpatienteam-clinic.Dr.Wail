import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { servicesBySpecialty } from "@/data/medicalData";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Users, Building, DollarSign } from "lucide-react";

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

// Simple admin check - you are always admin
const isAdmin = () => true;

interface PricingData {
  [service: string]: {
    [hospital: string]: number;
  };
}

interface PendingChange {
  id: string;
  service: string;
  hospital: string;
  oldPrice: number;
  newPrice: number;
  userType: 'hospital' | 'doctor' | 'finance';
  userName: string;
  date: string;
}

interface UserAccess {
  id: string;
  name: string;
  email: string;
  type: 'admin' | 'doctor' | 'hospital' | 'finance';
  hospital?: string;
  hasAccess: boolean;
}

const ServicePricingTable = () => {
  const { toast } = useToast();
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [pricing, setPricing] = useState<PricingData>({});
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [users, setUsers] = useState<UserAccess[]>([
    // Sample users
    { id: "1", name: "Admin User", email: "admin@myclinic.com.sa", type: "admin", hasAccess: true },
    { id: "2", name: "Dr. Ahmed", email: "ahmed@myclinic.com.sa", type: "doctor", hasAccess: false },
    { id: "3", name: "Hospital Manager", email: "manager@kingfahad.com", type: "hospital", hospital: "King Fahad Hospital", hasAccess: false },
    { id: "4", name: "Finance User", email: "finance@myclinic.com.sa", type: "finance", hasAccess: false },
  ]);

  // Load initial data
  useEffect(() => {
    // Load sample pricing data
    const samplePricing: PricingData = {
      "Cardiac Catheterization": {
        "King Fahad Hospital": 15000,
        "King Faisal Hospital": 14500,
        "King Abdulaziz Hospital": 16000,
      },
      "Angioplasty": {
        "King Fahad Hospital": 25000,
        "King Faisal Hospital": 24000,
        "King Abdulaziz Hospital": 26000,
      }
    };
    setPricing(samplePricing);

    // Load sample pending changes
    const samplePendingChanges: PendingChange[] = [
      {
        id: "1",
        service: "Cardiac Catheterization",
        hospital: "King Fahad Hospital",
        oldPrice: 15000,
        newPrice: 16000,
        userType: "hospital",
        userName: "Hospital Manager",
        date: new Date().toISOString()
      },
      {
        id: "2",
        service: "Angioplasty",
        hospital: "King Faisal Hospital",
        oldPrice: 24000,
        newPrice: 25000,
        userType: "finance",
        userName: "Finance User",
        date: new Date().toISOString()
      }
    ];
    setPendingChanges(samplePendingChanges);
  }, []);

  const handlePriceChange = (service: string, hospital: string, value: string) => {
    const newPrice = parseFloat(value) || 0;
    
    // Admin can change directly
    if (isAdmin()) {
      setPricing(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          [hospital]: newPrice
        }
      }));
      
      toast({
        title: "Price Updated",
        description: `${service} at ${hospital} updated to ${newPrice} SAR`,
      });
    }
  };

  const approvePendingChange = (changeId: string) => {
    const change = pendingChanges.find(c => c.id === changeId);
    if (!change) return;

    // Update pricing
    setPricing(prev => ({
      ...prev,
      [change.service]: {
        ...prev[change.service],
        [change.hospital]: change.newPrice
      }
    }));

    // Remove from pending
    setPendingChanges(prev => prev.filter(c => c.id !== changeId));

    toast({
      title: "Change Approved",
      description: `Price change for ${change.service} approved`,
    });
  };

  const rejectPendingChange = (changeId: string) => {
    setPendingChanges(prev => prev.filter(c => c.id !== changeId));
    
    toast({
      title: "Change Rejected",
      description: "Price change has been rejected",
    });
  };

  const toggleUserAccess = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, hasAccess: !user.hasAccess }
        : user
    ));

    const user = users.find(u => u.id === userId);
    toast({
      title: "Access Updated",
      description: `Access ${user?.hasAccess ? 'revoked from' : 'granted to'} ${user?.name}`,
    });
  };

  const availableServices = selectedSpecialty ? servicesBySpecialty[selectedSpecialty] || [] : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">
            🎯 Admin Service Pricing Control
          </CardTitle>
          <p className="text-sm text-green-600">
            ✅ You have full admin access - You can view and modify all pricing directly
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing">Service Pricing</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Changes ({pendingChanges.length})
          </TabsTrigger>
          <TabsTrigger value="access">User Access Control</TabsTrigger>
        </TabsList>

        {/* PRICING TAB */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Service Pricing Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                As admin, you can directly modify all pricing. Changes are saved immediately.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Specialty</Label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a specialty" />
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Service Description</TableHead>
                        {hospitals.map(hospital => (
                          <TableHead key={hospital} className="text-center font-semibold">
                            {hospital}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableServices.map(service => (
                        <TableRow key={service}>
                          <TableCell className="font-medium">{service}</TableCell>
                          {hospitals.map(hospital => (
                            <TableCell key={hospital}>
                              <Input
                                type="number"
                                placeholder="0"
                                value={pricing[service]?.[hospital] || ""}
                                onChange={(e) => handlePriceChange(service, hospital, e.target.value)}
                                className="w-28 text-center"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PENDING CHANGES TAB */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Price Change Approvals</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and approve/reject pricing changes submitted by hospital and finance users
              </p>
            </CardHeader>
            <CardContent>
              {pendingChanges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending changes to review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingChanges.map((change) => (
                    <div key={change.id} className="border rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="font-semibold text-lg">
                            {change.service} - {change.hospital}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Price change: <span className="font-medium">{change.oldPrice} SAR</span> → <span className="font-medium text-green-600">{change.newPrice} SAR</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Submitted by: {change.userName} ({change.userType}) on {new Date(change.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge 
                            variant="secondary" 
                            className={change.userType === 'hospital' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                          >
                            {change.userType.charAt(0).toUpperCase() + change.userType.slice(1)} Change
                          </Badge>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approvePendingChange(change.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => rejectPendingChange(change.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCESS CONTROL TAB */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>User Access Control</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage who can view and modify service pricing
              </p>
            </CardHeader>
            <CardContent>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {users.filter(u => u.type === 'admin').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.type === 'doctor' && u.hasAccess).length}/{users.filter(u => u.type === 'doctor').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {users.filter(u => u.type === 'hospital' && u.hasAccess).length}/{users.filter(u => u.type === 'hospital').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Hospitals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {users.filter(u => u.type === 'finance' && u.hasAccess).length}/{users.filter(u => u.type === 'finance').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Finance</div>
                </div>
              </div>

              {/* Users Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Access</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={user.hasAccess}
                          onCheckedChange={() => toggleUserAccess(user.id)}
                          disabled={user.type === 'admin'}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={
                            user.type === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.type === 'doctor' ? 'bg-blue-100 text-blue-800' :
                            user.type === 'hospital' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }
                        >
                          {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.hospital && <Badge variant="outline">{user.hospital}</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.hasAccess ? "default" : "outline"}>
                          {user.hasAccess ? "Has Access" : "No Access"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServicePricingTable;