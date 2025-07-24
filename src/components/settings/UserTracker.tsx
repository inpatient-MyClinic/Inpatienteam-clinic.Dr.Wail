
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter, Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userCategory: string;
  action: string;
  actionType: 'view' | 'modification';
  timestamp: string;
  details: string;
  ipAddress: string;
}

export default function UserTracker() {
  const [activities, setActivities] = useState<UserActivity[]>([
    {
      id: "1",
      userId: "user001",
      userName: "Dr. Ahmed Al-Rashid",
      userCategory: "doctor",
      action: "Viewed request REQ001",
      actionType: "view",
      timestamp: "2025-01-15T10:30:00Z",
      details: "Accessed patient request details",
      ipAddress: "192.168.1.100"
    },
    {
      id: "2",
      userId: "user002",
      userName: "Sarah Al-Mahmoud",
      userCategory: "case_coordinator",
      action: "Modified request REQ002",
      actionType: "modification",
      timestamp: "2025-01-15T11:15:00Z",
      details: "Updated request status to approved",
      ipAddress: "192.168.1.101"
    },
    {
      id: "3",
      userId: "user003",
      userName: "Admin User",
      userCategory: "admin",
      action: "Accessed user management",
      actionType: "view",
      timestamp: "2025-01-15T09:45:00Z",
      details: "Viewed user management panel",
      ipAddress: "192.168.1.102"
    }
  ]);

  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>(activities);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();

  const userCategories = ["doctor", "nurse", "case_coordinator", "hospital_admin", "admin", "finance"];

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    applyFilters(category, searchTerm);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFilters(selectedCategory, term);
  };

  const applyFilters = (category: string, search: string) => {
    let filtered = activities;

    if (category !== "all") {
      filtered = filtered.filter(activity => activity.userCategory === category);
    }

    if (search) {
      filtered = filtered.filter(activity => 
        activity.userName.toLowerCase().includes(search.toLowerCase()) ||
        activity.action.toLowerCase().includes(search.toLowerCase()) ||
        activity.details.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  };

  const exportToExcel = () => {
    const exportData = filteredActivities.map(activity => ({
      "User ID": activity.userId,
      "User Name": activity.userName,
      "User Category": activity.userCategory,
      "Action": activity.action,
      "Action Type": activity.actionType,
      "Timestamp": new Date(activity.timestamp).toLocaleString(),
      "Details": activity.details,
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

  const getActionIcon = (actionType: 'view' | 'modification') => {
    return actionType === 'view' ? (
      <Eye className="w-4 h-4 text-blue-600" />
    ) : (
      <Edit className="w-4 h-4 text-orange-600" />
    );
  };

  const getActionBadge = (actionType: 'view' | 'modification') => {
    return actionType === 'view' ? (
      <Badge variant="secondary">View</Badge>
    ) : (
      <Badge variant="default">Modification</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Activity Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-64">
                <Label htmlFor="search">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, action, or details..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="min-w-48">
                <Label htmlFor="category">User Category</Label>
                <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {userCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={exportToExcel} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{filteredActivities.length}</div>
                  <p className="text-xs text-muted-foreground">Total Activities</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {filteredActivities.filter(a => a.actionType === 'view').length}
                  </div>
                  <p className="text-xs text-muted-foreground">View Actions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {filteredActivities.filter(a => a.actionType === 'modification').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Modifications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {[...new Set(filteredActivities.map(a => a.userId))].length}
                  </div>
                  <p className="text-xs text-muted-foreground">Unique Users</p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {activity.userCategory.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(activity.actionType)}
                            {activity.action}
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(activity.actionType)}</TableCell>
                        <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs truncate">{activity.details}</TableCell>
                        <TableCell>{activity.ipAddress}</TableCell>
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
