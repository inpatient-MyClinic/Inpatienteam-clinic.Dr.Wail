
import { User } from './types';

const USERS_STORAGE_KEY = 'enhancedUserManagementUsers';

export const loadUsersFromStorage = (): User[] => {
  try {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      console.log(`Loaded ${parsed.length} users from localStorage`);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load users from localStorage:', error);
  }
  return [];
};

export const saveUsersToStorage = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log(`Saved ${users.length} users to localStorage`);
  } catch (error) {
    console.error('Failed to save users to localStorage:', error);
  }
};

// Re-export User type for convenience
export type { User } from './types';
