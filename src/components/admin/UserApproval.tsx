import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck, UserX, Clock, Mail, Phone, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PendingUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  specialty: string | null;
  hospital_code: string | null;
  phone: string | null;
  created_at: string;
  status: string;
}

export default function UserApproval() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch pending users",
          variant: "destructive",
        });
        return;
      }

      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error in fetchPendingUsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    
    try {
      const { error } = await supabase.rpc('approve_user', { user_id: userId });

      if (error) {
        console.error('Error approving user:', error);
        toast({
          title: "Error",
          description: "Failed to approve user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Approved",
        description: "User has been successfully approved and can now access the system",
      });

      // Remove from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error in approveUser:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const rejectUser = async (userId: string) => {
    setProcessingUsers(prev => new Set(prev).add(userId));
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', userId);

      if (error) {
        console.error('Error rejecting user:', error);
        toast({
          title: "Error",
          description: "Failed to reject user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Rejected",
        description: "User has been rejected and suspended",
        variant: "destructive",
      });

      // Remove from pending list
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error in rejectUser:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'default';
      case 'nurse': return 'secondary';
      case 'hospital': return 'outline';
      case 'case-coordinator': return 'default';
      case 'finance': return 'secondary';
      case 'customer-care': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Approvals</CardTitle>
          <CardDescription>Loading pending user registrations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          User Approvals
        </CardTitle>
        <CardDescription>
          Review and approve new user registrations ({pendingUsers.length} pending)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingUsers.length === 0 ? (
          <Alert>
            <AlertDescription>
              No pending user registrations at this time.
            </AlertDescription>
          </Alert>
        ) : (
          pendingUsers.map((user) => (
            <Card key={user.id} className="border border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.full_name || 'No name provided'}</h3>
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {user.phone}
                        </div>
                      )}
                      
                      {user.hospital_code && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Hospital Code: {user.hospital_code}
                        </div>
                      )}
                      
                      {user.specialty && (
                        <div className="text-sm">
                          <strong>Specialty:</strong> {user.specialty}
                        </div>
                      )}
                      
                      <div className="text-xs">
                        Registered: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => approveUser(user.id)}
                      disabled={processingUsers.has(user.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingUsers.has(user.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => rejectUser(user.id)}
                      disabled={processingUsers.has(user.id)}
                      size="sm"
                      variant="destructive"
                    >
                      {processingUsers.has(user.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}