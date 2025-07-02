
import { User } from './types';

const USERS_STORAGE_KEY = 'enhancedUserManagementUsers';

export const loadUsersFromStorage = (): User[] => {
  try {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      console.log(`Successfully loaded ${parsed.length} users from localStorage`);
      // Ensure each user has the required properties with proper defaults
      return parsed.map((user: any) => ({
        id: user.id || Date.now().toString(),
        email: user.email || '',
        category: user.category || 'Doctor',
        specialty: user.specialty || undefined,
        status: user.status || 'Active',
        createdAt: user.createdAt || new Date().toISOString().split('T')[0],
        fieldPermissions: user.fieldPermissions || {}
      }));
    }
    console.log('No users found in localStorage, returning empty array');
    return [];
  } catch (error) {
    console.error('Failed to load users from localStorage:', error);
    return [];
  }
};

export const saveUsersToStorage = (users: User[]): void => {
  try {
    const serializedUsers = JSON.stringify(users);
    localStorage.setItem(USERS_STORAGE_KEY, serializedUsers);
    console.log(`Successfully saved ${users.length} users to localStorage`);
  } catch (error) {
    console.error('Failed to save users to localStorage:', error);
  }
};

// Export User type for convenience
export type { User } from './types';
