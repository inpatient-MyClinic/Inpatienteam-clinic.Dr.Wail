import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthenticationForms = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  // Email/Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          setError('Email or password is incorrect.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email first.');
        } else if (error.message.includes('redirect')) {
          const redirectUrl = `${window.location.origin}/admin`;
          setError(`Redirect not allowed. Add this URL to Supabase Auth → URL Configuration: ${redirectUrl}`);
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Login successful!');
        navigate('/admin');
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });

      if (error) {
        if (error.message.includes('redirect')) {
          const redirectUrl = `${window.location.origin}/admin`;
          setError(`Redirect not allowed. Add this URL to Supabase Auth → URL Configuration: ${redirectUrl}`);
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Account created! Please check your email for verification.');
        setActiveTab('login');
      }
    } catch (error) {
      setError(`Signup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        if (error.message.includes('redirect')) {
          const redirectUrl = `${window.location.origin}/reset-password`;
          setError(`Redirect not allowed. Add this URL to Supabase Auth → URL Configuration: ${redirectUrl}`);
        } else {
          setError(error.message);
        }
      } else {
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      setError(`Reset error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password Handler (for /reset-password page)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        setError(error.message);
      } else {
        toast.success('Password updated successfully!');
        navigate('/admin');
      }
    } catch (error) {
      setError(`Password update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Magic Link
  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { 
          emailRedirectTo: `${window.location.origin}/admin` 
        }
      });

      if (error) {
        if (error.message.includes('redirect')) {
          const redirectUrl = `${window.location.origin}/admin`;
          setError(`Redirect not allowed. Add this URL to Supabase Auth → URL Configuration: ${redirectUrl}`);
        } else {
          setError(error.message);
        }
      } else {
        toast.success('Magic link sent! Check your email.');
      }
    } catch (error) {
      setError(`Magic link error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@myclinic.com.sa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot Password?
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleMagicLink}
                disabled={isLoading}
              >
                Send Magic Link
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@myclinic.com.sa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <PasswordInput
                  id="signup-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <PasswordInput
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Reset Password Form (for /reset-password page)
export const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        setError(error.message);
      } else {
        toast.success('Password updated successfully!');
        navigate('/admin');
      }
    } catch (error) {
      setError(`Password update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <PasswordInput
              id="confirm-new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};