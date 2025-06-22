
export const validateEmail = (email: string) => {
  const adminEmails = [
    "wail.ahmed@myclinic.com.sa",
    "inpatienteam@gmail.com",
    "admin@myclinic.com.sa"
  ];
  
  return adminEmails.includes(email.toLowerCase().trim()) || isRegisteredUser(email);
};

export const isRegisteredUser = (email: string) => {
  const userData = localStorage.getItem(`user_${email.toLowerCase().trim()}`);
  return !!userData;
};

export const extractUserName = (email: string) => {
  if (email === "inpatienteam@gmail.com") {
    return "Inpatient Team";
  }
  
  if (email === "wail.ahmed@myclinic.com.sa") {
    return "Dr. Wail Ahmed";
  }
  
  if (email === "admin@myclinic.com.sa") {
    return "System Administrator";
  }
  
  // For other users, extract from email or use stored name
  const userData = localStorage.getItem(`user_${email.toLowerCase().trim()}`);
  if (userData) {
    const user = JSON.parse(userData);
    return user.name || email.split('@')[0];
  }
  
  // Fallback for any other emails
  const emailParts = email.split('@')[0];
  const nameParts = emailParts.split('.');
  
  if (nameParts.length >= 2) {
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    const lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase();
    return `${firstName} ${lastName}`;
  }
  
  return emailParts.charAt(0).toUpperCase() + emailParts.slice(1).toLowerCase();
};

export const getUserRole = (email: string) => {
  const adminEmails = [
    "wail.ahmed@myclinic.com.sa",
    "inpatienteam@gmail.com",
    "admin@myclinic.com.sa"
  ];
  
  console.log("Checking role for email:", email);
  
  // First check if it's an admin email - THIS IS THE FIX
  if (adminEmails.includes(email.toLowerCase().trim())) {
    console.log("User identified as admin - FORCING ADMIN ROLE");
    return "admin";
  }
  
  // Check if user exists in localStorage with a specific role
  const userData = localStorage.getItem(`user_${email.toLowerCase().trim()}`);
  if (userData) {
    const user = JSON.parse(userData);
    console.log("User found with role:", user.role);
    // Even if stored role is different, admin emails should always be admin
    if (adminEmails.includes(email.toLowerCase().trim())) {
      console.log("Overriding stored role to admin for admin email");
      return "admin";
    }
    return user.role;
  }
  
  console.log("User defaulted to nurse role");
  return "nurse";
};

export const redirectToUserDashboard = (userRole: string, navigate: (path: string) => void) => {
  console.log("Redirecting user with role:", userRole);
  
  // ENSURE ADMIN ALWAYS GOES TO ADMIN DASHBOARD
  if (userRole === "admin") {
    console.log("ADMIN DETECTED - Navigating to /admin");
    navigate("/admin");
    return;
  }
  
  switch (userRole) {
    case "doctor":
      console.log("Navigating to /doctor-dashboard");
      navigate("/doctor-dashboard");
      break;
    case "case-coordinator":
      console.log("Navigating to /case-coordinator-dashboard");
      navigate("/case-coordinator-dashboard");
      break;
    case "hospital":
      console.log("Navigating to /hospital-dashboard");
      navigate("/hospital-dashboard");
      break;
    case "finance":
      console.log("Navigating to /finance-dashboard");
      navigate("/finance-dashboard");
      break;
    case "customer-care":
      console.log("Navigating to /customer-care-dashboard");
      navigate("/customer-care-dashboard");
      break;
    case "nurse":
    default:
      console.log("Navigating to /nurse-dashboard");
      navigate("/nurse-dashboard");
      break;
  }
};

// Audit Trail Functions
export const logAuditTrail = (requestId: string, action: string, details: any, userEmail: string) => {
  const auditEntry = {
    id: Date.now().toString(),
    requestId,
    action,
    details,
    userEmail,
    userName: extractUserName(userEmail),
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  };
  
  const existingAudit = localStorage.getItem('audit_trail') || '[]';
  const auditTrail = JSON.parse(existingAudit);
  auditTrail.push(auditEntry);
  
  localStorage.setItem('audit_trail', JSON.stringify(auditTrail));
  console.log('Audit trail logged:', auditEntry);
};

export const getAuditTrail = (requestId?: string) => {
  const auditTrail = JSON.parse(localStorage.getItem('audit_trail') || '[]');
  
  if (requestId) {
    return auditTrail.filter((entry: any) => entry.requestId === requestId);
  }
  
  return auditTrail;
};

export const getFullAuditReport = () => {
  return JSON.parse(localStorage.getItem('audit_trail') || '[]');
};
