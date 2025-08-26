import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const NewLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
          setError('Redirect URL not allowed. Add this domain to Additional Redirect URLs in Supabase.');
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
        setError(error.message);
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
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label htmlFor="remember" className="text-sm">
              Keep me signed in
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/reset-request')}
          >
            Forgot your password?
          </Button>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Can't login?</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleMagicLink}
              disabled={isLoading}
            >
              Send Magic Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};