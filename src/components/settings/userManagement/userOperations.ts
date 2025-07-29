
import { User, defaultFieldPermissions } from "./types";

export const createDefaultUsers = (): User[] => {
  console.log('Creating default users...');
  
  const defaultUsers: User[] = [
    {
      id: "default-admin-1",
      email: "admin@hospital.com",
      category: "Admin",
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions["Admin"],
      hospitalPrivileges: []
    },
    {
      id: "default-doctor-1",
      email: "doctor@hospital.com",
      category: "Doctor",
      specialty: "Cardiology",
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions["Doctor"],
      hospitalPrivileges: ["DSAH", "DSFH (main)"]
    },
    {
      id: "default-nurse-1",
      email: "nurse@hospital.com",
      category: "Nurse",
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions["Nurse"],
      hospitalPrivileges: []
    },
    {
      id: "default-finance-1",
      email: "finance@hospital.com",
      category: "Finance",
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions["Finance"],
      hospitalPrivileges: []
    }
  ];
  
  console.log('Created default users:', defaultUsers.length);
  return defaultUsers;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const createNewUser = (
  email: string,
  category: string,
  specialty: string
): User => {
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase().trim(),
    category,
    specialty: category === "Doctor" ? (specialty === "none" ? undefined : specialty) : undefined,
    status: "Active",
    createdAt: new Date().toISOString().split('T')[0],
    fieldPermissions: defaultFieldPermissions[category as keyof typeof defaultFieldPermissions] || defaultFieldPermissions["Doctor"],
    hospitalPrivileges: []
  };
  
  console.log('Created new user:', newUser);
  return newUser;
};

export const processExcelUsers = (uploadedUsers: any[]): User[] => {
  console.log('Processing Excel users:', uploadedUsers.length);
  
  return uploadedUsers.map((userData, index) => {
    const newId = `excel-${Date.now()}-${index}`;
    const category = userData.Category || userData.category || "Doctor";
    
    return {
      id: newId,
      email: (userData.Email || userData.email || `user${index}@example.com`).toLowerCase().trim(),
      category,
      specialty: userData.Specialty || userData.specialty,
      status: "Active" as const,
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions[category as keyof typeof defaultFieldPermissions] || defaultFieldPermissions["Doctor"],
      hospitalPrivileges: []
    };
  });
};

export const exportUsersToCSV = (users: User[]): void => {
  console.log('Exporting users to CSV:', users.length);
  
  const csvContent = [
    ["Email", "Category", "Specialty", "Status", "Created Date", "Hospital Privileges"].join(","),
    ...users.map(user => [
      user.email,
      user.category,
      user.specialty || "",
      user.status,
      user.createdAt,
      (user.hospitalPrivileges || []).join("; ")
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  console.log('CSV export completed');
};
