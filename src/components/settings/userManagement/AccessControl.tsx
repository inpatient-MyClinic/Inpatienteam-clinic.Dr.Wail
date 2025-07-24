
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, X, User } from "lucide-react";

interface PermissionRequest {
  id: string;
  userEmail: string;
  userName: string;
  category: string;
  requestedAt: string;
  status: "pending" | "approved" | "denied";
}

const AccessControl = () => {
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedRequests = localStorage.getItem('permission_requests');
    if (savedRequests) {
      setPermissionRequests(JSON.parse(savedRequests));
    }
  }, []);

  const saveRequests = (requests: PermissionRequest[]) => {
    localStorage.setItem('permission_requests', JSON.stringify(requests));
    setPermissionRequests(requests);
  };

  const approveRequest = (requestId: string) => {
    const updatedRequests = permissionRequests.map(req => 
      req.id === requestId ? { ...req, status: "approved" as const } : req
    );
    saveRequests(updatedRequests);
    
    // Update user access in user management
    const request = permissionRequests.find(r => r.id === requestId);
    if (request) {
      const users = JSON.parse(localStorage.getItem('enhancedUserManagementUsers') || '[]');
      const updatedUsers = users.map(user => 
        user.email === request.userEmail ? { ...user, hasAccess: true } : user
      );
      localStorage.setItem('enhancedUserManagementUsers', JSON.stringify(updatedUsers));
    }
    
    toast({
      title: "Access Approved",
      description: `Access granted to ${request?.userName}`,
    });
  };

  const denyRequest = (requestId: string) => {
    const updatedRequests = permissionRequests.map(req => 
      req.id === requestId ? { ...req, status: "denied" as const } : req
    );
    saveRequests(updatedRequests);
    
    const request = permissionRequests.find(r => r.id === requestId);
    toast({
      title: "Access Denied",
      description: `Access denied for ${request?.userName}`,
      variant: "destructive"
    });
  };

  const pendingRequests = permissionRequests.filter(req => req.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Access Permission Requests
          {pendingRequests.length > 0 && (
            <Badge variant="destructive">{pendingRequests.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No pending permission requests</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.userName}</div>
                      <div className="text-sm text-gray-500">{request.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.category}</Badge>
                  </TableCell>
                  <TableCell>{new Date(request.requestedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        request.status === "approved" ? "default" : 
                        request.status === "denied" ? "destructive" : "secondary"
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => denyRequest(request.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessControl;
