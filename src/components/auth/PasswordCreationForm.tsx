
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordCreationFormProps {
  email: string;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

const PasswordCreationForm: React.FC<PasswordCreationFormProps> = ({
  email,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  onBackToLogin
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          Administrator Setup
        </h3>
        <p className="text-sm text-blue-700">
          Create your administrator password to access the system management panel.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Administrator Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="w-full bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Create Admin Password</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="Create a strong password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full"
          required
        />
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
        Create Admin Account & Access System
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
  );
};

export default PasswordCreationForm;
