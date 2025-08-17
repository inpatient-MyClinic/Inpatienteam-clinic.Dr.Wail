import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const InviteLink = () => {
  const [email, setEmail] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  // Only allow admin emails
  const allowedAdminEmails = [
    'admin@myclinic.com.sa',
    'inpatienteam@gmail.com',
    'admin@inpatienteam.com'
  ];

  const isValidAdminEmail = (email: string) => {
    return allowedAdminEmails.includes(email.toLowerCase()) || email.toLowerCase().endsWith('@myclinic.com.sa');
  };

  const generateInviteLink = () => {
    if (!isValidAdminEmail(email)) {
      toast.error('This email is not authorized for admin access');
      return;
    }

    // Generate a simple invite URL (you can make this more sophisticated)
    const baseUrl = window.location.origin;
    const inviteToken = btoa(email + ':' + Date.now()).replace(/[+/=]/g, '');
    const url = `${baseUrl}?invite=${inviteToken}&email=${encodeURIComponent(email)}`;
    
    setInviteUrl(url);
    setShowInviteLink(true);
    toast.success('Invite link generated successfully');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="w-full max-w-md mt-6">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Admin Invite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Admin Email</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@myclinic.com.sa"
          />
        </div>

        <Button
          onClick={generateInviteLink}
          disabled={!isValidAdminEmail(email)}
          className="w-full"
          variant="outline"
        >
          Generate Invite Link
        </Button>

        {!isValidAdminEmail(email) && email && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800 text-xs">
              Only authorized admin emails can use this feature.
            </AlertDescription>
          </Alert>
        )}

        {showInviteLink && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800 text-xs space-y-2">
              <strong>Invite Link Generated:</strong>
              <div className="bg-white p-2 rounded border text-xs break-all">
                {inviteUrl}
              </div>
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Copy className="w-3 h-3" />
                Copy Link
              </Button>
              <p className="text-xs">
                Share this link with the admin user. They can use it to sign up directly.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};