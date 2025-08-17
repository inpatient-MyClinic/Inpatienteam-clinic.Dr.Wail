
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import PasswordCreationForm from "@/components/auth/PasswordCreationForm";
import OTPLoginForm from "@/components/auth/OTPLoginForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import AdminLoginBypass from "@/components/auth/AdminLoginBypass";
import Footer from "@/components/Footer";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { getCurrentUserRole } from "@/utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const currentUserRole = getCurrentUserRole();
  const [showAdminBypass, setShowAdminBypass] = React.useState(false);
  
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
    setIsFirstTimeLogin,
    showOTPLogin,
    showForgotPassword,
    handlePasswordCreation,
    handleLogin,
    handleBackToLogin,
    handleForgotPassword,
    handleOTPSuccess,
    handleBackFromOTP,
    handleSuccessfulLogin,
    isLoading
  } = useAuthLogic();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (currentUserRole) {
      console.log("Login: User already authenticated with role:", currentUserRole);
      switch (currentUserRole) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'nurse':
          navigate('/nurse-dashboard', { replace: true });
          break;
        case 'doctor':
          navigate('/doctor-dashboard', { replace: true });
          break;
        case 'hospital':
          navigate('/hospital-dashboard', { replace: true });
          break;
        case 'case-coordinator':
          navigate('/case-coordinator-dashboard', { replace: true });
          break;
        case 'finance':
          navigate('/finance-dashboard', { replace: true });
          break;
        case 'customer-care':
          navigate('/customer-care-dashboard', { replace: true });
          break;
        default:
          console.log("Login: Unknown role, staying on login page");
      }
    }
  }, [currentUserRole, navigate]);


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


          {showAdminBypass ? (
            <AdminLoginBypass
              onBackToLogin={() => setShowAdminBypass(false)}
            />
          ) : showOTPLogin ? (
            <OTPLoginForm
              email={email}
              onSuccess={handleOTPSuccess}
              onBack={handleBackFromOTP}
            />
          ) : (
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-blue-900">
                  {showForgotPassword ? "Reset Password" : !isFirstTimeLogin ? "Login" : "Create Account"}
                </CardTitle>
                <CardDescription>
                  {showForgotPassword 
                    ? "Enter your email to receive a password reset link"
                    : !isFirstTimeLogin 
                      ? "Sign in with your email and password" 
                      : "Set up your password for first-time access"}
                </CardDescription>
              </CardHeader>
            <CardContent>
              {showForgotPassword ? (
                <ForgotPasswordForm
                  onBackToLogin={handleBackToLogin}
                />
              ) : !isFirstTimeLogin ? (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  rememberMe={rememberMe}
                  setRememberMe={setRememberMe}
                  onSubmit={handleLogin}
                  onCreateAccount={() => setIsFirstTimeLogin(true)}
                  onForgotPassword={handleForgotPassword}
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
                  isAdminEmail={email.includes('admin') || email.includes('myclinic.com.sa')}
                />
              )}

              {!showForgotPassword && !showAdminBypass && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-green-900 mb-2">🔒 Secure Authentication</p>
                      <p className="text-sm text-green-700">
                        All users must create secure passwords that expire every 3 months
                      </p>
                    </div>
                    
                    {/* Admin Emergency Access */}
                    {(email.includes('admin@myclinic.com.sa') || email === 'admin@myclinic.com.sa') && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowAdminBypass(true)}
                          className="text-xs text-orange-600 hover:text-orange-800 underline"
                        >
                          🚨 Admin Emergency Access
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-4">
                      Passwords are encrypted and protected using industry standards
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
