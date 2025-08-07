
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCreateAccount?: () => void;
  onForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  onSubmit,
  onCreateAccount,
  onForgotPassword
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.name@myclinic.com.sa"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
          className="w-full"
          required
        />
        <p className="text-xs text-gray-500">
          Access restricted to authorized email addresses
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
          required
        />
        {onForgotPassword && (
          <div className="text-right mt-1">
            <Button 
              type="button"
              variant="link" 
              className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800 underline"
              onClick={onForgotPassword}
            >
              Forgot your password?
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
        />
        <Label htmlFor="remember" className="text-sm text-gray-600">
          Remember me
        </Label>
      </div>
      
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        Sign In
      </Button>
      
      {onCreateAccount && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            First time user?{" "}
            <Button 
              type="button"
              variant="link" 
              className="p-0 h-auto text-blue-600"
              onClick={onCreateAccount}
            >
              Create account
            </Button>
          </p>
        </div>
      )}
    </form>
  );
};

export default LoginForm;
