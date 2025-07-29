
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { validateEmail, extractUserName, getUserRole, redirectToUserDashboard, isUserAuthorized } from "@/utils/userUtils";
import { isAdmin } from "@/utils/auth";
import { LoginAttemptService } from "@/services/loginAttemptService";

export const useAuthLogic = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePasswordCreation = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== PASSWORD CREATION ATTEMPT ===");
    console.log("Email used:", email);
    
    // Validate email domain FIRST
    const emailIsValid = validateEmail(email);
    console.log("Email validation result in password creation:", emailIsValid);
    
    if (!emailIsValid) {
      console.log("PASSWORD CREATION BLOCKED: Invalid email domain");
      toast({
        title: "غير مصرح بالدخول",
        description: "الدخول مقتصر على عناوين البريد الإلكتروني @myclinic.com.sa فقط. يرجى التواصل مع مدير النظام.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user is authorized (exists in user management)
    const userAuthorized = isUserAuthorized(email);
    console.log("User authorization check:", userAuthorized);
    
    if (!userAuthorized) {
      console.log("PASSWORD CREATION BLOCKED: User not authorized - not in user management");
      
      // Create a notification for admin
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const newNotification = {
        id: Date.now().toString(),
        type: 'user_access_request',
        title: 'طلب وصول مستخدم جديد',
        message: `المستخدم ${email} يطلب الوصول إلى النظام`,
        email: email,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high'
      };
      notifications.push(newNotification);
      localStorage.setItem('notifications', JSON.stringify(notifications));
      
      toast({
        title: "طلب وصول مرسل",
        description: "تم إرسال طلب وصولك إلى مدير النظام. سيتم التواصل معك قريباً.",
        variant: "default",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "كلمة المرور قصيرة جداً",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "كلمات المرور غير متطابقة",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    // Get user role - admin emails get admin role, others get their assigned role
    const userRole = getUserRole(email);
    console.log("Password creation - determined role:", userRole, "for email:", email);
    
    if (!userRole) {
      console.log("PASSWORD CREATION BLOCKED: Unable to determine user role");
      toast({
        title: "خطأ في تحديد الصلاحيات",
        description: "غير قادر على تحديد صلاحيات المستخدم. يرجى التواصل مع مدير النظام.",
        variant: "destructive",
      });
      return;
    }
    
    const userName = extractUserName(email);

    // Store user data with correct role
    localStorage.setItem(`user_${email}`, JSON.stringify({
      email,
      name: userName,
      role: userRole,
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem(`password_${email}`, password);
    localStorage.setItem(`lastPasswordUpdate_${email}`, new Date().toISOString());

    console.log("User data stored with role:", userRole);

    toast({
      title: "تم إنشاء الحساب بنجاح",
      description: `مرحباً ${userName}! جاري التوجيه إلى لوحة التحكم...`,
    });

    // CRITICAL: Force immediate redirect for admin users
    if (userRole === "admin") {
      console.log("ADMIN USER - Redirecting to /admin immediately");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } else {
      setTimeout(() => {
        redirectToUserDashboard(userRole, navigate);
      }, 500);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Email used:", email);
    console.log("Password length:", password.length);
    
    if (!email || !password) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("Normalized email:", normalizedEmail);
    console.log("Email domain check:", normalizedEmail.split('@')[1]);
    
    const emailIsValid = validateEmail(normalizedEmail);
    console.log("Email validation result in login:", emailIsValid);
    
    if (!emailIsValid) {
      console.log("LOGIN BLOCKED: Invalid email domain");
      console.log("Email used:", normalizedEmail);
      console.log("Expected domain: @myclinic.com.sa");
      toast({
        title: "خطأ في البريد الإلكتروني",
        description: `البريد الإلكتروني: ${normalizedEmail} غير مصرح له بالدخول. يجب أن ينتهي البريد بـ @myclinic.com.sa`,
        variant: "destructive",
      });
      return;
    }

    // Check if user is authorized BEFORE checking password
    const userAuthorized = isUserAuthorized(normalizedEmail);
    console.log("User authorization check for login:", userAuthorized);
    
    if (!userAuthorized) {
      console.log("LOGIN BLOCKED: User not authorized - not in user management");
      
      // Log the unauthorized login attempt
      LoginAttemptService.addLoginAttempt(normalizedEmail);
      
      toast({
        title: "غير مصرح بالدخول",
        description: "تم إرسال طلب وصولك إلى مدير النظام للمراجعة.",
        variant: "destructive",
      });
      return;
    }

    // Check if password exists for this user
    const savedPassword = localStorage.getItem(`password_${normalizedEmail}`);
    console.log("Saved password exists:", !!savedPassword);
    
    if (!savedPassword) {
      console.log("No password found - showing password creation form");
      setIsFirstTimeLogin(true);
      setEmail(normalizedEmail);
      toast({
        title: "أول تسجيل دخول",
        description: "يرجى إنشاء كلمة المرور للدخول إلى النظام.",
      });
      return;
    }

    // Check if password matches
    console.log("Password check:", password === savedPassword);
    
    if (savedPassword !== password) {
      console.log("LOGIN FAILED: Incorrect password");
      toast({
        title: "كلمة مرور خاطئة",
        description: "يرجى التحقق من كلمة المرور والمحاولة مرة أخرى",
        variant: "destructive",
      });
      return;
    }

    // Get user role - admin emails get admin role, others get their assigned role
    const userRole = getUserRole(normalizedEmail);
    console.log("Login successful - determined role:", userRole, "for email:", normalizedEmail);
    
    if (!userRole) {
      console.log("LOGIN BLOCKED: Unable to determine user role");
      toast({
        title: "خطأ في تحديد الصلاحيات",
        description: "غير قادر على تحديد صلاحيات المستخدم. يرجى التواصل مع مدير النظام.",
        variant: "destructive",
      });
      return;
    }
    
    // FORCE UPDATE stored user data to ensure role is correct
    const userName = extractUserName(normalizedEmail);
    localStorage.setItem(`user_${normalizedEmail}`, JSON.stringify({
      email: normalizedEmail,
      name: userName,
      role: userRole,
      createdAt: new Date().toISOString()
    }));
    console.log("Updated user data in localStorage with role:", userRole);

    toast({
      title: "تم تسجيل الدخول بنجاح",
      description: `مرحباً بعودتك، ${userName}!`,
    });

    // CRITICAL: Force immediate redirect for admin users using window.location
    if (userRole === "admin") {
      console.log("ADMIN USER DETECTED - Using window.location to force redirect to /admin");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 500);
    } else {
      console.log("Non-admin user - using normal navigation");
      setTimeout(() => {
        redirectToUserDashboard(userRole, navigate);
      }, 500);
    }
  };

  const handleBackToLogin = () => {
    setIsFirstTimeLogin(false);
    setPassword("");
    setConfirmPassword("");
  };

  return {
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
  };
};
