import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminLoginDebug: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDirectAdminLogin = async () => {
    setIsLoading(true);
    try {
      // Direct login with known credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@myclinic.com.sa',
        password: 'TempAdmin123!'
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Login failed: ' + error.message);
      } else if (data.user) {
        console.log('Login successful:', data.user);
        toast.success('Login successful! Redirecting...');
        
        // Store user data
        const userData = {
          email: 'admin@myclinic.com.sa',
          role: 'admin',
          isAuthenticated: true,
          loginType: 'supabase'
        };
        
        localStorage.setItem('user_admin@myclinic.com.sa', JSON.stringify(userData));
        localStorage.setItem('currentUser', 'admin@myclinic.com.sa');
        
        // Force page reload to trigger navigation
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center text-orange-900">Debug Login</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            For testing purposes only
          </p>
          
          <Button 
            onClick={handleDirectAdminLogin}
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Logging in...' : 'Direct Admin Login'}
          </Button>
          
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <p><strong>Email:</strong> admin@myclinic.com.sa</p>
            <p><strong>Password:</strong> TempAdmin123!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLoginDebug;