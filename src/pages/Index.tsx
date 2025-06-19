
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Hospital, UserCheck, Shield, TrendingUp, HeartHandshake, Eye, EyeOff } from "lucide-react";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="w-full py-8 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
              alt="My Clinic Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold text-blue-900">My Clinic – In-patient</h1>
              <p className="text-blue-700 text-sm font-medium">Surgical Case Management System</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Revolutionizing <span className="text-blue-600">Surgical Care</span> Management
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          A comprehensive platform designed to streamline surgical case workflows, 
          enhance collaboration between healthcare professionals, and improve patient outcomes 
          across the entire care continuum.
        </p>
      </section>

      {/* Login Section */}
      <section className="max-w-2xl mx-auto px-4 py-20">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-blue-900">Sign In</CardTitle>
            <CardDescription>
              Access your healthcare management dashboard
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
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Healthcare Workflow?</h3>
          <p className="text-xl mb-10 text-blue-100 leading-relaxed">
            Join healthcare institutions already using My Clinic to improve patient care and operational efficiency.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
              alt="My Clinic Logo" 
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold">My Clinic – In-patient</span>
          </div>
          <p className="text-gray-400">
            © 2025 My Clinic – In-patient. Surgical Case Management System. All rights reserved.
          </p>
        </div>
      </footer>
      
      <Footer />
    </div>
  );
};

export default Index;
