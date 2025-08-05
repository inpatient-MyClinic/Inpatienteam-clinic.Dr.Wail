
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAILS = [
  'wail.ahmed@myclinic.com.sa',
  'admin@myclinic.com.sa', 
  'inpatienteam@gmail.com'
];

const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

export const useAuthLogic = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const [showOTPLogin, setShowOTPLogin] = useState(false);
  const navigate = useNavigate();

  const handlePasswordCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Enhanced password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    try {
      console.log('Attempting to create user with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: email.split('@')[0],
            email: email.trim().toLowerCase()
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('User already registered')) {
          toast.error('User already exists. Please try logging in instead.');
          setIsFirstTimeLogin(false);
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id);
        
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if profile was created
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast.error('Account created but profile setup failed. Please contact support.');
        } else {
          console.log('Profile created successfully:', profile);
          if (isAdminEmail(email)) {
            toast.success('Admin account created successfully! You can now login.');
          } else {
            toast.success('Account created! Please wait for admin approval before logging in.');
          }
        }
        
        setIsFirstTimeLogin(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Network error occurred. Please check your connection and try again.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if OTP is disabled in admin settings
    const otpEnabled = localStorage.getItem('otpEnabled') !== 'false';
    const isAdmin = isAdminEmail(email);
    
    console.log('=== LOGIN DEBUG ===');
    console.log('Email:', email);
    console.log('Is Admin:', isAdmin);
    console.log('OTP Enabled:', otpEnabled);
    console.log('localStorage otpEnabled value:', localStorage.getItem('otpEnabled'));
    
    // For admin users, always use password login
    if (isAdmin) {
      console.log('Using admin password login');
      return handleAdminLogin();
    }
    
    // For non-admin users, check OTP setting
    if (otpEnabled) {
      console.log('OTP enabled - using OTP login');
      return handleOTPLogin();
    } else {
      console.log('OTP disabled - using direct login');
      return handleDirectLogin();
    }
  };

  const handleAdminLogin = async () => {
    try {
      console.log('Attempting admin login for email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        if (error.message === 'Invalid login credentials') {
          toast.error('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before logging in.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a moment before trying again.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        handleSuccessfulLogin(data.user.id);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message?.includes('fetch')) {
        toast.error('Network connection error. Please check your internet connection and try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleOTPLogin = async () => {
    try {
      console.log('=== OTP LOGIN START ===');
      console.log('Email:', email);
      console.log('Calling send-otp-email function...');
      
      // Call the edge function to send OTP
      const { data, error: otpError } = await supabase.functions.invoke('send-otp-email', {
        body: { email: email.trim() }
      });

      console.log('Edge function response:', { data, otpError });

      if (otpError) {
        console.error('OTP Error:', otpError);
        if (otpError.message?.includes('User not found')) {
          toast.error('User not found. Please contact an administrator.');
        } else if (otpError.message?.includes('not active')) {
          toast.error('Account pending approval. Contact administrator.');
        } else {
          toast.error(`Failed to send verification code: ${otpError.message}`);
        }
        return;
      }

      console.log('=== OTP SENT - SHOWING OTP SCREEN ===');
      toast.success('Verification code sent to your email! Check your inbox.');
      setShowOTPLogin(true);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleDirectLogin = async () => {
    try {
      console.log('=== DIRECT LOGIN (OTP DISABLED) ===');
      console.log('Direct login for:', email);
      
      // Check if user exists and is active first
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, status, email')
        .or(`email.eq.${email.trim().toLowerCase()},email.ilike.${email.trim()}`);

      if (profileError || !profiles || profiles.length === 0) {
        toast.error('User not found. Please contact an administrator.');
        return;
      }

      const profile = profiles[0];
      
      if (profile.status !== 'active') {
        toast.error('Account pending approval. Contact administrator.');
        return;
      }

      // Store user data directly in localStorage (bypass Supabase auth)
      const userData = {
        email: profile.email,
        role: profile.role,
        status: profile.status,
        id: profile.id,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem(`user_${profile.email}`, JSON.stringify(userData));

      toast.success('Login successful! (OTP bypassed)');
      
      // Redirect based on role
      const dashboards = {
        'admin': '/admin',
        'doctor': '/doctor-dashboard',
        'nurse': '/nurse-dashboard',
        'hospital': '/hospital-dashboard',
        'case-coordinator': '/case-coordinator-dashboard',
        'finance': '/finance-dashboard',
        'customer-care': '/customer-care-dashboard'
      };
      
      navigate(dashboards[profile.role] || '/dashboard');
      
    } catch (error) {
      console.error('Direct login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleSuccessfulLogin = async (userId: string) => {
    try {
      // Get user profile and email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, status, must_change_password, password_change_required_at, email')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        toast.error('Error loading user profile. Please try again.');
        await supabase.auth.signOut();
        return;
      }

      if (profile.status !== 'active') {
        toast.error('Your account is pending approval. Please contact an administrator.');
        await supabase.auth.signOut();
        return;
      }

      // Check if password change is required
      const passwordChangeRequired = profile.must_change_password || 
        (profile.password_change_required_at && new Date(profile.password_change_required_at) <= new Date());
      
      if (passwordChangeRequired) {
        toast.error('Your password has expired. Please change your password.');
        await supabase.auth.signOut();
        return;
      }

      // Store user data in localStorage for app authentication system
      const userData = {
        email: profile.email,
        role: profile.role,
        status: profile.status,
        id: userId
      };
      localStorage.setItem(`user_${profile.email}`, JSON.stringify(userData));

      toast.success('Login successful!');
      
      // Redirect based on role
      switch (profile.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'nurse':
          navigate('/nurse-dashboard');
          break;
        case 'hospital':
          navigate('/hospital-dashboard');
          break;
        case 'case-coordinator':
          navigate('/case-coordinator-dashboard');
          break;
        case 'finance':
          navigate('/finance-dashboard');
          break;
        case 'customer-care':
          navigate('/customer-care-dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      console.error('Post-login error:', error);
      toast.error('Login successful but failed to load profile. Please try again.');
    }
  };

  const handleOTPSuccess = () => {
    setShowOTPLogin(false);
    setPassword('');
    // The OTPLoginForm will handle the actual login
  };

  const handleBackFromOTP = () => {
    setShowOTPLogin(false);
  };

  const handleBackToLogin = () => {
    setIsFirstTimeLogin(false);
    setPassword("");
    setConfirmPassword("");
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    rememberMe,
    setRememberMe,
    isFirstTimeLogin,
    setIsFirstTimeLogin,
    showOTPLogin,
    handlePasswordCreation,
    handleLogin,
    handleBackToLogin,
    handleOTPSuccess,
    handleBackFromOTP,
    handleSuccessfulLogin,
    isAdminEmail
  };
};
