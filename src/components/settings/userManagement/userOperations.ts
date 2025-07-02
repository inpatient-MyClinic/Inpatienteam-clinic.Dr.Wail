
import { User, defaultFieldPermissions } from "./types";
import { saveUsersToStorage } from "./UserStorage";

export const createDefaultUsers = (): User[] => {
  return [
    {
      id: "1",
      email: "admin@hospital.com",
      category: "Admin",
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions["Admin"]
    },
    {
      id: "2",
      email: "doctor@hospital.com",
      category: "Doctor",
      specialty: "Cardiology",
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions["Doctor"]
    },
    {
      id: "3",
      email: "nurse@hospital.com",
      category: "Nurse",
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions["Nurse"]
    }
  ];
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
  return {
    id: Date.now().toString(),
    email,
    category,
    specialty: category === "Doctor" ? (specialty === "none" ? undefined : specialty) : undefined,
    status: "Active",
    createdAt: new Date().toISOString().split('T')[0],
    fieldPermissions: defaultFieldPermissions[category as keyof typeof defaultFieldPermissions] || defaultFieldPermissions["Doctor"]
  };
};

export const processExcelUsers = (uploadedUsers: any[]): User[] => {
  return uploadedUsers.map((userData, index) => {
    const newId = Date.now().toString() + index;
    
    return {
      id: newId,
      email: userData.Email || userData.email || `user${index}@example.com`,
      category: userData.Category || userData.category || "Doctor",
      specialty: userData.Specialty || userData.specialty,
      status: "Active" as const,
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions[userData.Category as keyof typeof defaultFieldPermissions] || defaultFieldPermissions["Doctor"]
    };
  });
};

export const exportUsersToCSV = (users: User[]): void => {
  const csvContent = [
    ["Email", "Category", "Specialty", "Status", "Created Date"].join(","),
    ...users.map(user => [
      user.email,
      user.category,
      user.specialty || "",
      user.status,
      user.createdAt
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "users_export.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};
