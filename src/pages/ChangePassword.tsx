import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Key } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';

export default function ChangePassword() {
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        // If no session, try to sign in first using localStorage email and generate a reset
        const currentUserEmail = Object.keys(localStorage)
          .find(key => key.startsWith('user_'))
          ?.replace('user_', '');
        
        if (!currentUserEmail) {
          toast({
            title: "Error",
            description: "Please log in again to change your password",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Send reset password email instead
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(currentUserEmail, {
          redirectTo: `${window.location.origin}/change-password`
        });

        if (resetError) {
          console.error('Reset password error:', resetError);
          toast({
            title: "Error", 
            description: "Failed to send password reset email. Please try logging in again.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for password reset instructions.",
        });
        return;
      }

      // Update password if we have a valid session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        toast({
          title: "Error",
          description: "Failed to update password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update the profile to clear password change requirement
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            must_change_password: false,
            password_changed_at: new Date().toISOString(),
            password_change_required_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
          })
          .eq('id', user.id);
      }

      toast({
        title: "Success",
        description: "Password changed successfully!",
      });

      // Navigate to appropriate dashboard based on user role
      const currentUserEmail = user?.email;
      if (currentUserEmail) {
        const userData = localStorage.getItem(`user_${currentUserEmail}`);
        if (userData) {
          const user = JSON.parse(userData);
          switch (user.role) {
            case 'admin':
              navigate('/admin');
              break;
            case 'doctor':
              navigate('/doctor-dashboard');
              break;
            case 'nurse':
              navigate('/nurse-dashboard');
              break;
            case 'hospital':
              navigate('/hospital-dashboard');
              break;
            case 'case-coordinator':
              navigate('/case-coordinator-dashboard');
              break;
            case 'finance':
              navigate('/finance-dashboard');
              break;
            case 'customer-care':
              navigate('/customer-care-dashboard');
              break;
            default:
              navigate('/dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Key className="w-6 h-6" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your password has expired and must be changed before you can continue.
            </AlertDescription>
          </Alert>

          <form onSubmit={handlePasswordChange} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter your new password"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your new password"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                Cancel & Logout
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}