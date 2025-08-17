import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Key, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';

interface UserProfileHeaderProps {
  className?: string;
}

export default function UserProfileHeader({ className = "" }: UserProfileHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get user data from Supabase auth
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        // Determine role based on email
        if (session.user.email.includes('admin') || session.user.email === 'inpatienteam@gmail.com') {
          setUserRole('admin');
        } else {
          setUserRole('user');
        }
      }
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        if (session.user.email.includes('admin') || session.user.email === 'inpatienteam@gmail.com') {
          setUserRole('admin');
        } else {
          setUserRole('user');
        }
      } else {
        setUserEmail(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Get user's display name from email or stored data
  const getUserDisplayName = () => {
    if (!userEmail) return 'Unknown User';
    
    // Try to get full name from localStorage first
    const userData = localStorage.getItem(`user_${userEmail}`);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.full_name) return user.full_name;
        if (user.displayName) return user.displayName;
      } catch (e) {
        console.warn('Error parsing user data:', e);
      }
    }
    
    // Fallback to email prefix
    return userEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChangePassword = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "User email not found",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Send password reset email using Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Error",
          description: "Failed to send password reset email. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error) {
      console.error('Password change request error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Clear localStorage
      if (userEmail) {
        localStorage.removeItem(`user_${userEmail}`);
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Navigate to login page
      navigate('/');
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDisplayName = () => {
    if (!userRole) return '';
    
    const roleNames = {
      'admin': 'Administrator',
      'doctor': 'Doctor',
      'nurse': 'Nurse',
      'hospital': 'Hospital Staff',
      'case-coordinator': 'Case Coordinator',
      'finance': 'Finance',
      'customer-care': 'Customer Care'
    };
    
    return roleNames[userRole as keyof typeof roleNames] || userRole;
  };

  if (!userEmail || !userRole) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <Logo size="lg" showText={true} />
      
      <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
          <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleChangePassword} disabled={isLoading}>
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}