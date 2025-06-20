
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import PasswordCreationForm from "@/components/auth/PasswordCreationForm";
import Footer from "@/components/Footer";
import { useAuthLogic } from "@/hooks/useAuthLogic";

export default function Index() {
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
              Administrative Access Portal
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
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Authorized administrators only • System access restricted
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
