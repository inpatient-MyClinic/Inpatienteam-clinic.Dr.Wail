import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, EyeOff, Filter, Users, Building, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hospitals } from "@/data/medicalData";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'hospital' | 'finance' | 'admin';
  specialty?: string;
  hospitalCode?: string;
  hasPricingAccess: boolean;
}

interface UserAccess {
  canView: boolean;
  userType: 'hospital' | 'doctor' | 'finance' | 'admin';
  hospitalCode?: string;
}

interface EnhancedPricingAccessProps {
  userAccess: {[userId: string]: UserAccess};
  onUpdateAccess: (access: {[userId: string]: UserAccess}) => void;
  isCurrentUserAdmin: boolean;
}

// Mock data for different user types
const mockUsers: User[] = [
  // Admin users
  { id: "admin1", name: "System Administrator", email: "admin@myclinic.com.sa", role: "admin", hasPricingAccess: true },
  { id: "admin2", name: "Wail Ahmed", email: "wail.ahmed@myclinic.com.sa", role: "admin", hasPricingAccess: true },
  { id: "admin3", name: "Inpatient Team", email: "inpatienteam@gmail.com", role: "admin", hasPricingAccess: true },
  
  // Doctors
  { id: "d1", name: "Dr. Ahmed Al-Rashid", email: "ahmed.rashid@myclinic.com.sa", role: "doctor", specialty: "Cardiology", hasPricingAccess: true },
  { id: "d2", name: "Dr. Fatima Al-Zahra", email: "fatima.zahra@myclinic.com.sa", role: "doctor", specialty: "Cardiology", hasPricingAccess: false },
  { id: "d3", name: "Dr. Mohammed Al-Otaibi", email: "mohammed.otaibi@myclinic.com.sa", role: "doctor", specialty: "Orthopedics", hasPricingAccess: true },
  
  // Hospital users
  { id: "h1", name: "Ahmed Hassan", email: "ahmed.hassan@kingfahad.com", role: "hospital", hospitalCode: "King Fahad Hospital", hasPricingAccess: true },
  { id: "h2", name: "Sarah Al-Mansouri", email: "sarah.mansouri@kingfaisal.com", role: "hospital", hospitalCode: "King Faisal Hospital", hasPricingAccess: false },
  { id: "h3", name: "Omar Al-Khalifa", email: "omar.khalifa@kingabdulaziz.com", role: "hospital", hospitalCode: "King Abdulaziz Hospital", hasPricingAccess: true },
  
  // Finance users
  { id: "f1", name: "Nadia Al-Qasimi", email: "nadia.qasimi@myclinic.com.sa", role: "finance", hasPricingAccess: true },
  { id: "f2", name: "Khalid Al-Salam", email: "khalid.salam@myclinic.com.sa", role: "finance", hasPricingAccess: false },
];

const EnhancedPricingAccess: React.FC<EnhancedPricingAccessProps> = ({ 
  userAccess, 
  onUpdateAccess,
  isCurrentUserAdmin
}) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedHospital, setSelectedHospital] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Load and sync access data
  useEffect(() => {
    const syncedUsers = users.map(user => ({
      ...user,
      hasPricingAccess: userAccess[user.id]?.canView || false
    }));
    setUsers(syncedUsers);
  }, [userAccess]);

  // Filter users based on criteria
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const roleMatch = selectedRole === "all" || user.role === selectedRole;
      const specialtyMatch = selectedSpecialty === "all" || user.specialty === selectedSpecialty;
      const hospitalMatch = selectedHospital === "all" || user.hospitalCode === selectedHospital;
      const searchMatch = searchTerm === "" || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return roleMatch && specialtyMatch && hospitalMatch && searchMatch;
    });
  }, [users, selectedRole, selectedSpecialty, selectedHospital, searchTerm]);

  const toggleUserAccess = (userId: string) => {
    if (!isCurrentUserAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can modify user access",
        variant: "destructive"
      });
      return;
    }
    
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newAccess = !user.hasPricingAccess;
    
    // Update users state
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, hasPricingAccess: newAccess } : u
    ));

    // Update access object
    const updatedAccess = { ...userAccess };
    if (newAccess) {
      updatedAccess[userId] = {
        canView: true,
        userType: user.role,
        hospitalCode: user.hospitalCode
      };
    } else {
      delete updatedAccess[userId];
    }
    
    onUpdateAccess(updatedAccess);
    localStorage.setItem('pricingUserAccess', JSON.stringify(updatedAccess));

    toast({
      title: "Access Updated",
      description: `Pricing access ${newAccess ? 'granted to' : 'revoked from'} ${user.name}`,
    });
  };

  const grantAccessToAll = (role?: string) => {
    const usersToUpdate = role ? filteredUsers.filter(u => u.role === role) : filteredUsers;
    
    setUsers(prev => prev.map(user => 
      usersToUpdate.some(u => u.id === user.id)
        ? { ...user, hasPricingAccess: true }
        : user
    ));

    const updatedAccess = { ...userAccess };
    usersToUpdate.forEach(user => {
      updatedAccess[user.id] = {
        canView: true,
        userType: user.role,
        hospitalCode: user.hospitalCode
      };
    });

    onUpdateAccess(updatedAccess);
    localStorage.setItem('pricingUserAccess', JSON.stringify(updatedAccess));

    toast({
      title: "Bulk Access Granted",
      description: `Pricing access granted to ${usersToUpdate.length} ${role || 'users'}`,
    });
  };

  const revokeAccessFromAll = (role?: string) => {
    const usersToUpdate = role ? filteredUsers.filter(u => u.role === role) : filteredUsers;
    
    setUsers(prev => prev.map(user => 
      usersToUpdate.some(u => u.id === user.id)
        ? { ...user, hasPricingAccess: false }
        : user
    ));

    const updatedAccess = { ...userAccess };
    usersToUpdate.forEach(user => {
      delete updatedAccess[user.id];
    });

    onUpdateAccess(updatedAccess);
    localStorage.setItem('pricingUserAccess', JSON.stringify(updatedAccess));

    toast({
      title: "Bulk Access Revoked",
      description: `Pricing access revoked from ${usersToUpdate.length} ${role || 'users'}`,
    });
  };

  const clearFilters = () => {
    setSelectedRole("all");
    setSelectedSpecialty("all");
    setSelectedHospital("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedRole !== "all" || selectedSpecialty !== "all" || selectedHospital !== "all" || searchTerm !== "";
  
  const stats = {
    doctors: users.filter(u => u.role === 'doctor'),
    hospitals: users.filter(u => u.role === 'hospital'),
    finance: users.filter(u => u.role === 'finance'),
    withAccess: users.filter(u => u.hasPricingAccess)
  };

  const specialties = Array.from(new Set(users.filter(u => u.specialty).map(u => u.specialty)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Enhanced Pricing Access Control
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control pricing access for doctors, hospital users, and finance team
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-5 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                <Users className="w-5 h-5" />
                {stats.doctors.filter(d => d.hasPricingAccess).length}/{stats.doctors.length}
              </div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                <Users className="w-5 h-5" />
                {users.filter(u => u.role === 'admin' && u.hasPricingAccess).length}/{users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-muted-foreground">Doctors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                <Building className="w-5 h-5" />
                {stats.hospitals.filter(h => h.hasPricingAccess).length}/{stats.hospitals.length}
              </div>
              <div className="text-sm text-muted-foreground">Hospitals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                <DollarSign className="w-5 h-5" />
                {stats.finance.filter(f => f.hasPricingAccess).length}/{stats.finance.length}
              </div>
              <div className="text-sm text-muted-foreground">Finance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.withAccess.length}</div>
              <div className="text-sm text-muted-foreground">Total Access</div>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
              <TabsTrigger value="doctor">Doctors</TabsTrigger>
              <TabsTrigger value="hospital">Hospital Users</TabsTrigger>
              <TabsTrigger value="finance">Finance Team</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label>Search User</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="min-w-[150px]">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[150px]">
                  <Label>Specialty</Label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Specialties</SelectItem>
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty!}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[150px]">
                  <Label>Hospital</Label>
                  <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Hospitals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Hospitals</SelectItem>
                      {hospitals.map(hospital => (
                        <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Bulk Actions */}
              {filteredUsers.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => grantAccessToAll()}>
                    <Eye className="w-4 h-4 mr-2" />
                    Grant Access to All ({filteredUsers.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => revokeAccessFromAll()}>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Revoke Access from All ({filteredUsers.length})
                  </Button>
                </div>
              )}

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Access</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No users found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={user.hasPricingAccess}
                              onCheckedChange={() => toggleUserAccess(user.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'hospital' ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.specialty && <Badge variant="outline">{user.specialty}</Badge>}
                            {user.hospitalCode && <Badge variant="outline">{user.hospitalCode}</Badge>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.hasPricingAccess ? "default" : "outline"}>
                              {user.hasPricingAccess ? "Can View Pricing" : "No Access"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Individual role tabs with role-specific bulk actions */}
            {(['admin', 'doctor', 'hospital', 'finance'] as const).map(role => (
              <TabsContent key={role} value={role} className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => grantAccessToAll(role)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Grant Access to All {role}s
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => revokeAccessFromAll(role)}>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Revoke Access from All {role}s
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Access</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.filter(u => u.role === role).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={user.hasPricingAccess}
                              onCheckedChange={() => toggleUserAccess(user.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.specialty && <Badge variant="outline">{user.specialty}</Badge>}
                            {user.hospitalCode && <Badge variant="outline">{user.hospitalCode}</Badge>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.hasPricingAccess ? "default" : "outline"}>
                              {user.hasPricingAccess ? "Can View Pricing" : "No Access"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPricingAccess;