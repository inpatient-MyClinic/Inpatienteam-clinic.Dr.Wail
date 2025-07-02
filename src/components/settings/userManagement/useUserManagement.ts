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
    console.log('useUserManagement: Starting to load users from storage...');
    
    const initializeUsers = () => {
      try {
        const loadedUsers = loadUsersFromStorage();
        console.log('useUserManagement: Loaded users from storage:', loadedUsers.length);
        
        // If no users exist, create default ones
        if (loadedUsers.length === 0) {
          console.log('useUserManagement: No users found, creating default users');
          const defaultUsers = createDefaultUsers();
          setUsers(defaultUsers);
          saveUsersToStorage(defaultUsers);
          console.log('useUserManagement: Created and saved default users:', defaultUsers.length);
        } else {
          setUsers(loadedUsers);
          console.log('useUserManagement: Set loaded users to state');
        }
      } catch (error) {
        console.error('useUserManagement: Error loading users:', error);
        // Create default users as fallback
        const defaultUsers = createDefaultUsers();
        setUsers(defaultUsers);
        saveUsersToStorage(defaultUsers);
      } finally {
        setIsLoading(false);
        console.log('useUserManagement: Loading complete, isLoading set to false');
      }
    };

    // Small delay to ensure proper loading state display
    const timer = setTimeout(initializeUsers, 500);
    return () => clearTimeout(timer);
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

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
    console.log('useUserManagement: Updated user:', userId, 'with:', updates);
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
    const filtered = filterUsers(users, searchFilter, categoryFilter, specialtyFilter, statusFilter);
    console.log('useUserManagement: Filtering users - Total:', users.length, 'Filtered:', filtered.length);
    return filtered;
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
    updateUser,
    
    // Computed
    filteredUsers: getFilteredUsers(),
    hasActiveFilters
  };
};
