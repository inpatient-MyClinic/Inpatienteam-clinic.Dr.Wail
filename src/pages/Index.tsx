
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
        <div className="flex gap-6 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate("/role-selection")}
            className="bg-blue-600 hover:bg-blue-700 px-10 py-4 text-lg font-semibold"
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/login")}
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-10 py-4 text-lg font-semibold"
          >
            Demo Login
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
          Comprehensive Healthcare Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="mb-6">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Healthcare Workflow?</h3>
          <p className="text-xl mb-10 text-blue-100 leading-relaxed">
            Join healthcare institutions already using My Clinic to improve patient care and operational efficiency.
          </p>
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => navigate("/role-selection")}
            className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold"
          >
            Start Your Journey
          </Button>
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
    </div>
  );
};

export default Index;
