
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Filter, Calendar, User, FileText } from "lucide-react";
import { getFullAuditReport } from "@/utils/userUtils";
import { useToast } from "@/hooks/use-toast";

interface AuditEntry {
  id: string;
  requestId: string;
  action: string;
  details: any;
  userEmail: string;
  userName: string;
  timestamp: string;
  date: string;
  time: string;
}

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mrnSearch, setMrnSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [selectedRequestId, setSelectedRequestId] = useState("all");
  const { toast } = useToast();

  const auditData = useMemo(() => {
    return getFullAuditReport() as AuditEntry[];
  }, []);

  const filteredData = useMemo(() => {
    return auditData.filter((entry: AuditEntry) => {
      const matchesSearch = 
        entry.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.details && JSON.stringify(entry.details).toLowerCase().includes(searchTerm.toLowerCase()));
      
      // MRN search - check in details object and requestId
      const detailsStr = entry.details ? JSON.stringify(entry.details).toLowerCase() : "";
      const matchesMRN = !mrnSearch || 
        detailsStr.includes(mrnSearch.toLowerCase()) ||
        entry.requestId.toLowerCase().includes(mrnSearch.toLowerCase());

      // Date range filter
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const entryDate = entry.date; // format varies, try parsing
        const entryDateObj = new Date(entry.timestamp || entry.date);
        if (dateFrom) {
          matchesDate = matchesDate && entryDateObj >= new Date(dateFrom);
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && entryDateObj <= toDate;
        }
      }

      const matchesAction = filterAction === "all" || entry.action === filterAction;
      const matchesUser = filterUser === "all" || entry.userEmail === filterUser;
      const matchesRequest = selectedRequestId === "all" || entry.requestId === selectedRequestId;
      
      return matchesSearch && matchesMRN && matchesDate && matchesAction && matchesUser && matchesRequest;
    });
  }, [auditData, searchTerm, mrnSearch, dateFrom, dateTo, filterAction, filterUser, selectedRequestId]);

  const uniqueActions = [...new Set(auditData.map((entry: AuditEntry) => entry.action))];
  const uniqueUsers = [...new Set(auditData.map((entry: AuditEntry) => entry.userEmail))];
  const uniqueRequests = [...new Set(auditData.map((entry: AuditEntry) => entry.requestId))];

  const handleExportReport = () => {
    const reportData = filteredData.map((entry: AuditEntry) => ({
      'Request ID': entry.requestId,
      'Action': entry.action,
      'User Name': entry.userName,
      'User Email': entry.userEmail,
      'Date': entry.date,
      'Time': entry.time,
      'Details': JSON.stringify(entry.details),
      'Timestamp': entry.timestamp
    }));

    const csvContent = [
      Object.keys(reportData[0] || {}).join(','),
      ...reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `audit_trail_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Report Exported",
      description: `Audit trail report with ${filteredData.length} entries has been downloaded.`,
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'view':
        return 'bg-blue-100 text-blue-800';
      case 'modify':
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Trail Report
          </CardTitle>
          <CardDescription>
            Complete audit trail for all request views and modifications with timestamps and user details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* MRN + Date Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-muted/30 rounded-lg border">
            <div>
              <label className="text-sm font-medium mb-1 block">🔍 Search by MRN</label>
              <Input
                placeholder="Enter MRN number..."
                value={mrnSearch}
                onChange={(e) => setMrnSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">📅 Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">📅 Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* General Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by request ID, user name, action, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Request" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                {uniqueRequests.map((requestId) => (
                  <SelectItem key={requestId} value={requestId}>Request {requestId}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleExportReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{filteredData.length}</div>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{uniqueUsers.length}</div>
                <p className="text-xs text-muted-foreground">Unique Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{uniqueRequests.length}</div>
                <p className="text-xs text-muted-foreground">Unique Requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{uniqueActions.length}</div>
                <p className="text-xs text-muted-foreground">Action Types</p>
              </CardContent>
            </Card>
          </div>

          {/* Audit Trail Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No audit trail entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((entry: AuditEntry, index: number) => (
                    <TableRow key={entry.id || index}>
                      <TableCell className="font-medium">{entry.requestId}</TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeColor(entry.action)}>
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.userName}</div>
                          <div className="text-xs text-gray-500">{entry.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.time}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-600 truncate">
                            {typeof entry.details === 'object' 
                              ? JSON.stringify(entry.details, null, 2).substring(0, 100) + '...'
                              : entry.details
                            }
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
