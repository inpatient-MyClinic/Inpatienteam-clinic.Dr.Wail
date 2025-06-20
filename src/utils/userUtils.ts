
export const validateEmail = (email: string) => {
  const adminEmails = [
    "wail.ahmed@myclinic.com.sa",
    "inpatienteam@gmail.com",
    "admin@myclinic.com.sa"
  ];
  
  return adminEmails.includes(email.toLowerCase().trim());
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
  
  // Fallback for any other admin emails
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
  
  if (adminEmails.includes(email)) {
    console.log("User identified as admin");
    return "admin";
  }
  
  // Non-admin users are not allowed
  console.log("User not authorized - not an admin");
  return null;
};

export const redirectToUserDashboard = (userRole: string, navigate: (path: string) => void) => {
  console.log("Redirecting user with role:", userRole);
  if (userRole === "admin") {
    console.log("Navigating to /admin");
    navigate("/admin");
  } else {
    console.log("Unauthorized access attempt");
    navigate("/");
  }
};
