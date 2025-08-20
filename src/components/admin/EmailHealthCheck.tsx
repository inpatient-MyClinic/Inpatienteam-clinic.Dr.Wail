import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Mail, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function EmailHealthCheck() {
  const [open, setOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('inpatienteam@gmail.com');
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [isLoadingMagic, setIsLoadingMagic] = useState(false);
  const [healthStatus, setHealthStatus] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const requiredSecrets = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_SECURE',
    'EMAIL_FROM'
  ];

  const checkHealth = async () => {
    setIsLoadingHealth(true);
    try {
      // Check each secret by attempting to get diagnostics
      const status: Record<string, boolean> = {};
      
      // For now, we'll simulate the check since we can't directly access env vars
      // In a real implementation, you'd call an edge function that checks these
      const response = await fetch(`https://ixivawgjdoahqzlghtcz.supabase.co/functions/v1/email-debug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: '', body: '' })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        // If test succeeds, assume all secrets are present
        requiredSecrets.forEach(secret => {
          status[secret] = true;
        });
      } else {
        // Parse error message to determine missing secrets
        const errorMsg = result.error || '';
        requiredSecrets.forEach(secret => {
          status[secret] = !errorMsg.includes(secret);
        });
      }
      
      setHealthStatus(status);
    } catch (error) {
      console.error('Health check failed:', error);
      // On error, assume secrets might be missing
      requiredSecrets.forEach(secret => {
        setHealthStatus(prev => ({ ...prev, [secret]: false }));
      });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const sendTestEmail = async () => {
    setIsLoadingTest(true);
    try {
      const response = await fetch(`https://ixivawgjdoahqzlghtcz.supabase.co/functions/v1/email-debug`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          to: testEmail, 
          body: 'SMTP live test from Admin panel' 
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        toast({
          title: "Test email sent ✅",
          description: `Email successfully sent to ${testEmail}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "SMTP error",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network error",
        description: String(error),
      });
    } finally {
      setIsLoadingTest(false);
    }
  };

  const sendPasswordReset = async () => {
    setIsLoadingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        if (error.message.includes('redirect')) {
          toast({
            variant: "destructive",
            title: "Redirect not allowed",
            description: `Add ${window.location.origin}/reset-password to Auth → URL Configuration → Additional Redirect URLs in Supabase.`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Password reset failed",
            description: error.message,
          });
        }
      } else {
        toast({
          title: "Password reset sent ✅",
          description: `Check ${testEmail} for reset instructions`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: String(error),
      });
    } finally {
      setIsLoadingReset(false);
    }
  };

  const sendMagicLink = async () => {
    setIsLoadingMagic(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: testEmail,
        options: { 
          emailRedirectTo: `${window.location.origin}/admin` 
        }
      });
      
      if (error) {
        toast({
          variant: "destructive", 
          title: "Magic link failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Magic link sent ✅",
          description: `Check ${testEmail} for login link`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: String(error),
      });
    } finally {
      setIsLoadingMagic(false);
    }
  };

  useEffect(() => {
    if (open) {
      checkHealth();
    }
  }, [open]);

  const missingSecrets = requiredSecrets.filter(secret => !healthStatus[secret]);
  const hasAllSecrets = missingSecrets.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex flex-col h-20 gap-2">
          <Mail className="w-5 h-5" />
          <span className="text-xs">Email Health</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email System Health Check
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Health Status */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">SMTP Configuration</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={checkHealth}
                disabled={isLoadingHealth}
              >
                {isLoadingHealth && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Refresh
              </Button>
            </div>
            
            {!hasAllSecrets && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Missing SMTP secrets. Add them in Lovable → Secrets (must include SMTP_HOST).
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {requiredSecrets.map((secret) => (
                <div key={secret} className="flex items-center gap-2">
                  {healthStatus[secret] ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>{secret}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Email Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-email">Test Recipient</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="recipient@example.com"
                className="mt-1"
              />
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={sendTestEmail}
                disabled={isLoadingTest || !hasAllSecrets}
                className="w-full"
              >
                {isLoadingTest && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Test Email (SMTP)
              </Button>
              
              <Button 
                variant="outline"
                onClick={sendPasswordReset}
                disabled={isLoadingReset}
                className="w-full"
              >
                {isLoadingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Password Reset (Supabase)
              </Button>
              
              <Button 
                variant="outline"
                onClick={sendMagicLink}
                disabled={isLoadingMagic}
                className="w-full"
              >
                {isLoadingMagic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Magic Link (Supabase)
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}