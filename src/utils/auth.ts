
export const getCurrentUserRole = (): string | null => {
  const currentUserEmail = Object.keys(localStorage)
    .find(key => key.startsWith('user_'))
    ?.replace('user_', '');
  
  if (currentUserEmail) {
    const userData = localStorage.getItem(`user_${currentUserEmail}`);
    if (userData) {
      const user = JSON.parse(userData);
      return user.role;
    }
  }
  
  return null;
};

export const isAdmin = (email: string): boolean => {
  const adminEmails = [
    "wail.ahmed@myclinic.com.sa",
    "inpatienteam@gmail.com",
    "admin@myclinic.com.sa"
  ];
  
  return adminEmails.includes(email);
};
