
export const getCurrentUserRole = (): string | null => {
  const currentUserEmail = Object.keys(localStorage)
    .find(key => key.startsWith('user_'))
    ?.replace('user_', '');
  
  if (currentUserEmail) {
    // CRITICAL: Always check admin status FIRST before checking stored role
    if (isAdmin(currentUserEmail)) {
      console.log("getCurrentUserRole: Admin email detected, returning admin role");
      return "admin";
    }
    
    const userData = localStorage.getItem(`user_${currentUserEmail}`);
    if (userData) {
      const user = JSON.parse(userData);
      console.log("getCurrentUserRole: User role from storage:", user.role);
      return user.role;
    }
  }
  
  console.log("getCurrentUserRole: No user found");
  return null;
};

export const getCurrentUserEmail = (): string | null => {
  const currentUserEmail = Object.keys(localStorage)
    .find(key => key.startsWith('user_'))
    ?.replace('user_', '');
  
  return currentUserEmail || null;
};

export const isAdmin = (email: string): boolean => {
  const adminEmails = [
    "admin@myclinic.com.sa",
    "wail.ahmed@myclinic.com.sa",
    "inpatienteam@myclinic.com.sa"
  ];
  
  const isAdminUser = adminEmails.includes(email.toLowerCase().trim());
  console.log("isAdmin check for", email, ":", isAdminUser);
  return isAdminUser;
};

export const canAccessRole = (userRole: string, requiredRole: string): boolean => {
  // Admin can access everything
  if (userRole === 'admin') {
    return true;
  }
  
  // Users can only access their own role
  return userRole === requiredRole;
};
