
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "./types";
import { loadUsersFromStorage, saveUsersToStorage } from "./UserStorage";
import { createDefaultUsers } from "./userOperations";
import { filterUsers, hasActiveFilters as checkActiveFilters } from "./userFilters";
import { useUserActions } from "./userActions";
import { cleanupDuplicateUsers } from "./duplicateCleanup";

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

  // Initialize users
  useEffect(() => {
    console.log('useUserManagement: Initializing users...');
    
    const initializeUsers = async () => {
      try {
        // First try to load from storage
        let loadedUsers = loadUsersFromStorage();
        console.log('useUserManagement: Loaded from storage:', loadedUsers.length, 'users');
        
        // If no users exist, create default ones
        if (loadedUsers.length === 0) {
          console.log('useUserManagement: No users found, creating defaults');
          const defaultUsers = createDefaultUsers();
          loadedUsers = defaultUsers;
          saveUsersToStorage(defaultUsers);
          console.log('useUserManagement: Created default users:', defaultUsers.length);
          
          toast({
            title: "System Initialized",
            description: `Created ${defaultUsers.length} default users`
          });
        }
        
        setUsers(loadedUsers);
        console.log('useUserManagement: Users set in state:', loadedUsers.length);
        
      } catch (error) {
        console.error('useUserManagement: Error during initialization:', error);
        
        // Fallback: create default users
        const defaultUsers = createDefaultUsers();
        setUsers(defaultUsers);
        saveUsersToStorage(defaultUsers);
        
        toast({
          title: "System Recovered",
          description: "Created default users after error",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        console.log('useUserManagement: Initialization complete');
      }
    };

    // Add small delay to show loading state
    const timer = setTimeout(initializeUsers, 100);
    return () => clearTimeout(timer);
  }, [toast]);

  // Save users to storage whenever users change
  useEffect(() => {
    if (!isLoading && users.length > 0) {
      console.log('useUserManagement: Saving users to storage:', users.length);
      saveUsersToStorage(users);
    }
  }, [users, isLoading]);

  const addUser = async () => {
    console.log('useUserManagement: Adding user:', newUserEmail, newUserCategory);
    const success = await userActions.addUser(newUserEmail, newUserCategory, newUserSpecialty);
    if (success) {
      setNewUserEmail("");
      setNewUserCategory("Doctor");
      setNewUserSpecialty("none");
      console.log('useUserManagement: User added successfully');
    }
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    console.log('useUserManagement: Updating user:', userId, updates);
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
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
    console.log('useUserManagement: Saving permissions for:', userId);
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
    console.log('useUserManagement: Filtered users:', filtered.length, 'of', users.length);
    return filtered;
  };

  const hasActiveFilters = checkActiveFilters(searchFilter, categoryFilter, specialtyFilter, statusFilter);

  const cleanupDuplicates = () => {
    console.log('useUserManagement: Starting duplicate cleanup...');
    const { removed, cleaned } = cleanupDuplicateUsers();
    
    if (removed > 0) {
      setUsers(cleaned);
      toast({
        title: "Duplicates Cleaned",
        description: `Removed ${removed} duplicate users. ${cleaned.length} users remain.`,
      });
    } else {
      toast({
        title: "No Duplicates Found",
        description: "All users are unique.",
      });
    }
  };

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
    cleanupDuplicates,
    
    // Computed
    filteredUsers: getFilteredUsers(),
    hasActiveFilters
  };
};
