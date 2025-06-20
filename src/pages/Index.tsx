import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const companyEmailRegex = /^[a-zA-Z0-9._%+-]+@myclinic\.com\.sa$/;
    const allowedPersonalEmail = "inpatienteam@gmail.com";
    
    return companyEmailRegex.test(email) || email === allowedPersonalEmail;
  };

  const extractUserName = (email: string) => {
    if (email === "inpatienteam@gmail.com") {
      return "Inpatient Team";
    }
    
    const emailParts = email.split('@')[0];
    const nameParts = emailParts.split('.');
    
    if (nameParts.length >= 2) {
      const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
      const lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase();
      return `${firstName} ${lastName}`;
    }
    
    return emailParts.charAt(0).toUpperCase() + emailParts.slice(1).toLowerCase();
  };

  const getUserRole = (email: string) => {
    const adminEmails = [
      "wail.ahmed@myclinic.com.sa",
      "inpatienteam@gmail.com",
      "admin@myclinic.com.sa"
    ];
    
    console.log("Checking role for email:", email);
    
    if (adminEmails.includes(email)) {
      console.log("User identified as admin");
      return "admin";
    }
    
    if (email.includes("doctor")) {
      return "doctor";
    } else if (email.includes("hospital")) {
      return "hospital";
    } else if (email.includes("coordinator")) {
      return "case-coordinator";
    } else if (email.includes("finance")) {
      return "finance";
    } else if (email.includes("customer")) {
      return "customer-care";
    }
    
    console.log("User identified as nurse (default)");
    return "nurse";
  };

  const redirectToUserDashboard = (userRole: string) => {
    console.log("Redirecting user with role:", userRole);
    switch (userRole) {
      case "admin":
        navigate("/admin");
        break;
      case "doctor":
        navigate("/doctor-dashboard");
        break;
      case "hospital":
        navigate("/hospital-dashboard");
        break;
      case "case-coordinator":
        navigate("/case-coordinator-dashboard");
        break;
      case "finance":
        navigate("/finance-dashboard");
        break;
      case "customer-care":
        navigate("/customer-care-dashboard");
        break;
      default:
        navigate("/nurse-dashboard");
        break;
    }
  };

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

    console.log("User data stored, redirecting...");

    toast({
      title: "Account Created Successfully",
      description: `Welcome ${userName}! Redirecting to your dashboard...`,
    });

    setTimeout(() => {
      redirectToUserDashboard(userRole);
    }, 1000);
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
        description: "Please use your company email (@myclinic.com.sa) or the authorized email (inpatienteam@gmail.com)",
        variant: "destructive",
      });
      return;
    }

    const userExists = localStorage.getItem(`user_${normalizedEmail}`);
    console.log("User exists check:", !!userExists);
    
    if (!userExists) {
      console.log("First time login detected");
      setIsFirstTimeLogin(true);
      setEmail(normalizedEmail); // Make sure the email is normalized
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

    const userRole = getUserRole(normalizedEmail);
    const userName = extractUserName(normalizedEmail);
    
    console.log("Login successful, role:", userRole, "name:", userName);

    toast({
      title: "Login Successful",
      description: `Welcome back, ${userName}!`,
    });
    
    setTimeout(() => {
      redirectToUserDashboard(userRole);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 bg-blue-600 rounded-lg p-4">
              <img 
                src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
                alt="My Clinic Logo" 
                className="h-12 w-auto mx-auto filter brightness-0 invert"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-white bg-blue-600 py-2 px-4 rounded-lg mx-auto inline-block">My Clinic In-Patient</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Referral System - Staff Access
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isFirstTimeLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@myclinic.com.sa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Use your company email (@myclinic.com.sa) or inpatienteam@gmail.com
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
                  Sign In
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordCreation} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Welcome to My Clinic!
                  </h3>
                  <p className="text-sm text-blue-700">
                    Please create your password to access the system.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Create Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
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
                  Create Password & Access System
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsFirstTimeLogin(false);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Back to Login
                </Button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Authorized staff only • Company email required
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8 py-4">
          <p className="text-gray-500 text-sm">Created by Dr. Wail Ahmed @ My Clinic</p>
        </div>
      </div>
    </div>
  );
}
