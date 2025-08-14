
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

interface PasswordCreationFormProps {
  email: string;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
  isAdminEmail?: boolean;
}

const PasswordCreationForm: React.FC<PasswordCreationFormProps> = ({
  email,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  onBackToLogin,
  isAdminEmail = false
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className={`p-4 rounded-lg mb-4 ${isAdminEmail ? 'bg-blue-50' : 'bg-green-50'}`}>
        <h3 className={`font-semibold mb-2 ${isAdminEmail ? 'text-blue-900' : 'text-green-900'}`}>
          {isAdminEmail ? 'Administrator Setup' : 'Create Account'}
        </h3>
        <p className={`text-sm ${isAdminEmail ? 'text-blue-700' : 'text-green-700'}`}>
          {isAdminEmail 
            ? 'Create your administrator password to access the system management panel.'
            : 'Create your account. You will need admin approval before you can login.'
          }
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{isAdminEmail ? 'Administrator Email' : 'Email'}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="w-full bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{isAdminEmail ? 'Create Admin Password' : 'Create Password'}</Label>
        <PasswordInput
          id="newPassword"
          placeholder="Create a strong password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full"
          required
        />
      </div>

      <Button type="submit" className={`w-full ${isAdminEmail ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
        {isAdminEmail ? 'Create Admin Account & Access System' : 'Create Account'}
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
