
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, defaultFieldPermissions } from "./types";
import { loadUsersFromStorage, saveUsersToStorage } from "./UserStorage";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
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
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  // Load users from localStorage on component mount
  useEffect(() => {
    console.log('Loading users from storage...');
    setIsLoading(true);
    try {
      const loadedUsers = loadUsersFromStorage();
      console.log('Loaded users:', loadedUsers);
      setUsers(loadedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
    setIsLoading(false);
  }, []);

  // Save users to localStorage whenever users array changes
  useEffect(() => {
    if (!isLoading && users.length >= 0) {
      console.log('Saving users to storage:', users.length);
      saveUsersToStorage(users);
    }
  }, [users, isLoading]);

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
      id: Date.now().toString(),
      email: newUserEmail,
      category: newUserCategory,
      specialty: newUserCategory === "Doctor" ? (newUserSpecialty === "none" ? undefined : newUserSpecialty) : undefined,
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: defaultFieldPermissions[newUserCategory as keyof typeof defaultFieldPermissions] || defaultFieldPermissions["Doctor"]
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setNewUserEmail("");
    setNewUserCategory("Doctor");
    setNewUserSpecialty("none");

    console.log('Added new user:', newUser);
    toast({
      title: "Success",
      description: `User ${newUserEmail} added successfully`
    });
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    console.log('Deleted user:', userId);
    toast({
      title: "Success",
      description: "User deleted successfully"
    });
  };

  const startEditing = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(userId);
      setEditingPermissions({ ...user.fieldPermissions });
      console.log('Started editing user:', userId);
    }
  };

  const savePermissions = (userId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, fieldPermissions: { ...editingPermissions } }
        : user
    );
    setUsers(updatedUsers);
    setEditingUser(null);
    setEditingPermissions({});
    
    console.log('Saved permissions for user:', userId);
    toast({
      title: "Success",
      description: "Permissions updated successfully"
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditingPermissions({});
    console.log('Cancelled editing');
  };

  const updatePermission = (fieldId: string, permission: "none" | "view" | "edit") => {
    setEditingPermissions(prev => ({
      ...prev,
      [fieldId]: permission
    }));
  };

  const handleExcelUpload = (uploadedUsers: any[]) => {
    console.log('Processing Excel upload:', uploadedUsers.length, 'users');
    
    const newUsers: User[] = uploadedUsers.map((userData, index) => {
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

    // Check for duplicates based on email
    const existingEmails = users.map(u => u.email);
    const uniqueNewUsers = newUsers.filter(newUser => !existingEmails.includes(newUser.email));
    const duplicates = newUsers.filter(newUser => existingEmails.includes(newUser.email));

    if (duplicates.length > 0) {
      console.log('Found duplicates:', duplicates.length);
      toast({
        title: "Duplicates Found",
        description: `${duplicates.length} users already exist and were skipped. ${uniqueNewUsers.length} new users added.`,
        variant: "destructive"
      });
    }

    if (uniqueNewUsers.length > 0) {
      const updatedUsers = [...users, ...uniqueNewUsers];
      setUsers(updatedUsers);
      console.log('Added users from Excel:', uniqueNewUsers.length);
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

    console.log('Exported users to CSV:', filteredUsers.length);
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
    console.log('Cleared all filters');
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
    isLoading,
    
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
