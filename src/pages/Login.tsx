
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import PasswordCreationForm from "@/components/auth/PasswordCreationForm";
import Footer from "@/components/Footer";
import { useAuthLogic } from "@/hooks/useAuthLogic";

const Login = () => {
  const {
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
  } = useAuthLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
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
              <CardTitle className="text-2xl text-blue-900">
                {!isFirstTimeLogin ? "Administrator Login" : "Create Admin Password"}
              </CardTitle>
              <CardDescription>
                {!isFirstTimeLogin 
                  ? "Sign in with your authorized administrator account" 
                  : "Set up your password for first-time access"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isFirstTimeLogin ? (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  rememberMe={rememberMe}
                  setRememberMe={setRememberMe}
                  onSubmit={handleLogin}
                />
              ) : (
                <PasswordCreationForm
                  email={email}
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  onSubmit={handlePasswordCreation}
                  onBackToLogin={handleBackToLogin}
                />
              )}

              <div className="mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Authorized Administrator Emails:</p>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="bg-gray-50 p-2 rounded">
                      <p>admin@myclinic.com.sa</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p>wail.ahmed@myclinic.com.sa</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p>inpatienteam@gmail.com</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Only authorized administrators can access this system
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
