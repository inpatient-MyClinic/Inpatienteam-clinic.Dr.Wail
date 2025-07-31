import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Trash2, Clock, User, ArrowUpDown, GitCommit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadUsersFromStorage } from "./userManagement/UserStorage";
import { DataBackupService } from "@/services/dataBackupService";
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
}

interface LifecycleStage {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  dayRange: string;
}

const lifecycleStages: LifecycleStage[] = [
  {
    id: 'new',
    name: 'New User',
    description: 'Account created, initial setup phase',
    color: 'bg-blue-100 text-blue-800',
    icon: '👋',
    dayRange: '0-7 days'
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    description: 'Learning system features and workflows',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '📚',
    dayRange: '8-30 days'
  },
  {
    id: 'active',
    name: 'Active User',
    description: 'Regular system usage and engagement',
    color: 'bg-green-100 text-green-800',
    icon: '✅',
    dayRange: '31-180 days'
  },
  {
    id: 'experienced',
    name: 'Experienced',
    description: 'Power user with deep system knowledge',
    color: 'bg-purple-100 text-purple-800',
    icon: '⭐',
    dayRange: '181-365 days'
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Long-term user, potential mentor',
    color: 'bg-orange-100 text-orange-800',
    icon: '🏆',
    dayRange: '365+ days'
  }
];

export default function UserTracker() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("lastLogin");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showLifecycle, setShowLifecycle] = useState(false);
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
        ipAddress: userLoginData.lastIP || '192.168.1.100'
      };
    });

    setActivities(userActivities);
    setFilteredActivities(userActivities);
  };

  const getUserLifecycleStage = (daysSinceCreated: number): LifecycleStage => {
    if (daysSinceCreated <= 7) return lifecycleStages[0];
    if (daysSinceCreated <= 30) return lifecycleStages[1];
    if (daysSinceCreated <= 180) return lifecycleStages[2];
    if (daysSinceCreated <= 365) return lifecycleStages[3];
    return lifecycleStages[4];
  };

  const getLifecycleStats = () => {
    const stats = lifecycleStages.map(stage => ({
      ...stage,
      count: filteredActivities.filter(activity => {
        const userStage = getUserLifecycleStage(activity.daysSinceCreated);
        return userStage.id === stage.id;
      }).length
    }));
    return stats;
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
    const exportData = filteredActivities.map(activity => {
      const stage = getUserLifecycleStage(activity.daysSinceCreated);
      return {
        "User Name": activity.userName,
        "Email": activity.userEmail,
        "Category": activity.userCategory,
        "Specialty": activity.specialty || 'N/A',
        "Status": activity.status,
        "Lifecycle Stage": stage.name,
        "Days Since Created": activity.daysSinceCreated,
        "Last Login": new Date(activity.lastLogin).toLocaleString(),
        "Login Count": activity.loginCount,
        "Created At": new Date(activity.createdAt).toLocaleString(),
        "Online": activity.isOnline ? 'Yes' : 'No',
        "Session Duration": activity.sessionDuration,
        "IP Address": activity.ipAddress
      };
    });

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

  if (showLifecycle) {
    const lifecycleStats = getLifecycleStats();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <GitCommit className="w-5 h-5" />
                Account Lifecycle Analysis
              </CardTitle>
              <Button onClick={() => setShowLifecycle(false)} variant="outline">
                ← Back to Activity Log
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Lifecycle Overview */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {lifecycleStats.map((stage) => (
                  <Card key={stage.id} className="relative overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{stage.icon}</span>
                        <Badge className={stage.color}>{stage.count}</Badge>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm">{stage.name}</h3>
                        <p className="text-xs text-gray-500">{stage.dayRange}</p>
                        <p className="text-xs text-gray-400">{stage.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Lifecycle Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Journey Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between py-8">
                    {lifecycleStages.map((stage, index) => (
                      <div key={stage.id} className="flex items-center">
                        <div className="text-center">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${stage.color} border-2`}>
                            {stage.icon}
                          </div>
                          <div className="mt-2">
                            <div className="font-semibold text-sm">{stage.name}</div>
                            <div className="text-xs text-gray-500">{stage.dayRange}</div>
                            <div className="text-lg font-bold text-blue-600">
                              {lifecycleStats.find(s => s.id === stage.id)?.count || 0}
                            </div>
                          </div>
                        </div>
                        {index < lifecycleStages.length - 1 && (
                          <div className="flex-1 mx-4">
                            <div className="h-px bg-gray-300 relative">
                              <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Detailed User List by Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {lifecycleStats.map((stage) => (
                  <Card key={stage.id}>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className="text-lg">{stage.icon}</span>
                        {stage.name} ({stage.count})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {filteredActivities
                          .filter(activity => getUserLifecycleStage(activity.daysSinceCreated).id === stage.id)
                          .map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                              <div>
                                <div className="font-semibold">{activity.userName}</div>
                                <div className="text-gray-500">{activity.userCategory}</div>
                              </div>
                              <div className="text-right">
                                <div>{activity.daysSinceCreated} days</div>
                                <div className="text-gray-500">{activity.loginCount} logins</div>
                              </div>
                            </div>
                          ))}
                        {stage.count === 0 && (
                          <div className="text-center text-gray-400 py-4">No users in this stage</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Button onClick={() => setShowLifecycle(true)} variant="outline">
                <GitCommit className="w-4 h-4 mr-2" />
                Account Lifecycle
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
                <Table>
                  <TableHeader>
                    <TableRow>
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
                      <TableHead>Lifecycle Stage</TableHead>
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
                      <TableHead>Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => {
                      const lifecycleStage = getUserLifecycleStage(activity.daysSinceCreated);
                      return (
                        <TableRow key={activity.id}>
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
                            <Badge className={lifecycleStage.color}>
                              {lifecycleStage.icon} {lifecycleStage.name}
                            </Badge>
                          </TableCell>
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
                            <div className="text-xs">
                              <div>{activity.sessionDuration}</div>
                              <div className="text-gray-400">{activity.ipAddress}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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