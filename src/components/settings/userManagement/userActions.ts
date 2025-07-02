
import { User } from "./types";
import { createNewUser, validateEmail, processExcelUsers, exportUsersToCSV } from "./userOperations";
import { filterUsers } from "./userFilters";

export const useUserActions = (
  users: User[],
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  toast: any
) => {
  const addUser = (email: string, category: string, specialty: string) => {
    console.log('userActions: Adding user with email:', email);
    
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return false;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (users.some(user => user.email === email)) {
      toast({
        title: "Error", 
        description: "User with this email already exists",
        variant: "destructive"
      });
      return false;
    }

    const newUser = createNewUser(email, category, specialty);
    setUsers(prev => [...prev, newUser]);

    console.log('userActions: Added new user:', newUser);
    toast({
      title: "Success",
      description: `User ${email} added successfully`
    });
    return true;
  };

  const deleteUser = (userId: string) => {
    console.log('userActions: Deleting user:', userId);
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast({
      title: "Success",
      description: "User deleted successfully"
    });
  };

  const savePermissions = (userId: string, editingPermissions: Record<string, "none" | "view" | "edit">) => {
    console.log('userActions: Saving permissions for user:', userId);
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, fieldPermissions: { ...editingPermissions } }
        : user
    ));
    
    toast({
      title: "Success",
      description: "Permissions updated successfully"
    });
  };

  const handleExcelUpload = (uploadedUsers: any[]) => {
    console.log('userActions: Processing Excel upload:', uploadedUsers.length, 'users');
    
    const newUsers = processExcelUsers(uploadedUsers);

    // Check for duplicates based on email
    const existingEmails = users.map(u => u.email);
    const uniqueNewUsers = newUsers.filter(newUser => !existingEmails.includes(newUser.email));
    const duplicates = newUsers.filter(newUser => existingEmails.includes(newUser.email));

    if (duplicates.length > 0) {
      console.log('userActions: Found duplicates:', duplicates.length);
      toast({
        title: "Duplicates Found",
        description: `${duplicates.length} users already exist and were skipped. ${uniqueNewUsers.length} new users added.`,
        variant: "destructive"
      });
    }

    if (uniqueNewUsers.length > 0) {
      setUsers(prev => [...prev, ...uniqueNewUsers]);
      console.log('userActions: Added users from Excel:', uniqueNewUsers.length);
      toast({
        title: "Success",
        description: `${uniqueNewUsers.length} users imported successfully from Excel`
      });
    }
  };

  const exportToExcel = (
    searchFilter: string,
    categoryFilter: string,
    specialtyFilter: string,
    statusFilter: string
  ) => {
    const filteredUsers = filterUsers(users, searchFilter, categoryFilter, specialtyFilter, statusFilter);
    if (filteredUsers.length === 0) {
      toast({
        title: "No Data",
        description: "No users to export",
        variant: "destructive"
      });
      return;
    }

    exportUsersToCSV(filteredUsers);

    console.log('userActions: Exported users to CSV:', filteredUsers.length);
    toast({
      title: "Success",
      description: "Users exported successfully"
    });
  };

  return {
    addUser,
    deleteUser,
    savePermissions,
    handleExcelUpload,
    exportToExcel
  };
};
