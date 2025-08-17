
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import { EnvironmentBanner } from "@/components/auth/EnvironmentBanner";
import { AuthHealthCheck } from "@/components/auth/AuthHealthCheck";
import { NewLoginForm } from "@/components/auth/NewLoginForm";
import { InviteLink } from "@/components/auth/InviteLink";

import { QATestRunner } from "@/components/auth/QATestRunner";

const Login = () => {
  const navigate = useNavigate();

  // Check for authenticated user and redirect
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/admin', { replace: true });
      }
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/admin', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex">
      {/* Left Column - Health Check */}
      <div className="w-1/3 p-6 border-r bg-muted/30">
        <EnvironmentBanner />
        <AuthHealthCheck />
        <QATestRunner />
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
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

            <NewLoginForm />
            <InviteLink />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Login;
