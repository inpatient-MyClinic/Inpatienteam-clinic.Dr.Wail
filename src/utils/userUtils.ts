
export const validateEmail = (email: string) => {
  const companyEmailRegex = /^[a-zA-Z0-9._%+-]+@myclinic\.com\.sa$/;
  const allowedPersonalEmail = "inpatienteam@gmail.com";
  
  return companyEmailRegex.test(email) || email === allowedPersonalEmail;
};

export const extractUserName = (email: string) => {
  if (email === "inpatienteam@gmail.com") {
    return "Inpatient Team";
  }
  
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
  
  if (email.includes("doctor")) {
    return "doctor";
  } else if (email.includes("hospital")) {
    return "hospital";
  } else if (email.includes("coordinator")) {
    return "case-coordinator";
  } else if (email.includes("finance")) {
    return "finance";
  } else if (email.includes("customer")) {
    return "customer-care";
  }
  
  console.log("User identified as nurse (default)");
  return "nurse";
};

export const redirectToUserDashboard = (userRole: string, navigate: (path: string) => void) => {
  console.log("Redirecting user with role:", userRole);
  switch (userRole) {
    case "admin":
      console.log("Navigating to /admin");
      navigate("/admin");
      break;
    case "doctor":
      console.log("Navigating to /doctor-dashboard");
      navigate("/doctor-dashboard");
      break;
    case "hospital":
      console.log("Navigating to /hospital-dashboard");
      navigate("/hospital-dashboard");
      break;
    case "case-coordinator":
      console.log("Navigating to /case-coordinator-dashboard");
      navigate("/case-coordinator-dashboard");
      break;
    case "finance":
      console.log("Navigating to /finance-dashboard");
      navigate("/finance-dashboard");
      break;
    case "customer-care":
      console.log("Navigating to /customer-care-dashboard");
      navigate("/customer-care-dashboard");
      break;
    default:
      console.log("Navigating to /nurse-dashboard");
      navigate("/nurse-dashboard");
      break;
  }
};
