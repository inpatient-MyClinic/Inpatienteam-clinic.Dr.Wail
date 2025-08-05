import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OTPLoginFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const OTPLoginForm: React.FC<OTPLoginFormProps> = ({ email, onSuccess, onBack }) => {
  const [otp, setOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [error, setError] = useState('');

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('=== OTP VERIFICATION START ===');
      console.log('Verifying OTP for email:', email, 'OTP:', otp);

      // Verify OTP using database function
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_otp', { 
          user_email: email, 
          submitted_code: otp 
        });

      console.log('OTP verification result:', { isValid, verifyError });

      if (verifyError) {
        console.error('OTP verification error:', verifyError);
        throw verifyError;
      }

      if (!isValid) {
        console.log('Invalid OTP provided');
        setError('Invalid or expired code. Please try again.');
        setOTP('');
        return;
      }

      console.log('OTP is valid, getting user profile...');

      const normalizedEmail = email.trim().toLowerCase();
      console.log('Looking up profile for:', normalizedEmail);

      // Get user profile with multiple fallback approaches
      let profile = null;
      
      // First try: exact match
      const { data: profile1, error: error1 } = await supabase
        .from('profiles')
        .select('id, role, status, email')
        .eq('email', normalizedEmail)
        .maybeSingle();
      
      if (profile1) {
        profile = profile1;
      } else {
        // Second try: case-insensitive match
        const { data: profile2, error: error2 } = await supabase
          .from('profiles')
          .select('id, role, status, email')
          .ilike('email', normalizedEmail)
          .maybeSingle();
        profile = profile2;
      }

      console.log('Profile lookup for OTP login:', { profile });

      if (!profile) {
        console.error('No profile found during OTP verification');
        setError('User profile not found. Please contact an administrator.');
        return;
      }

      console.log('Found profile, storing user data in localStorage...');

      // Store proper user data in localStorage for app authentication system
      const userData = {
        email: email.trim(),
        role: profile.role,
        status: profile.status,
        id: profile.id,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(`user_${email.trim()}`, JSON.stringify(userData));

      console.log('User data stored:', userData);
      console.log('=== OTP VERIFICATION SUCCESS ===');

      toast.success('OTP verified successfully!');
      onSuccess();

      // Redirect to appropriate dashboard
      setTimeout(() => {
        switch (profile.role) {
          case 'admin':
            window.location.href = '/admin';
            break;
          case 'doctor':
            window.location.href = '/doctor-dashboard';
            break;
          case 'nurse':
            window.location.href = '/nurse-dashboard';
            break;
          case 'hospital':
            window.location.href = '/hospital-dashboard';
            break;
          case 'case-coordinator':
            window.location.href = '/case-coordinator-dashboard';
            break;
          case 'finance':
            window.location.href = '/finance-dashboard';
            break;
          case 'customer-care':
            window.location.href = '/customer-care-dashboard';
            break;
          default:
            window.location.href = '/dashboard';
        }
      }, 1000);

    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');

    try {
      const { error } = await supabase.functions.invoke('send-otp-email', {
        body: { email }
      });

      if (error) throw error;

      toast.success('New code sent to your email');
      setTimeLeft(120); // Reset timer
      setOTP('');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>
          We sent a 4-digit code to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmitOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="0000"
              maxLength={4}
              className="text-center text-2xl tracking-widest"
              autoComplete="one-time-code"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center text-sm text-muted-foreground">
            {timeLeft > 0 ? (
              <span>Code expires in {formatTime(timeLeft)}</span>
            ) : (
              <span className="text-destructive">Code has expired</span>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || otp.length !== 4 || timeLeft === 0}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>

        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            onClick={handleResendOTP}
            disabled={isResending || timeLeft > 60} // Allow resend only after 1 minute
            className="w-full"
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </Button>
          
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPLoginForm;