
import { User } from './types';

const USERS_STORAGE_KEY = 'enhancedUserManagementUsers';
const BACKUP_STORAGE_KEY = 'enhancedUserManagementUsersBackup';

export const loadUsersFromStorage = (): User[] => {
  try {
    // Try primary storage first
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      console.log(`Successfully loaded ${parsed.length} users from primary storage`);
      
      // Validate and normalize user data
      const validatedUsers = parsed.map((user: any) => ({
        id: user.id || Date.now().toString(),
        email: user.email || '',
        category: user.category || 'Doctor',
        specialty: user.specialty || undefined,
        status: (user.status === 'Active' || user.status === 'Inactive') ? user.status : 'Active',
        createdAt: user.createdAt || new Date().toISOString().split('T')[0],
        fieldPermissions: user.fieldPermissions || {},
        hospitalPrivileges: user.hospitalPrivileges || []
      }));
      
      return validatedUsers;
    }
    
    // Try backup storage
    const backupUsers = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backupUsers) {
      const parsed = JSON.parse(backupUsers);
      console.log(`Recovered ${parsed.length} users from backup storage`);
      return parsed;
    }
    
    console.log('No users found in storage, returning empty array');
    return [];
  } catch (error) {
    console.error('Failed to load users from storage:', error);
    
    // Try backup storage on error
    try {
      const backupUsers = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (backupUsers) {
        const parsed = JSON.parse(backupUsers);
        console.log(`Recovered ${parsed.length} users from backup after error`);
        return parsed;
      }
    } catch (backupError) {
      console.error('Backup recovery also failed:', backupError);
    }
    
    return [];
  }
};

export const saveUsersToStorage = (users: User[]): void => {
  try {
    const serializedUsers = JSON.stringify(users);
    
    // Save to primary storage
    localStorage.setItem(USERS_STORAGE_KEY, serializedUsers);
    
    // Save backup copy
    localStorage.setItem(BACKUP_STORAGE_KEY, serializedUsers);
    
    console.log(`Successfully saved ${users.length} users to storage with backup`);
  } catch (error) {
    console.error('Failed to save users to storage:', error);
    
    // Try to save just the backup
    try {
      const serializedUsers = JSON.stringify(users);
      localStorage.setItem(BACKUP_STORAGE_KEY, serializedUsers);
      console.log('Saved to backup storage only');
    } catch (backupError) {
      console.error('Failed to save backup as well:', backupError);
    }
  }
};

// Clear all storage (for debugging)
export const clearUserStorage = (): void => {
  localStorage.removeItem(USERS_STORAGE_KEY);
  localStorage.removeItem(BACKUP_STORAGE_KEY);
  console.log('Cleared all user storage');
};

// Export User type for convenience
export type { User } from './types';
