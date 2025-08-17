import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminLoginBypassProps {
  onBackToLogin: () => void;
}

const AdminLoginBypass: React.FC<AdminLoginBypassProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("admin@myclinic.com.sa");
  const [isLoading, setIsLoading] = useState(false);
  const [resetResult, setResetResult] = useState<{tempPassword: string, resetCode: string} | null>(null);

  const handleAdminReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('admin-password-reset', {
        body: { email, action: 'reset' }
      });

      if (error) {
        console.error('Admin reset error:', error);
        toast.error("Failed to reset password. Please contact support.");
        return;
      }

      setResetResult(data);
      toast.success("Admin password reset successfully!");
      
    } catch (error) {
      console.error('Admin reset error:', error);
      toast.error("Failed to reset password. Please contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  if (resetResult) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-900">Password Reset Successful</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Your New Temporary Password:</h3>
            <div className="text-lg font-mono bg-white p-3 rounded border text-center">
              {resetResult.tempPassword}
            </div>
            <p className="text-sm text-green-700 mt-2">
              Use this password to login. You can change it after logging in.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Login Instructions:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Click "Back to Login" below</li>
              <li>2. Enter your email: {email}</li>
              <li>3. Enter the password shown above</li>
              <li>4. Click "Sign In"</li>
            </ol>
          </div>

          <Button 
            type="button" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={onBackToLogin}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-orange-900">Admin Password Reset</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-orange-50 rounded-lg mb-4">
          <h3 className="font-semibold text-orange-900 mb-2">Emergency Admin Access</h3>
          <p className="text-sm text-orange-700">
            This will reset your admin password to a new temporary password that you can use to login immediately.
          </p>
        </div>

        <form onSubmit={handleAdminReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
              readOnly
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-orange-600 hover:bg-orange-700"
            disabled={isLoading}
          >
            {isLoading ? "Resetting Password..." : "Reset Admin Password"}
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={onBackToLogin}
          >
            Back to Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminLoginBypass;