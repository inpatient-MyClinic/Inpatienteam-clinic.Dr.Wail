
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, Eye, Edit, Clock, User, ArrowUpDown, Trash2, KeyRound, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadUsersFromStorage } from "./userManagement/UserStorage";
import { DataBackupService } from "@/services/dataBackupService";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCategory: string;
  specialty?: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  loginCount: number;
  createdAt: string;
  daysSinceCreated: number;
  isOnline: boolean;
  sessionDuration: string;
  ipAddress: string;
  passwordCreatedAt?: string;
  mustChangePassword?: boolean;
  passwordChangeRequiredAt?: string;
}

export default function UserTracker() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("lastLogin");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isBulkRenewing, setIsBulkRenewing] = useState(false);
  const { toast } = useToast();

  const userCategories = ["Admin", "Doctor", "Nurse", "Case Coordinator", "Hospital", "Finance", "Customer Service"];
  const specialties = ["Cardiology", "ENT", "GIT (Gastroenterology)", "General Surgery", "Neurology", "Neurosurgery", "OBGYN", "Ophthalmology", "Orthopaedic", "Urology", "Vascular Surgery"];

  useEffect(() => {
    loadUserActivities();
  }, []);

  const loadUserActivities = () => {
    const users = loadUsersFromStorage();
    const userActivities: UserActivity[] = users.map(user => {
      const createdDate = new Date(user.createdAt);
      const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Get user login data from localStorage (simulated for now)
      const userLoginData = JSON.parse(localStorage.getItem(`user_activity_${user.id}`) || '{}');
      
      return {
        id: user.id,
        userId: user.id,
        userName: user.email.split('@')[0].replace(/[.\-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        userEmail: user.email,
        userCategory: user.category,
        specialty: user.specialty,
        status: user.status,
        lastLogin: userLoginData.lastLogin || createdDate.toISOString(),
        loginCount: userLoginData.loginCount || 0,
        createdAt: user.createdAt,
        daysSinceCreated,
        isOnline: userLoginData.isOnline || false,
        sessionDuration: userLoginData.sessionDuration || '0 min',
        ipAddress: userLoginData.lastIP || '192.168.1.100',
        passwordCreatedAt: user.passwordCreatedAt || user.createdAt,
        mustChangePassword: user.mustChangePassword || false,
        passwordChangeRequiredAt: user.passwordChangeRequiredAt
      };
    });

    setActivities(userActivities);
    setFilteredActivities(userActivities);
  };

  const applyFilters = () => {
    let filtered = activities;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(activity => activity.userCategory === selectedCategory);
    }

    // Specialty filter
    if (selectedSpecialty !== "all") {
      filtered = filtered.filter(activity => activity.specialty === selectedSpecialty);
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "online") {
        filtered = filtered.filter(activity => activity.isOnline);
      } else if (statusFilter === "active") {
        filtered = filtered.filter(activity => activity.status === "Active");
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(activity => activity.status === "Inactive");
      }
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = Date.now();
      const cutoffTime = timeFilter === "today" ? 24 * 60 * 60 * 1000 :
                        timeFilter === "week" ? 7 * 24 * 60 * 60 * 1000 :
                        timeFilter === "month" ? 30 * 24 * 60 * 60 * 1000 : 0;
      
      if (cutoffTime > 0) {
        filtered = filtered.filter(activity => 
          (now - new Date(activity.lastLogin).getTime()) <= cutoffTime
        );
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.specialty && activity.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof UserActivity];
      let bValue: any = b[sortBy as keyof UserActivity];

      if (sortBy === 'lastLogin' || sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredActivities(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedSpecialty, statusFilter, timeFilter, searchTerm, sortBy, sortOrder, activities]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearPatientData = () => {
    DataBackupService.clearPatientDataOnly();
    toast({
      title: "Patient Data Cleared",
      description: "All patient data has been cleared from the system.",
    });
  };

  const exportToExcel = () => {
    const exportData = filteredActivities.map(activity => ({
      "User Name": activity.userName,
      "Email": activity.userEmail,
      "Category": activity.userCategory,
      "Specialty": activity.specialty || 'N/A',
      "Status": activity.status,
      "Last Login": new Date(activity.lastLogin).toLocaleString(),
      "Login Count": activity.loginCount,
      "Days Since Created": activity.daysSinceCreated,
      "Created At": new Date(activity.createdAt).toLocaleString(),
      "Online": activity.isOnline ? 'Yes' : 'No',
      "Session Duration": activity.sessionDuration,
      "IP Address": activity.ipAddress
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "User Activity");
    XLSX.writeFile(wb, `user_activity_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export Successful",
      description: "User activity data has been exported to Excel.",
    });
  };

  const getStatusBadge = (activity: UserActivity) => {
    if (activity.isOnline) {
      return <Badge className="bg-green-500">Online</Badge>;
    } else if (activity.status === 'Active') {
      return <Badge variant="secondary">Active</Badge>;
    } else {
      return <Badge variant="destructive">Inactive</Badge>;
    }
  };

  const formatLastLogin = (lastLogin: string) => {
    const date = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hours ago`;
    } else {
      return 'Recently';
    }
  };

  const formatPasswordDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const isPasswordExpired = (activity: UserActivity) => {
    if (activity.mustChangePassword) return true;
    if (!activity.passwordChangeRequiredAt) return false;
    return new Date(activity.passwordChangeRequiredAt) <= new Date();
  };

  const handleRenewPassword = async (userId: string, userEmail: string) => {
    try {
      // Update the user's profile to force password change
      const { error } = await supabase
        .from('profiles')
        .update({ 
          must_change_password: true,
          password_change_required_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error forcing password renewal:', error);
        toast({
          title: "Error",
          description: "Failed to force password renewal",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Password renewal forced for ${userEmail}`,
        });
        loadUserActivities(); // Refresh the data
      }
    } catch (error) {
      console.error('Error forcing password renewal:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredActivities.map(activity => activity.userId));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkRenewPasswords = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select users to renew passwords",
        variant: "destructive",
      });
      return;
    }

    setIsBulkRenewing(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          must_change_password: true,
          password_change_required_at: new Date().toISOString()
        })
        .in('id', selectedUsers);

      if (error) {
        console.error('Error bulk renewing passwords:', error);
        toast({
          title: "Error",
          description: "Failed to renew passwords for selected users",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Password renewal forced for ${selectedUsers.length} users`,
        });
        setSelectedUsers([]);
        loadUserActivities();
      }
    } catch (error) {
      console.error('Error bulk renewing passwords:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsBulkRenewing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Activity Tracker</CardTitle>
            <div className="flex gap-2">
              <Button onClick={clearPatientData} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Patient Data
              </Button>
              <Button onClick={exportToExcel} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div>
                <Label htmlFor="search">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>User Type</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {userCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Specialty</Label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map(specialty => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="online">Online Now</SelectItem>
                    <SelectItem value="active">Active Users</SelectItem>
                    <SelectItem value="inactive">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Time Period</Label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lastLogin">Last Login</SelectItem>
                    <SelectItem value="loginCount">Login Count</SelectItem>
                    <SelectItem value="daysSinceCreated">Days Since Created</SelectItem>
                    <SelectItem value="userName">Name</SelectItem>
                    <SelectItem value="userCategory">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{filteredActivities.length}</div>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredActivities.filter(a => a.isOnline).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Online Now</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredActivities.filter(a => a.status === 'Active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {Math.round(filteredActivities.reduce((sum, a) => sum + a.loginCount, 0) / filteredActivities.length) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Logins</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {filteredActivities.filter(a => a.userCategory === 'Doctor').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Doctors</p>
                </CardContent>
              </Card>
            </div>

            {/* User Activity Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User Activity Log ({filteredActivities.length} users)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-4 p-4 mb-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium">
                      {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                    </span>
                    <Button
                      onClick={handleBulkRenewPasswords}
                      disabled={isBulkRenewing}
                      size="sm"
                      variant="outline"
                    >
                      {isBulkRenewing ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <KeyRound className="w-4 h-4 mr-2" />
                      )}
                      Renew Selected Passwords
                    </Button>
                  </div>
                )}
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === filteredActivities.length && filteredActivities.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all users"
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('userName')}>
                        <div className="flex items-center gap-1">
                          User <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('userCategory')}>
                        <div className="flex items-center gap-1">
                          Category <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('lastLogin')}>
                        <div className="flex items-center gap-1">
                          Last Login <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('loginCount')}>
                        <div className="flex items-center gap-1">
                          Login Count <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('daysSinceCreated')}>
                        <div className="flex items-center gap-1">
                          Days Active <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('passwordCreatedAt')}>
                        <div className="flex items-center gap-1">
                          Password Created <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead>Password Status</TableHead>
                      <TableHead>Password Actions</TableHead>
                      <TableHead>Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(activity.userId)}
                            onCheckedChange={(checked) => handleSelectUser(activity.userId, checked as boolean)}
                            aria-label={`Select ${activity.userEmail}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{activity.userName}</div>
                            <div className="text-xs text-gray-500">{activity.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{activity.userCategory}</Badge>
                        </TableCell>
                        <TableCell>{activity.specialty || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(activity)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">{formatLastLogin(activity.lastLogin)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{activity.loginCount}</Badge>
                        </TableCell>
                        <TableCell>{activity.daysSinceCreated} days</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">{formatPasswordDate(activity.passwordCreatedAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isPasswordExpired(activity) ? (
                            <Badge variant="destructive" className="text-xs">
                              Renewal Required
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-xs">
                              Valid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenewPassword(activity.userId, activity.userEmail)}
                            className="h-8"
                          >
                            <KeyRound className="w-3 h-3" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>{activity.sessionDuration}</div>
                            <div className="text-gray-400">{activity.ipAddress}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
