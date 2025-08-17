import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetMethod, setResetMethod] = useState<"email" | "otp">("email");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      
      // First verify the user exists in the system
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('email, status')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (profileError || !profiles) {
        toast.error("Email address not found in our system");
        return;
      }

      if (profiles.status !== 'active') {
        toast.error("Account is not active. Please contact administrator.");
        return;
      }

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/change-password`
      });

      if (error) {
        console.error("Password reset error:", error);
        toast.error("Failed to send reset email. Please try again.");
        return;
      }

      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('send-otp-email', {
        body: { email: email.trim().toLowerCase() }
      });

      if (error) {
        console.error("OTP Error:", error);
        toast.error("Failed to send verification code. Please try again.");
        return;
      }

      setOtpSent(true);
      toast.success("Verification code sent! Check your email.");
      
      if (data?.otp) {
        console.log('🔑 OTP CODE:', data.otp);
        toast.success(`Debug OTP: ${data.otp}`, { duration: 10000 });
      }
    } catch (error) {
      console.error("OTP request error:", error);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length !== 4) {
      toast.error("Please enter the 4-digit verification code");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      
      // First verify the OTP
      const { data: verifyData, error: verifyError } = await supabase.rpc('verify_otp', {
        user_email: email.trim().toLowerCase(),
        submitted_code: otpCode
      });

      if (verifyError || !verifyData) {
        toast.error("Invalid or expired verification code");
        return;
      }

      // If OTP is valid, allow password reset (this would need a custom implementation)
      toast.success("Verification successful! Password reset feature coming soon.");
      
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message for email reset
  if (emailSent && resetMethod === "email") {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-lg bg-green-50 mb-4">
          <h3 className="font-semibold mb-2 text-green-900">Email Sent!</h3>
          <p className="text-sm text-green-700">
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your email and click the link to reset your password.
          </p>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={onBackToLogin}
        >
          Back to Login
        </Button>
      </div>
    );
  }

  // Show OTP verification and password reset form
  if (otpSent && resetMethod === "otp") {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-blue-50 mb-4">
          <h3 className="font-semibold mb-2 text-blue-900">Verify Code & Reset Password</h3>
          <p className="text-sm text-blue-700">
            Enter the 4-digit code sent to <strong>{email}</strong> and your new password.
          </p>
        </div>

        <form onSubmit={handleOTPVerification} className="space-y-4">
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={otpCode}
                onChange={setOtpCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading || otpCode.length !== 4}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setOtpSent(false);
              setOtpCode("");
              setNewPassword("");
              setConfirmNewPassword("");
            }}
          >
            Back to Send Code
          </Button>
        </form>
      </div>
    );
  }

  // Main form - choose reset method
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-blue-50 mb-4">
        <h3 className="font-semibold mb-2 text-blue-900">Reset Password</h3>
        <p className="text-sm text-blue-700">
          Choose how you'd like to reset your password.
        </p>
      </div>

      {/* Method Selection */}
      <div className="space-y-3">
        <Label>Reset Method</Label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="resetMethod"
              value="email"
              checked={resetMethod === "email"}
              onChange={(e) => setResetMethod(e.target.value as "email")}
              className="text-blue-600"
            />
            <span className="text-sm">Email reset link</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="resetMethod"
              value="otp"
              checked={resetMethod === "otp"}
              onChange={(e) => setResetMethod(e.target.value as "otp")}
              className="text-blue-600"
            />
            <span className="text-sm">4-digit verification code</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
          required
        />
      </div>

      {resetMethod === "email" ? (
        <form onSubmit={handleEmailReset} className="space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Email"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOTPRequest} className="space-y-4">
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
          </Button>
        </form>
      )}

      <Button 
        type="button" 
        variant="outline" 
        className="w-full"
        onClick={onBackToLogin}
      >
        Back to Login
      </Button>
    </div>
  );
};

export default ForgotPasswordForm;