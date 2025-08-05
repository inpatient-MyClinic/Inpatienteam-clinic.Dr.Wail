
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import PasswordCreationForm from "@/components/auth/PasswordCreationForm";
import OTPLoginForm from "@/components/auth/OTPLoginForm";
import Footer from "@/components/Footer";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { getCurrentUserRole } from "@/utils/auth";

const Login = () => {
  const navigate = useNavigate();
  const currentUserRole = getCurrentUserRole();
  
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
    showOTPLogin,
    handlePasswordCreation,
    handleLogin,
    handleBackToLogin,
    handleOTPSuccess,
    handleBackFromOTP,
    handleSuccessfulLogin
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

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-900">
                {showOTPLogin ? "Enter Verification Code" : (!isFirstTimeLogin ? "Login" : "Create Admin Password")}
              </CardTitle>
              <CardDescription>
                {showOTPLogin 
                  ? `We sent a 4-digit code to ${email}`
                  : (!isFirstTimeLogin 
                    ? "Sign in with your authorized administrator account" 
                    : "Set up your password for first-time access")
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showOTPLogin ? (
                <OTPLoginForm
                  email={email}
                  onSuccess={handleOTPSuccess}
                  onBack={handleBackFromOTP}
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

              {/* Authentication Mode Display */}
              <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Authentication Mode:</span>
                  <span className={`font-medium ${localStorage.getItem('otpEnabled') !== 'false' ? 'text-blue-600' : 'text-green-600'}`}>
                    {localStorage.getItem('otpEnabled') !== 'false' ? 'OTP Required' : 'Direct Login'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {localStorage.getItem('otpEnabled') !== 'false' 
                    ? 'Users will receive OTP codes via email' 
                    : 'Users can login directly with email only'
                  }
                </div>
              </div>

              {/* OTP Debug Status */}
              {showOTPLogin && (
                <div className="mt-2 p-2 bg-green-100 rounded text-green-800 text-sm">
                  ✅ <strong>OTP Form Active</strong> - Check console for debug OTP code
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Access Restriction</p>
                    <p className="text-sm text-blue-700">
                      Only users with authorized email addresses are allowed to access
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Unauthorized access attempts are logged and monitored
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
