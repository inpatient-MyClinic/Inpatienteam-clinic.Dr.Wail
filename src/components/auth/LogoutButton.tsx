import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = "outline", 
  size = "default",
  className = ""
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all user data from localStorage
    Object.keys(localStorage)
      .filter(key => key.startsWith('user_'))
      .forEach(key => localStorage.removeItem(key));
    
    // Navigate to login page
    navigate('/');
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;