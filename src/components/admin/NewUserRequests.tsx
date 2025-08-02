import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import UserApproval from "./UserApproval";

interface NewUserRequestsProps {
  onClose: () => void;
}

export default function NewUserRequests({ onClose }: NewUserRequestsProps) {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    updatePendingCount();
    // Poll for updates every 30 seconds
    const interval = setInterval(updatePendingCount, 30000);
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

  return (
    <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
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
      <CardContent className="overflow-y-auto">
        <div className="space-y-4">
          <UserApproval />
        </div>
      </CardContent>
    </Card>
  );
}