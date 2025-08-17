import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AdminBootstrap = () => {
  const [email, setEmail] = useState('admin@myclinic.com.sa');
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  // Only show if no user is logged in
  if (session) return null;

  // Only allow admin emails
  const allowedAdminEmails = [
    'admin@myclinic.com.sa',
    'inpatienteam@gmail.com',
    'admin@inpatienteam.com'
  ];

  const isValidAdminEmail = (email: string) => {
    return allowedAdminEmails.includes(email.toLowerCase());
  };

  const handleSendInvite = async () => {
    if (!isValidAdminEmail(email)) {
      toast.error('This email is not authorized for admin access');
      return;
    }

    setIsLoading(true);

    try {
      // Since we can't expose service role key in client, show manual instructions
      setShowInstructions(true);
      toast.info('Admin invitation instructions displayed below');
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mt-6">
      <CardHeader>
        <CardTitle className="text-sm">🔧 Admin Bootstrap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Admin Email</Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@myclinic.com.sa"
          />
        </div>

        <Button
          onClick={handleSendInvite}
          disabled={isLoading || !isValidAdminEmail(email)}
          className="w-full"
          variant="outline"
        >
          {isLoading ? 'Processing...' : 'Send Invite'}
        </Button>

        {!isValidAdminEmail(email) && email && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800 text-xs">
              Only authorized admin emails can use this feature.
            </AlertDescription>
          </Alert>
        )}

        {showInstructions && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800 text-xs">
              <strong>Manual Setup Required:</strong><br />
              1. Go to Supabase → Auth → Add user<br />
              2. Email: {email}<br />
              3. Password: TempAdmin123!<br />
              4. Auto-confirm: ✓<br />
              5. User will be prompted to change password on first login
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};