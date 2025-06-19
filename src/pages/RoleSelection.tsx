import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  UserCog, 
  Stethoscope, 
  Heart, 
  Building2, 
  Users, 
  TrendingUp, 
  HeartHandshake,
  ArrowLeft
} from "lucide-react";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

const roles = [
  {
    id: "admin",
    title: "System Administrator",
    description: "Manage users, settings, and system configuration",
    icon: <UserCog className="w-8 h-8" />,
    path: "/admin",
    color: "bg-purple-500",
    features: ["User Management", "System Settings", "Analytics Overview"]
  },
  {
    id: "doctor",
    title: "Doctor",
    description: "Review requests and manage patient cases",
    icon: <Stethoscope className="w-8 h-8" />,
    path: "/doctor-dashboard",
    color: "bg-blue-500",
    features: ["Patient Cases", "Medical Reviews", "Treatment Plans"]
  },
  {
    id: "nurse",
    title: "Nurse",
    description: "Create and track patient requests",
    icon: <Heart className="w-8 h-8" />,
    path: "/nurse-dashboard",
    color: "bg-green-500",
    features: ["Request Creation", "Patient Monitoring", "Care Coordination"]
  },
  {
    id: "hospital",
    title: "Hospital Staff",
    description: "Manage hospital operations and approvals",
    icon: <Building2 className="w-8 h-8" />,
    path: "/hospital-dashboard",
    color: "bg-orange-500",
    features: ["Approval Workflow", "Resource Management", "Staff Coordination"]
  },
  {
    id: "coordinator",
    title: "Case Coordinator",
    description: "Coordinate between departments and track progress",
    icon: <Users className="w-8 h-8" />,
    path: "/case-coordinator-dashboard",
    color: "bg-cyan-500",
    features: ["Case Management", "Inter-department Communication", "Progress Tracking"]
  },
  {
    id: "finance",
    title: "Finance Department",
    description: "Handle billing, payments, and financial reporting",
    icon: <TrendingUp className="w-8 h-8" />,
    path: "/finance-dashboard",
    color: "bg-emerald-500",
    features: ["Revenue Tracking", "Financial Reports", "Billing Management"]
  },
  {
    id: "customer-care",
    title: "Customer Care",
    description: "Manage post-surgery follow-ups and patient satisfaction",
    icon: <HeartHandshake className="w-8 h-8" />,
    path: "/customer-care-dashboard",
    color: "bg-pink-500",
    features: ["Patient Follow-up", "Satisfaction Surveys", "Support Management"]
  }
];

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="w-full py-6 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" showText={false} />
            <div>
              <h1 className="text-2xl font-bold text-blue-900">My Clinic – In-patient</h1>
              <p className="text-blue-700 text-sm">Role Selection</p>
            </div>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Select Your Role
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access your personalized dashboard and tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Card 
              key={role.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:-translate-y-1"
              onClick={() => handleRoleSelect(role.path)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`${role.color} text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {role.icon}
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {role.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 mb-4">
                  {role.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => handleRoleSelect(role.path)}
                >
                  Access Dashboard
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Don't see your role? Contact your system administrator for access.
          </p>
          <Button 
            variant="outline"
            onClick={() => navigate("/login")}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Direct Login
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
