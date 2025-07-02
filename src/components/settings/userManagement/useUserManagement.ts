
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "./types";
import { loadUsersFromStorage, saveUsersToStorage } from "./UserStorage";
import { createDefaultUsers } from "./userOperations";
import { filterUsers, hasActiveFilters as checkActiveFilters } from "./userFilters";
import { useUserActions } from "./userActions";

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
  const userActions = useUserActions(users, setUsers, toast);

  // Load users from localStorage on component mount
  useEffect(() => {
    console.log('useUserManagement: Loading users from storage...');
    const loadedUsers = loadUsersFromStorage();
    console.log('useUserManagement: Loaded users:', loadedUsers);
    
    // If no users exist, create some default ones for demo purposes
    if (loadedUsers.length === 0) {
      console.log('useUserManagement: No users found, creating default users');
      const defaultUsers = createDefaultUsers();
      setUsers(defaultUsers);
      saveUsersToStorage(defaultUsers);
    } else {
      setUsers(loadedUsers);
    }
    
    setIsLoading(false);
    console.log('useUserManagement: Loading complete, isLoading set to false');
  }, []);

  // Save users to localStorage whenever users array changes
  useEffect(() => {
    if (!isLoading && users.length > 0) {
      console.log('useUserManagement: Saving users to storage:', users.length);
      saveUsersToStorage(users);
    }
  }, [users, isLoading]);

  const addUser = () => {
    const success = userActions.addUser(newUserEmail, newUserCategory, newUserSpecialty);
    if (success) {
      setNewUserEmail("");
      setNewUserCategory("Doctor");
      setNewUserSpecialty("none");
    }
  };

  const startEditing = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(userId);
      setEditingPermissions({ ...user.fieldPermissions });
      console.log('useUserManagement: Started editing user:', userId);
    }
  };

  const savePermissions = (userId: string) => {
    userActions.savePermissions(userId, editingPermissions);
    setEditingUser(null);
    setEditingPermissions({});
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditingPermissions({});
    console.log('useUserManagement: Cancelled editing');
  };

  const updatePermission = (fieldId: string, permission: "none" | "view" | "edit") => {
    setEditingPermissions(prev => ({
      ...prev,
      [fieldId]: permission
    }));
  };

  const clearFilters = () => {
    setSearchFilter("");
    setCategoryFilter("all");
    setSpecialtyFilter("all");
    setStatusFilter("all");
    console.log('useUserManagement: Cleared all filters');
  };

  const getFilteredUsers = () => {
    return filterUsers(users, searchFilter, categoryFilter, specialtyFilter, statusFilter);
  };

  const hasActiveFilters = checkActiveFilters(searchFilter, categoryFilter, specialtyFilter, statusFilter);

  console.log('useUserManagement: Current state - users:', users.length, 'isLoading:', isLoading);

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
    deleteUser: userActions.deleteUser,
    startEditing,
    savePermissions,
    cancelEditing,
    updatePermission,
    handleExcelUpload: userActions.handleExcelUpload,
    exportToExcel: () => userActions.exportToExcel(searchFilter, categoryFilter, specialtyFilter, statusFilter),
    clearFilters,
    
    // Computed
    filteredUsers: getFilteredUsers(),
    hasActiveFilters
  };
};
