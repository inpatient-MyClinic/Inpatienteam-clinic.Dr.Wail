
import React from "react";
import Footer from "@/components/Footer";
import MessagingIcons from "@/components/messaging/MessagingIcons";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyRequests = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
              alt="My Clinic Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
              <p className="text-gray-600">View and manage your requests</p>
            </div>
          </div>
          <div className="flex gap-2">
            <MessagingIcons currentUserRole="user" />
            <Button 
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-3xl font-bold mb-4 text-blue-900">My Requests</h1>
        <p className="text-gray-600">Table view of requests, filters, actions (placeholder)</p>
      </div>
      <Footer />
    </div>
  );
};

export default MyRequests;
