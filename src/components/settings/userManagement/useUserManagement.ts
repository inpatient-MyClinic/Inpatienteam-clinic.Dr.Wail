
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, defaultFieldPermissions } from "./types";
import { loadUsersFromStorage, saveUsersToStorage } from "./UserStorage";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>(() => loadUsersFromStorage());
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserCategory, setNewUserCategory] = useState("Doctor");
  const [newUserSpecialty, setNewUserSpecialty] = useState("none");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Record<string, "none" | "view" | "edit">>({});
  
  // Filter states
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { toast } = useToast();

  // Save users to localStorage whenever users array changes
  useEffect(() => {
    saveUsersToStorage(users);
  }, [users]);

  const addUser = () => {
    if (!newUserEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (users.some(user => user.email === newUserEmail)) {
      toast({
        title: "Error", 
        description: "User with this email already exists",
        variant: "destructive"
      });
      return;
    }

    const newUser: User = {
      id: (users.length + 1).toString(),
      email: newUserEmail,
      category: newUserCategory,
      specialty: newUserCategory === "Doctor" ? newUserSpecialty : undefined,
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions[newUserCategory as keyof typeof defaultFieldPermissions]
    };

    setUsers([...users, newUser]);
    setNewUserEmail("");
    setNewUserCategory("Doctor");
    setNewUserSpecialty("none");

    toast({
      title: "Success",
      description: "User added successfully"
    });
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "User deleted successfully"
    });
  };

  const startEditing = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(userId);
      setEditingPermissions(user.fieldPermissions);
    }
  };

  const savePermissions = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, fieldPermissions: editingPermissions }
        : user
    ));
    setEditingUser(null);
    setEditingPermissions({});
    
    toast({
      title: "Success",
      description: "Permissions updated successfully"
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditingPermissions({});
  };

  const updatePermission = (fieldId: string, permission: "none" | "view" | "edit") => {
    setEditingPermissions(prev => ({
      ...prev,
      [fieldId]: permission
    }));
  };

  const handleExcelUpload = (uploadedUsers: any[]) => {
    const newUsers: User[] = uploadedUsers.map((userData, index) => {
      const newId = (users.length + index + 1).toString();
      
      return {
        id: newId,
        email: userData.Email || userData.email || '',
        category: userData.Category || (userData["Doctor Name"] ? "Doctor" : "Staff"),
        specialty: userData.Specialty || userData.specialty,
        status: "Active" as const,
        createdAt: new Date().toISOString().split('T')[0],
        fieldPermissions: defaultFieldPermissions[userData.Category as keyof typeof defaultFieldPermissions] || defaultFieldPermissions["Doctor"]
      };
    });

    // Check for duplicates based on email
    const existingEmails = users.map(u => u.email);
    const uniqueNewUsers = newUsers.filter(newUser => !existingEmails.includes(newUser.email));
    const duplicates = newUsers.filter(newUser => existingEmails.includes(newUser.email));

    if (duplicates.length > 0) {
      toast({
        title: "Duplicates Found",
        description: `${duplicates.length} users already exist and were skipped. ${uniqueNewUsers.length} new users added.`,
        variant: "destructive"
      });
    }

    if (uniqueNewUsers.length > 0) {
      setUsers([...users, ...uniqueNewUsers]);
      toast({
        title: "Success",
        description: `${uniqueNewUsers.length} users imported successfully from Excel`
      });
    }
  };

  const exportToExcel = () => {
    const filteredUsers = getFilteredUsers();
    if (filteredUsers.length === 0) {
      toast({
        title: "No Data",
        description: "No users to export",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ["Email", "Category", "Specialty", "Status", "Created Date"].join(","),
      ...filteredUsers.map(user => [
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

    toast({
      title: "Success",
      description: "Users exported successfully"
    });
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = searchFilter === "" || 
        user.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
        user.category.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesCategory = categoryFilter === "all" || user.category === categoryFilter;
      const matchesSpecialty = specialtyFilter === "all" || 
        (specialtyFilter === "none" && !user.specialty) ||
        user.specialty === specialtyFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesSpecialty && matchesStatus;
    });
  };

  const clearFilters = () => {
    setSearchFilter("");
    setCategoryFilter("all");
    setSpecialtyFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchFilter !== "" || categoryFilter !== "all" || specialtyFilter !== "all" || statusFilter !== "all";

  return {
    // State
    users,
    newUserEmail,
    setNewUserEmail,
    newUserCategory,
    setNewUserCategory,
    newUserSpecialty,
    setNewUserSpecialty,
    editingUser,
    editingPermissions,
    searchFilter,
    setSearchFilter,
    categoryFilter,
    setCategoryFilter,
    specialtyFilter,
    setSpecialtyFilter,
    statusFilter,
    setStatusFilter,
    
    // Actions
    addUser,
    deleteUser,
    startEditing,
    savePermissions,
    cancelEditing,
    updatePermission,
    handleExcelUpload,
    exportToExcel,
    clearFilters,
    
    // Computed
    filteredUsers: getFilteredUsers(),
    hasActiveFilters
  };
};
