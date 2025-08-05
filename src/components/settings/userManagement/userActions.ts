
import { User } from "./types";
import { createNewUser, validateEmail, processExcelUsers, exportUsersToCSV } from "./userOperations";
import { filterUsers } from "./userFilters";
import { createUserAccount } from "@/services/userAccountService";

export const useUserActions = (
  users: User[],
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  toast: any
) => {
  const addUser = async (email: string, category: string, specialty: string) => {
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
        description: "User with this email already exists in local management",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Map category to role
      const roleMapping: Record<string, any> = {
        'Admin': 'admin',
        'Doctor': 'doctor', 
        'Nurse': 'nurse',
        'Case Coordinator': 'case-coordinator',
        'Hospital': 'hospital',
        'Finance': 'finance',
        'Customer Service': 'customer-care'
      };

      // First create the actual user account in Supabase
      await createUserAccount({
        email: email.trim().toLowerCase(),
        fullName: email.split('@')[0],
        role: roleMapping[category] || 'doctor',
        specialty: specialty !== 'none' ? specialty : undefined
      });

      // Then add to local management system
      const newUser = createNewUser(email, category, specialty);
      setUsers(prev => [...prev, newUser]);

      console.log('userActions: Added new user to both database and local management:', newUser);
      toast({
        title: "Success",
        description: `User ${email} created successfully! They can now login with the temporary password.`
      });
      return true;

    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user account",
        variant: "destructive"
      });
      return false;
    }
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

    // Comprehensive duplicate checking - by email AND doctor name
    const duplicates: User[] = [];
    const uniqueNewUsers: User[] = [];

    newUsers.forEach(newUser => {
      const isDuplicateByEmail = users.some(existing => existing.email === newUser.email);
      const isDuplicateByName = users.some(existing => 
        existing.category === 'Doctor' && 
        newUser.category === 'Doctor' && 
        existing.email.split('@')[0].toLowerCase().replace(/[.\-_]/g, '') === 
        newUser.email.split('@')[0].toLowerCase().replace(/[.\-_]/g, '')
      );

      if (isDuplicateByEmail || isDuplicateByName) {
        duplicates.push(newUser);
        console.log('Found duplicate:', newUser.email);
      } else {
        uniqueNewUsers.push(newUser);
      }
    });

    // Remove duplicates within the new data itself
    const finalUniqueUsers: User[] = [];
    const seenEmails = new Set<string>();
    const seenNames = new Set<string>();

    uniqueNewUsers.forEach(user => {
      const emailKey = user.email.toLowerCase();
      const nameKey = user.category === 'Doctor' ? user.email.split('@')[0].toLowerCase().replace(/[.\-_]/g, '') : '';
      
      if (!seenEmails.has(emailKey) && (user.category !== 'Doctor' || !seenNames.has(nameKey))) {
        seenEmails.add(emailKey);
        if (user.category === 'Doctor') seenNames.add(nameKey);
        finalUniqueUsers.push(user);
      } else {
        duplicates.push(user);
        console.log('Found internal duplicate:', user.email);
      }
    });

    if (duplicates.length > 0) {
      console.log('userActions: Found duplicates:', duplicates.length);
      toast({
        title: "Duplicates Prevented",
        description: `${duplicates.length} duplicate users were skipped. ${finalUniqueUsers.length} new users added.`,
        variant: "destructive"
      });
    }

    if (finalUniqueUsers.length > 0) {
      setUsers(prev => [...prev, ...finalUniqueUsers]);
      console.log('userActions: Added users from Excel:', finalUniqueUsers.length);
      toast({
        title: "Success",
        description: `${finalUniqueUsers.length} users imported successfully from Excel`
      });
    } else if (duplicates.length > 0) {
      toast({
        title: "No New Users",
        description: "All uploaded users already exist in the system",
        variant: "destructive"
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
