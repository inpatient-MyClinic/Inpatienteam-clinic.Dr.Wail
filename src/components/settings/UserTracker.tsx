
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Eye, Edit, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFullAuditReport } from "@/utils/userUtils";
import * as XLSX from 'xlsx';

const UserTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const { toast } = useToast();

  const auditData = useMemo(() => {
    return getFullAuditReport();
  }, []);

  const users = useMemo(() => {
    const savedUsers = localStorage.getItem('enhancedUserManagementUsers');
    return savedUsers ? JSON.parse(savedUsers) : [];
  }, []);

  const usersByCategory = useMemo(() => {
    if (categoryFilter === "all") return users;
    return users.filter(user => user.category === categoryFilter);
  }, [users, categoryFilter]);

  const filteredData = useMemo(() => {
    return auditData.filter(entry => {
      const matchesSearch = 
        entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || 
        users.find(user => user.email === entry.userEmail)?.category === categoryFilter;
      
      const matchesUser = selectedUser === "all" || entry.userEmail === selectedUser;
      
      return matchesSearch && matchesCategory && matchesUser;
    });
  }, [auditData, searchTerm, categoryFilter, selectedUser, users]);

  const handleExport = () => {
    const exportData = filteredData.map(entry => ({
      'User Name': entry.userName,
      'User Email': entry.userEmail,
      'User Category': users.find(u => u.email === entry.userEmail)?.category || 'Unknown',
      'Request ID': entry.requestId,
      'Action': entry.action,
      'Date': entry.date,
      'Time': entry.time,
      'Details': JSON.stringify(entry.details)
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Activity');
    
    const filename = `user_activity_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    toast({
      title: "Activity Report Exported",
      description: `User activity report exported to ${filename}`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getActionBadge = (action) => {
    switch (action.toLowerCase()) {
      case 'view':
        return <Badge className="bg-blue-100 text-blue-800">{action}</Badge>;
      case 'modify':
      case 'update':
        return <Badge className="bg-yellow-100 text-yellow-800">{action}</Badge>;
      case 'create':
        return <Badge className="bg-green-100 text-green-800">{action}</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-800">{action}</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const categories = [...new Set(users.map(user => user.category))];
  const userActivities = filteredData.reduce((acc, entry) => {
    acc[entry.userEmail] = (acc[entry.userEmail] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            User Activity Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by user name, email, or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {usersByCategory.map(user => (
                  <SelectItem key={user.email} value={user.email}>
                    {user.email} ({user.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
            
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{filteredData.length}</div>
                <p className="text-xs text-muted-foreground">Total Activities</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{Object.keys(userActivities).length}</div>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{filteredData.filter(a => a.action === 'view').length}</div>
                <p className="text-xs text-muted-foreground">View Actions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{filteredData.filter(a => a.action === 'modify').length}</div>
                <p className="text-xs text-muted-foreground">Modify Actions</p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Request ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No activity found for the selected filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{entry.userName}</div>
                        <div className="text-sm text-gray-500">{entry.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {users.find(u => u.email === entry.userEmail)?.category || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{entry.requestId}</TableCell>
                    <TableCell>{getActionBadge(entry.action)}</TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.time}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-gray-600">
                        {typeof entry.details === 'object' 
                          ? JSON.stringify(entry.details).substring(0, 50) + '...'
                          : entry.details
                        }
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTracker;
