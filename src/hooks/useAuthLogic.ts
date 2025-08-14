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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

    // Check domain restrictions before attempting signup
    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      // Check if email is allowed to register
      const { data: isAllowed, error: checkError } = await supabase.rpc('is_email_allowed_to_register', {
        check_email: normalizedEmail
      });

      if (checkError) {
        console.error('Error checking email permission:', checkError);
        toast.error('Error validating email. Please try again.');
        return;
      }

      if (!isAllowed) {
        toast.error('Registration not allowed for this email domain. Contact administrator for pre-approval.');
        return;
      }

      console.log('Email is allowed to register, proceeding with signup...');
      
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
    console.log("handleLogin called - using Supabase authentication only");
    
    // All users must now use Supabase authentication
    await handleSupabaseLogin();
  };

  const handleOTPLogin = async () => {
    try {
      console.log('=== OTP LOGIN START ===');
      console.log('Raw Email Input:', email);
      console.log('showOTPLogin state before:', showOTPLogin);
      
      // Set showOTPLogin to true
      setShowOTPLogin(true);
      
      // First check if user exists in profiles
      const normalizedEmail = email.trim().toLowerCase();
      console.log('Normalized Email for Query:', normalizedEmail);
      
      // Create a test user if it doesn't exist (for testing)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, status, email')
        .eq('email', normalizedEmail);

      console.log('=== DETAILED PROFILE LOOKUP ===');
      console.log('Search Email:', normalizedEmail);
      console.log('Profiles Found:', profiles);
      console.log('Profile Error:', profileError);
      
      // Ensure the user exists without creating profiles client-side
      if (profileError || !profiles || profiles.length === 0) {
        toast.error('User not found or not approved. Please contact administrator.');
        return;
      }

      console.log('Calling send-otp-email function...');
      
      // Call the edge function to send OTP
      const { data, error: otpError } = await supabase.functions.invoke('send-otp-email', {
        body: { email: email.trim() }
      });

      console.log('Edge function response:', { data, otpError });

      if (otpError) {
        console.error('OTP Error:', otpError);
        toast.error(`Failed to send verification code: ${otpError.message}`);
        return;
      }
      
      // Show success message
      toast.success('Verification code sent! Check your email.');
      
      
      console.log('✅ OTP LOGIN SETUP COMPLETED - showOTPLogin should be true');
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleSupabaseLogin = async () => {
    console.log("Supabase login attempt for:", email);
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error("Supabase login error:", error);
        
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please confirm your email before logging in.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user && data.session) {
        console.log("Supabase login successful for:", email);
        await handleSuccessfulLogin(data.user.id);
      }
    } catch (error) {
      console.error("Supabase login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
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
          // Try to auto-confirm the user via edge function
          console.log('Email not confirmed, attempting auto-confirmation...');
          try {
            await supabase.functions.invoke('auto-confirm-user', {
              body: { email: email.trim().toLowerCase() }
            });
            
            // Retry login after confirmation
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: email.trim().toLowerCase(),
              password,
            });
            
            if (!retryError && retryData.user) {
              handleSuccessfulLogin(retryData.user.id);
              return;
            } else {
              console.error('Retry login failed:', retryError);
            }
          } catch (confirmError) {
            console.error('Auto-confirmation failed:', confirmError);
          }
          
          toast.error('Account needs verification. Contact administrator.');
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

  const handleSuccessfulLogin = async (userId: string) => {
    try {
      console.log("Processing successful login for user:", userId);
      
      // Fetch user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Error loading user profile");
        return;
      }

      if (!profile) {
        console.error("No profile found for user:", userId);
        toast.error("User profile not found");
        return;
      }

      console.log("User profile loaded:", profile);

      // Check user status
      if (profile.status !== 'active') {
        toast.error("Your account is pending approval. Please wait for admin approval.");
        await supabase.auth.signOut();
        return;
      }

      // Check if password has expired or must be changed
      const { data: isExpired } = await supabase.rpc('is_password_expired', { 
        user_id_param: userId 
      });
      
      if (isExpired || profile.must_change_password || profile.force_password_change) {
        console.log("Password expired or change required");
        toast.info("Your password has expired or must be changed. Please set a new password.");
        navigate('/change-password');
        return;
      }

      // Store user data in localStorage for compatibility
      const userData = {
        email: profile.email,
        role: profile.role,
        isAuthenticated: true,
        loginType: 'supabase',
        profile: profile
      };
      
      localStorage.setItem(`user_${profile.email}`, JSON.stringify(userData));
      localStorage.setItem('currentUser', profile.email);
      
      console.log("User data stored, navigating to dashboard");
      toast.success("Login successful!");
      
      // Navigate based on role
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
      console.error("Error in handleSuccessfulLogin:", error);
      toast.error("Error processing login");
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
    setShowOTPLogin(false);
    setShowForgotPassword(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setIsFirstTimeLogin(false);
    setShowOTPLogin(false);
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
    showForgotPassword,
    handlePasswordCreation,
    handleLogin,
    handleBackToLogin,
    handleForgotPassword,
    handleOTPSuccess,
    handleBackFromOTP,
    handleSuccessfulLogin,
    isAdminEmail,
    isLoading
  };
};
