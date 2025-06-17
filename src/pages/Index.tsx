
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Hospital, UserCheck, Shield, TrendingUp, HeartHandshake } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Multi-Role Access",
      description: "Dedicated dashboards for doctors, nurses, hospitals, and coordinators"
    },
    {
      icon: <Hospital className="w-8 h-8 text-blue-600" />,
      title: "Hospital Integration",
      description: "Seamless workflow management across healthcare institutions"
    },
    {
      icon: <UserCheck className="w-8 h-8 text-blue-600" />,
      title: "Patient Care Focus",
      description: "Streamlined surgical case management for better outcomes"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Secure Platform",
      description: "HIPAA-compliant data handling and user authentication"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: "Analytics & Insights",
      description: "Real-time reporting and performance metrics"
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-blue-600" />,
      title: "Customer Care",
      description: "Post-surgery follow-up and patient satisfaction tracking"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="w-full py-8 bg-white/80 backdrop-blur-sm shadow-sm">
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Revolutionizing <span className="text-blue-600">Surgical Care</span> Management
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          A comprehensive platform designed to streamline surgical case workflows, 
          enhance collaboration between healthcare professionals, and improve patient outcomes 
          across the entire care continuum.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate("/role-selection")}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/login")}
            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
          >
            Demo Login
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Comprehensive Healthcare Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Healthcare Workflow?</h3>
          <p className="text-xl mb-8 text-blue-100">
            Join healthcare institutions already using My Clinic to improve patient care and operational efficiency.
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => navigate("/role-selection")}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 My Clinic – In-patient. Surgical Case Management System.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
