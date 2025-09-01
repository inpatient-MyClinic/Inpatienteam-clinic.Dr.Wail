import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const AuthHealthPanel = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [details, setDetails] = useState<any>(null);

  const runHealthCheck = async () => {
    setIsChecking(true);
    setStatus('idle');
    
    try {
      // Test database connection
      const { data: pingData, error: pingError } = await supabase.rpc('health_ping');
      
      if (pingError) {
        setStatus('error');
        setDetails({ error: pingError.message });
        return;
      }
      
      // Get current configuration
      const redirectUrl = `${window.location.origin}/admin`;
      const currentUrl = window.location.href;
      
      setStatus('success');
      setDetails({
        database: pingData?.[0] || null,
        redirectUrl,
        currentUrl,
        supabaseUrl: "https://ixivawgjdoahqzlghtcz.supabase.co"
      });
      
    } catch (error: any) {
      setStatus('error');
      setDetails({ error: error.message });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">متصل</Badge>;
      case 'error':
        return <Badge variant="destructive">خطأ</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          Auth Health Check
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={runHealthCheck} 
          disabled={isChecking}
          size="sm"
          className="w-full"
        >
          {isChecking ? "جاري الفحص..." : "فحص الاتصال"}
        </Button>
        
        {details && (
          <div className="text-xs space-y-2">
            {status === 'success' && (
              <>
                <div>
                  <strong>Database:</strong> {details.database?.db || 'Unknown'}
                </div>
                <div>
                  <strong>Current URL:</strong> {details.currentUrl}
                </div>
                <div>
                  <strong>Redirect URL:</strong> {details.redirectUrl}
                </div>
                <div>
                  <strong>Supabase URL:</strong> {details.supabaseUrl}
                </div>
              </>
            )}
            
            {status === 'error' && (
              <div className="text-red-600">
                <strong>Error:</strong> {details.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};