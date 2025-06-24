
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { validateEmail, extractUserName, getUserRole, redirectToUserDashboard } from "@/utils/userUtils";
import { isAdmin } from "@/utils/auth";

export const useAuthLogic = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePasswordCreation = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Creating password for:", email);
    
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Get user role - admin emails get admin role, others get their assigned role or default to nurse
    const userRole = getUserRole(email);
    console.log("Password creation - determined role:", userRole, "for email:", email);
    
    const userName = extractUserName(email);

    // Store user data with correct role
    localStorage.setItem(`user_${email}`, JSON.stringify({
      email,
      name: userName,
      role: userRole,
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem(`password_${email}`, password);
    localStorage.setItem(`lastPasswordUpdate_${email}`, new Date().toISOString());

    console.log("User data stored with role:", userRole);

    toast({
      title: "Account Created Successfully",
      description: `Welcome ${userName}! Redirecting to your dashboard...`,
    });

    // CRITICAL: Force immediate redirect for admin users
    if (userRole === "admin") {
      console.log("ADMIN USER - Redirecting to /admin immediately");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } else {
      setTimeout(() => {
        redirectToUserDashboard(userRole, navigate);
      }, 500);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Login attempt with email:", email);
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    if (!validateEmail(normalizedEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    const userExists = localStorage.getItem(`user_${normalizedEmail}`);
    console.log("User exists check:", !!userExists);
    
    if (!userExists) {
      console.log("First time login detected");
      setIsFirstTimeLogin(true);
      setEmail(normalizedEmail);
      toast({
        title: "First Time Login",
        description: "Please create your password to access the system.",
      });
      return;
    }

    const savedPassword = localStorage.getItem(`password_${normalizedEmail}`);
    console.log("Password check:", password === savedPassword);
    
    if (savedPassword !== password) {
      toast({
        title: "Incorrect Password",
        description: "Please check your password and try again",
        variant: "destructive",
      });
      return;
    }

    // Get user role - admin emails get admin role, others get their assigned role or default to nurse
    const userRole = getUserRole(normalizedEmail);
    console.log("Login successful - determined role:", userRole, "for email:", normalizedEmail);
    
    // FORCE UPDATE stored user data to ensure role is correct
    const userName = extractUserName(normalizedEmail);
    localStorage.setItem(`user_${normalizedEmail}`, JSON.stringify({
      email: normalizedEmail,
      name: userName,
      role: userRole,
      createdAt: new Date().toISOString()
    }));
    console.log("Updated user data in localStorage with role:", userRole);

    toast({
      title: "Login Successful",
      description: `Welcome back, ${userName}!`,
    });

    // CRITICAL: Force immediate redirect for admin users using window.location
    if (userRole === "admin") {
      console.log("ADMIN USER DETECTED - Using window.location to force redirect to /admin");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } else {
      console.log("Non-admin user - using normal navigation");
      setTimeout(() => {
        redirectToUserDashboard(userRole, navigate);
      }, 500);
    }
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
    handlePasswordCreation,
    handleLogin,
    handleBackToLogin
  };
};
