import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmailDiagnostics {
  smtpHost: boolean;
  smtpPort: boolean;
  smtpUser: boolean;
  smtpPass: boolean;
  smtpSecure: boolean;
  emailFrom: boolean;
  emailReplyTo: boolean;
  resendApiKey: boolean;
}

export function EmailTestDialog({ open, onOpenChange }: EmailTestDialogProps) {
  const [email, setEmail] = useState('inpatienteam@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<EmailDiagnostics | null>(null);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
  const { toast } = useToast();

  const loadDiagnostics = async () => {
    setLoadingDiagnostics(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-debug');
      if (error) throw error;
      setDiagnostics(data);
    } catch (error: any) {
      console.error('Failed to load diagnostics:', error);
      toast({
        variant: "destructive",
        title: "Diagnostics Error",
        description: "Failed to load email configuration diagnostics.",
      });
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  const sendTestEmail = async () => {
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-test', {
        body: { to: email }
      });

      if (error) throw error;

      if (data.ok) {
        toast({
          title: "Email Sent Successfully",
          description: `Test email sent via ${data.provider}. Message ID: ${data.messageId}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Email Send Failed",
          description: data.error || "Unknown error occurred",
        });
      }
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      toast({
        variant: "destructive",
        title: "Email Send Failed",
        description: "Please check SMTP settings or try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDiagnosticIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  React.useEffect(() => {
    if (open) {
      loadDiagnostics();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Test & Diagnostics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Diagnostics Section */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Configuration Status
            </h3>
            
            {loadingDiagnostics ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading diagnostics...
              </div>
            ) : diagnostics ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.smtpHost)}
                  <span>SMTP Host</span>
                </div>
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.smtpPort)}
                  <span>SMTP Port</span>
                </div>
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.smtpUser)}
                  <span>SMTP User</span>
                </div>
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.smtpPass)}
                  <span>SMTP Pass</span>
                </div>
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.smtpSecure)}
                  <span>SMTP Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.emailFrom)}
                  <span>Email From</span>
                </div>
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.emailReplyTo)}
                  <span>Reply To</span>
                </div>
                <div className="flex items-center gap-2">
                  {getDiagnosticIcon(diagnostics.resendApiKey)}
                  <span>Resend Key</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Test Email Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={sendTestEmail} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Test Email
              </Button>
              
              <Button 
                variant="outline" 
                onClick={loadDiagnostics}
                disabled={loadingDiagnostics}
              >
                {loadingDiagnostics && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}