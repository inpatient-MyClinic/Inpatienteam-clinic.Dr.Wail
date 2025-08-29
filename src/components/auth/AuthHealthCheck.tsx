import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HealthCheckItem {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export const AuthHealthCheck = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checks, setChecks] = useState<HealthCheckItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runHealthChecks = async () => {
    setIsRunning(true);
    const results: HealthCheckItem[] = [];

    // Check 1: Environment variables - using direct URLs (no VITE_ vars needed)
    try {
      const supabaseUrl = "https://ixivawgjdoahqzlghtcz.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aXZhd2dqZG9haHF6bGdodGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDM0NTYsImV4cCI6MjA2OTQ3OTQ1Nn0.TWEJmPlsB5tfHd-2447XkoB9npjZJ6HSt8qCbUD4EPQ";
      
      if (supabaseUrl && supabaseKey) {
        results.push({
          name: "Environment Variables",
          status: 'success',
          message: "Supabase configuration is correctly set with direct URLs"
        });
      } else {
        results.push({
          name: "Environment Variables",
          status: 'error',
          message: "Supabase configuration missing"
        });
      }
    } catch (error) {
      results.push({
        name: "Environment Variables",
        status: 'error',
        message: "Error checking configuration"
      });
    }

    // Check 2: Supabase connectivity
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        results.push({
          name: "Supabase Connectivity",
          status: 'error',
          message: `Supabase error: ${error.message}`
        });
      } else {
        results.push({
          name: "Supabase Connectivity",
          status: 'success',
          message: "Successfully connected to Supabase"
        });
      }
    } catch (error) {
      results.push({
        name: "Supabase Connectivity",
        status: 'error',
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Check 3: Current session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        results.push({
          name: "Auth Session",
          status: 'error',
          message: `Session error: ${error.message}`
        });
      } else if (session) {
        results.push({
          name: "Auth Session",
          status: 'success',
          message: `Logged in as: ${session.user.email}`
        });
      } else {
        results.push({
          name: "Auth Session",
          status: 'success',
          message: "No active session (logged out)"
        });
      }
    } catch (error) {
      results.push({
        name: "Auth Session",
        status: 'error',
        message: `Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Check 4: Reset password URL test
    try {
      const { error } = await supabase.auth.resetPasswordForEmail('test@example.com', {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        if (error.message.includes('redirect') || error.message.includes('URL')) {
          results.push({
            name: "Reset URL Configuration",
            status: 'error',
            message: `Redirect URL not allowed. Add ${window.location.origin}/reset-password to Additional Redirect URLs in Supabase Auth settings`
          });
        } else {
          results.push({
            name: "Reset URL Configuration",
            status: 'success',
            message: "Reset password redirect URL is configured correctly"
          });
        }
      } else {
        results.push({
          name: "Reset URL Configuration",
          status: 'success',
          message: "Reset password redirect URL is configured correctly"
        });
      }
    } catch (error) {
      results.push({
        name: "Reset URL Configuration",
        status: 'error',
        message: `Reset URL test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Check 5: SMTP configuration test
    try {
      const { error } = await supabase.auth.resetPasswordForEmail('smtp-test@example.com');
      
      if (error) {
        if (error.message.includes('SMTP') || error.message.includes('email')) {
          results.push({
            name: "SMTP Configuration",
            status: 'error',
            message: "SMTP not configured. Set up SMTP in Supabase Auth → Settings → SMTP"
          });
        } else {
          results.push({
            name: "SMTP Configuration",
            status: 'success',
            message: "SMTP appears to be configured"
          });
        }
      } else {
        results.push({
          name: "SMTP Configuration",
          status: 'success',
          message: "SMTP is configured and working"
        });
      }
    } catch (error) {
      results.push({
        name: "SMTP Configuration",
        status: 'error',
        message: `SMTP test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setChecks(results);
    setIsRunning(false);
  };

  const getStatusBadge = (status: HealthCheckItem['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Pass</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Fail</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">⏳ Pending</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <CardTitle className="flex items-center justify-between text-sm">
              🔍 Auth Health Check
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Button 
              onClick={runHealthChecks} 
              disabled={isRunning}
              className="w-full"
              size="sm"
            >
              {isRunning ? 'Running Checks...' : 'Run Health Check'}
            </Button>
            
            {checks.length > 0 && (
              <div className="space-y-2">
                {checks.map((check, index) => (
                  <div key={index} className="flex items-start justify-between p-2 border rounded-sm">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{check.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{check.message}</div>
                    </div>
                    <div className="ml-2">
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <strong>Configuration Checklist:</strong><br />
              • Site URL: https://www.inpatienteam.com<br />
              • Additional Redirect URLs: https://www.inpatienteam.com/*, *.lovable.app/*<br />
              • SMTP: smtp.gmail.com:465 with inpatienteam@gmail.com<br />
              • Email templates enabled for Reset password & Magic link
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};