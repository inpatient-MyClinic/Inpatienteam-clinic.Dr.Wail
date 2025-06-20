
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { validateEmail, extractUserName, getUserRole, redirectToUserDashboard } from "@/utils/userUtils";

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

    const userRole = getUserRole(email);
    
    if (!userRole) {
      toast({
        title: "Unauthorized Access",
        description: "Only authorized administrators can access this system",
        variant: "destructive",
      });
      return;
    }

    const userName = extractUserName(email);

    // Store user data
    localStorage.setItem(`user_${email}`, JSON.stringify({
      email,
      name: userName,
      role: userRole,
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem(`password_${email}`, password);
    localStorage.setItem(`lastPasswordUpdate_${email}`, new Date().toISOString());

    console.log("Admin user data stored, redirecting...");

    toast({
      title: "Account Created Successfully",
      description: `Welcome ${userName}! Redirecting to admin dashboard...`,
    });

    setTimeout(() => {
      redirectToUserDashboard(userRole, navigate);
    }, 500);
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
        title: "Unauthorized Access",
        description: "Only authorized administrators can access this system. Please contact system administrator.",
        variant: "destructive",
      });
      return;
    }

    const userExists = localStorage.getItem(`user_${normalizedEmail}`);
    console.log("User exists check:", !!userExists);
    
    if (!userExists) {
      console.log("First time admin login detected");
      setIsFirstTimeLogin(true);
      setEmail(normalizedEmail);
      toast({
        title: "First Time Login",
        description: "Please create your admin password to access the system.",
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

    const userRole = getUserRole(normalizedEmail);
    
    if (!userRole) {
      toast({
        title: "Unauthorized Access",
        description: "Access denied. Only administrators are allowed.",
        variant: "destructive",
      });
      return;
    }

    const userName = extractUserName(normalizedEmail);
    
    console.log("Admin login successful, role:", userRole, "name:", userName);

    redirectToUserDashboard(userRole, navigate);
    
    toast({
      title: "Login Successful",
      description: `Welcome back, ${userName}!`,
    });
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
