
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    
    // Simulate authentication
    setTimeout(() => {
      setSubmitting(false);
      // Redirect based on email domain or default to admin
      if (email.includes("admin")) {
        navigate("/admin");
      } else if (email.includes("doctor")) {
        navigate("/doctor-dashboard");
      } else if (email.includes("nurse")) {
        navigate("/nurse-dashboard");
      } else if (email.includes("hospital")) {
        navigate("/hospital-dashboard");
      } else if (email.includes("coordinator")) {
        navigate("/case-coordinator-dashboard");
      } else if (email.includes("finance")) {
        navigate("/finance-dashboard");
      } else if (email.includes("customer")) {
        navigate("/customer-care-dashboard");
      } else {
        navigate("/role-selection");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
            alt="My Clinic Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-blue-900">My Clinic – In-patient</h1>
          <p className="text-blue-700 text-sm">Surgical Case Management System</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-blue-900">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 mb-4">Demo Accounts:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Admin</p>
                    <p className="text-gray-600">admin@clinic.com</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Doctor</p>
                    <p className="text-gray-600">doctor@clinic.com</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Nurse</p>
                    <p className="text-gray-600">nurse@clinic.com</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="font-medium">Hospital</p>
                    <p className="text-gray-600">hospital@clinic.com</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mx-auto text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
