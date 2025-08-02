import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import UserApproval from "./UserApproval";

interface NewUserRequestsProps {
  onClose: () => void;
}

export default function NewUserRequests({ onClose }: NewUserRequestsProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [historyUsers, setHistoryUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updatePendingCount();
    fetchHistoryUsers();
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      updatePendingCount();
      fetchHistoryUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const updatePendingCount = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('status', 'pending');
      
      if (error) {
        console.error('Error fetching pending users:', error);
        return;
      }
      
      setPendingCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  const fetchHistoryUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status, created_at, approved_at, approved_by')
        .in('status', ['active', 'suspended'])
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching history users:', error);
        return;
      }
      
      setHistoryUsers(data || []);
    } catch (error) {
      console.error('Error fetching history users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl max-h-[80vh] overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            User Management
            {pendingCount > 0 && (
              <Badge className="bg-red-500 ml-2">{pendingCount} Pending</Badge>
            )}
          </CardTitle>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              New Requests
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            <UserApproval />
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading history...</div>
              ) : historyUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No user history found.
                </div>
              ) : (
                historyUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{user.full_name}</h4>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                            {user.status}
                          </Badge>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="text-xs text-muted-foreground">
                          <p>Registered: {new Date(user.created_at).toLocaleDateString()}</p>
                          {user.approved_at && (
                            <p>Approved: {new Date(user.approved_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}