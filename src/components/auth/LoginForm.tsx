
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
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Administrator Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@myclinic.com.sa"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
          className="w-full"
          required
        />
        <p className="text-xs text-gray-500">
          Access restricted to @myclinic.com.sa domain only
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
        Administrator Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
