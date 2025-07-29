import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bell, Check, X, Clock, User, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoginAttemptService } from "@/services/loginAttemptService";

interface LoginAttempt {
  id: string;
  email: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

interface NewUserRequestsProps {
  onClose: () => void;
}

export default function NewUserRequests({ onClose }: NewUserRequestsProps) {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<LoginAttempt | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAttempts();
    // Listen for new login attempts
    const handleNewAttempt = () => loadAttempts();
    window.addEventListener('newLoginAttempt', handleNewAttempt);
    return () => window.removeEventListener('newLoginAttempt', handleNewAttempt);
  }, []);

  const loadAttempts = () => {
    const loginAttempts = LoginAttemptService.getLoginAttempts();
    setAttempts(loginAttempts);
  };

  const handleReview = (attempt: LoginAttempt) => {
    setSelectedAttempt(attempt);
    setAdminNotes(attempt.adminNotes || "");
    setShowReviewDialog(true);
  };

  const handleApprove = () => {
    if (!selectedAttempt) return;
    
    LoginAttemptService.updateAttemptStatus(selectedAttempt.id, 'approved', adminNotes);
    loadAttempts();
    setShowReviewDialog(false);
    
    toast({
      title: "User Approved",
      description: `Access granted for ${selectedAttempt.email}`,
    });
  };

  const handleReject = () => {
    if (!selectedAttempt) return;
    
    LoginAttemptService.updateAttemptStatus(selectedAttempt.id, 'rejected', adminNotes);
    loadAttempts();
    setShowReviewDialog(false);
    
    toast({
      title: "User Rejected", 
      description: `Access denied for ${selectedAttempt.email}`,
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const pendingCount = attempts.filter(a => a.status === 'pending').length;

  return (
    <>
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              New User Requests
              {pendingCount > 0 && (
                <Badge className="bg-red-500 ml-2">{pendingCount} Pending</Badge>
              )}
            </CardTitle>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attempts.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No login requests found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-medium">{attempt.email}</TableCell>
                      <TableCell>{formatDate(attempt.timestamp)}</TableCell>
                      <TableCell>{attempt.ipAddress}</TableCell>
                      <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReview(attempt)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Login Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject this login request
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttempt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Email:</Label>
                  <p className="font-medium">{selectedAttempt.email}</p>
                </div>
                <div>
                  <Label>Time:</Label>
                  <p>{formatDate(selectedAttempt.timestamp)}</p>
                </div>
                <div>
                  <Label>IP Address:</Label>
                  <p>{selectedAttempt.ipAddress}</p>
                </div>
                <div>
                  <Label>Status:</Label>
                  {getStatusBadge(selectedAttempt.status)}
                </div>
              </div>
              
              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  className="mt-1"
                />
              </div>
              
              {selectedAttempt.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleApprove} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button onClick={handleReject} variant="destructive" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}