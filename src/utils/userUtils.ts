
export const validateEmail = (email: string) => {
  const adminEmails = [
    "admin@myclinic.com.sa",
    "wail.ahmed@myclinic.com.sa",
    "inpatienteam@myclinic.com.sa"
  ];
  
  const cleanEmail = email.toLowerCase().trim();
  console.log("=== EMAIL VALIDATION DEBUG ===");
  console.log("Original email:", email);
  console.log("Cleaned email:", cleanEmail);
  console.log("Is admin email:", adminEmails.includes(cleanEmail));
  console.log("Ends with @myclinic.com.sa:", cleanEmail.endsWith('@myclinic.com.sa'));
  console.log("Email length:", cleanEmail.length);
  console.log("Domain part:", cleanEmail.split('@')[1]);
  
  // Check for common issues
  if (cleanEmail.includes(' ')) {
    console.log("WARNING: Email contains spaces");
  }
  if (cleanEmail !== email) {
    console.log("WARNING: Email was modified during cleaning");
  }
  
  // Allow admin emails or any email with @myclinic.com.sa domain
  const isValid = adminEmails.includes(cleanEmail) || cleanEmail.endsWith('@myclinic.com.sa');
  console.log("Final validation result:", isValid);
  console.log("=== END EMAIL VALIDATION DEBUG ===");
  return isValid;
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
    "admin@myclinic.com.sa",
    "wail.ahmed@myclinic.com.sa",
    "inpatienteam@myclinic.com.sa"
  ];
  
  console.log("Checking role for email:", email);
  
  // First check if it's an admin email - FORCE ADMIN ROLE
  if (adminEmails.includes(email.toLowerCase().trim())) {
    console.log("User identified as admin - FORCING ADMIN ROLE");
    return "admin";
  }
  
  // Check if user exists in localStorage with a specific role (user management)
  const userData = localStorage.getItem(`user_${email.toLowerCase().trim()}`);
  if (userData) {
    const user = JSON.parse(userData);
    console.log("User found in user management with role:", user.role);
    return user.role;
  }
  
  // Default to nurse for any other user not in user management
  console.log("User not found in user management, defaulting to nurse role");
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
