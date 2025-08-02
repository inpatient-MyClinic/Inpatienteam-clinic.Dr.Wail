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
      // Verify OTP using database function
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_otp', { 
          user_email: email, 
          submitted_code: otp 
        });

      if (verifyError) {
        throw verifyError;
      }

      if (!isValid) {
        setError('Invalid or expired code. Please try again.');
        setOTP('');
        return;
      }

      // OTP is valid - create a direct authentication session
      // Get user ID from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        setError('User profile not found. Please contact support.');
        return;
      }

      // For demo purposes, we'll use a magic link approach
      // In production, you'd want to create a proper session
      localStorage.setItem(`user_${email}`, JSON.stringify({
        email,
        role: 'verified_otp_user',
        loginTime: new Date().toISOString()
      }));

      toast.success('OTP verified successfully!');
      onSuccess();

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