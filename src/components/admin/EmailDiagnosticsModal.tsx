import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailDiagnosticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DiagnosticsResult {
  smtpHost: boolean;
  smtpPort: boolean;
  smtpUser: boolean;
  smtpPass: boolean;
  smtpSecure: boolean;
  emailFrom: boolean;
  emailReplyTo: boolean;
  resendApiKey: boolean;
}

interface TestResult {
  ok: boolean;
  provider?: string;
  messageId?: string;
  error?: string;
}

export function EmailDiagnosticsModal({ open, onOpenChange }: EmailDiagnosticsModalProps) {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const { toast } = useToast();

  const loadDiagnostics = async () => {
    setIsLoadingDiagnostics(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-debug');
      if (error) throw error;
      setDiagnostics(data);
    } catch (error: any) {
      console.error('Failed to load diagnostics:', error);
      toast({
        variant: "destructive",
        title: "Diagnostics Error",
        description: "Failed to load email configuration.",
      });
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  const testEmail = async () => {
    setIsTestingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-test', {
        body: { to: 'inpatienteam@gmail.com' }
      });

      if (error) throw error;
      setTestResult(data);
      
      if (data.ok) {
        toast({
          title: "Test Email Sent",
          description: `Email sent successfully via ${data.provider}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Test Failed",
          description: data.error || "Unknown error",
        });
      }
    } catch (error: any) {
      console.error('Failed to test email:', error);
      setTestResult({ ok: false, error: error.message });
      toast({
        variant: "destructive",
        title: "Test Error",
        description: "Failed to send test email.",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const getStatusIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (value: boolean) => {
    return (
      <Badge variant={value ? "default" : "destructive"}>
        {value ? "OK" : "Missing"}
      </Badge>
    );
  };

  React.useEffect(() => {
    if (open) {
      loadDiagnostics();
      setTestResult(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Email System Diagnostics
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Configuration Status */}
          <div>
            <h3 className="text-sm font-medium mb-3">Configuration Status</h3>
            
            {isLoadingDiagnostics ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading configuration...
              </div>
            ) : diagnostics ? (
              <div className="space-y-2">
                {Object.entries(diagnostics).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(value)}
                      <span className="text-sm font-mono">{key.toUpperCase()}</span>
                    </div>
                    {getStatusBadge(value)}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Email Test */}
          <div>
            <h3 className="text-sm font-medium mb-3">Email Test</h3>
            
            <div className="space-y-3">
              <Button 
                onClick={testEmail} 
                disabled={isTestingEmail}
                className="w-full"
              >
                {isTestingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Test Email to inpatienteam@gmail.com
              </Button>
              
              {testResult && (
                <div className={`p-3 rounded-lg border ${
                  testResult.ok 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.ok ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium text-sm">
                      {testResult.ok ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  {testResult.ok ? (
                    <div className="text-sm text-gray-600">
                      <p>Provider: {testResult.provider}</p>
                      {testResult.messageId && (
                        <p>Message ID: {testResult.messageId}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">
                      {testResult.error}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadDiagnostics}
              disabled={isLoadingDiagnostics}
              className="flex-1"
            >
              {isLoadingDiagnostics && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Refresh
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}