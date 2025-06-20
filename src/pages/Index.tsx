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
  const [isPasswordExpired, setIsPasswordExpired] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const companyEmailRegex = /^[a-zA-Z0-9._%+-]+@myclinic\.com\.sa$/;
    const allowedPersonalEmail = "inpatienteam@gmail.com";
    
    return companyEmailRegex.test(email) || email === allowedPersonalEmail;
  };

  const extractUserName = (email: string) => {
    // Handle the special personal email case
    if (email === "inpatienteam@gmail.com") {
      return "Inpatient Team";
    }
    
    // Extract name from company email format (firstname.lastname@myclinic.com.sa)
    const emailParts = email.split('@')[0]; // Get part before @
    const nameParts = emailParts.split('.'); // Split by dots
    
    if (nameParts.length >= 2) {
      // Capitalize first letter of each name part
      const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
      const lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase();
      return `${firstName} ${lastName}`;
    }
    
    // Fallback if email doesn't follow expected format
    return emailParts.charAt(0).toUpperCase() + emailParts.slice(1).toLowerCase();
  };

  const getUserRole = (email: string) => {
    // Admin emails
    const adminEmails = [
      "wail.ahmed@myclinic.com.sa",
      "inpatienteam@gmail.com",
      "admin@myclinic.com.sa"
    ];
    
    console.log("Checking role for email:", email);
    
    // Check if email is admin
    if (adminEmails.includes(email)) {
      console.log("User identified as admin");
      return "admin";
    }
    
    // Determine role based on email pattern or default assignment
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
    
    // Default to nurse for all other users
    console.log("User identified as nurse (default)");
    return "nurse";
  };

  const checkPasswordExpiry = (email: string) => {
    // Simulate checking if password needs update (every 3 months)
    const lastPasswordUpdate = localStorage.getItem(`lastPasswordUpdate_${email}`);
    if (!lastPasswordUpdate) {
      return true; // First time login
    }
    
    const lastUpdate = new Date(lastPasswordUpdate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return lastUpdate < threeMonthsAgo;
  };

  const handleEmailCheck = () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please use your company email address ending with @myclinic.com.sa or the authorized personal email",
        variant: "destructive",
      });
      return;
    }

    // Check if user exists and password status
    const userExists = localStorage.getItem(`user_${email}`);
    const passwordExpired = checkPasswordExpiry(email);

    if (!userExists) {
      setIsFirstTimeLogin(true);
      toast({
        title: "Welcome!",
        description: "First time login detected. Please create your password.",
      });
    } else if (passwordExpired) {
      setIsPasswordExpired(true);
      toast({
        title: "Password Update Required",
        description: "Your password has expired. Please create a new password.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordCreation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
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

    // Save user with extracted name and password update timestamp
    localStorage.setItem(`user_${email}`, JSON.stringify({
      email,
      name: userName,
      role: userRole,
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem(`password_${email}`, password);
    localStorage.setItem(`lastPasswordUpdate_${email}`, new Date().toISOString());

    toast({
      title: "Password Created Successfully",
      description: `Welcome ${userName}! Redirecting to your dashboard...`,
    });

    // Redirect based on role - users only see their own dashboard
    redirectToUserDashboard(userRole);
  };

  const redirectToUserDashboard = (userRole: string) => {
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
      default: // nurse
        navigate("/nurse-dashboard");
        break;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please use your company email address ending with @myclinic.com.sa or the authorized personal email",
        variant: "destructive",
      });
      return;
    }

    const savedPassword = localStorage.getItem(`password_${email}`);
    const userExists = localStorage.getItem(`user_${email}`);

    if (!userExists || savedPassword !== password) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return;
    }

    // Check if password needs update
    if (checkPasswordExpiry(email)) {
      setIsPasswordExpired(true);
      toast({
        title: "Password Update Required",
        description: "Your password has expired. Please create a new password.",
        variant: "destructive",
      });
      return;
    }

    const userRole = getUserRole(email);
    const userName = extractUserName(email);
    
    console.log("Final user role:", userRole);
    console.log("User name:", userName);

    toast({
      title: "Login Successful",
      description: `Welcome back, ${userName}!`,
    });
    
    // Redirect to user's specific dashboard
    redirectToUserDashboard(userRole);
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
            {!isFirstTimeLogin && !isPasswordExpired ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yourname@myclinic.com.sa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailCheck}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Use your company email ending with @myclinic.com.sa
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
                    {isFirstTimeLogin ? "Welcome to My Clinic!" : "Password Update Required"}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {isFirstTimeLogin 
                      ? "Please create your password to access the system." 
                      : "Your password has expired. Please create a new password for security."}
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
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Create a new password (min 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  {isFirstTimeLogin ? "Create Password & Access System" : "Update Password"}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsFirstTimeLogin(false);
                    setIsPasswordExpired(false);
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
                Company email required • Password updates every 3 months
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
