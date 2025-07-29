import { User } from './types';
import { loadUsersFromStorage, saveUsersToStorage } from './UserStorage';

export const cleanupDuplicateUsers = (): { removed: number; cleaned: User[] } => {
  console.log('Starting duplicate cleanup...');
  
  const users = loadUsersFromStorage();
  const seenEmails = new Set<string>();
  const seenDoctorNames = new Set<string>();
  const cleanedUsers: User[] = [];
  let removedCount = 0;

  users.forEach(user => {
    const emailKey = user.email.toLowerCase();
    let nameKey = '';
    
    if (user.category === 'Doctor') {
      nameKey = user.email.split('@')[0].toLowerCase().replace(/[.\-_]/g, '');
    }

    const isDuplicateEmail = seenEmails.has(emailKey);
    const isDuplicateName = user.category === 'Doctor' && seenDoctorNames.has(nameKey);

    if (isDuplicateEmail || isDuplicateName) {
      console.log('Removing duplicate user:', user.email);
      removedCount++;
    } else {
      seenEmails.add(emailKey);
      if (user.category === 'Doctor') {
        seenDoctorNames.add(nameKey);
      }
      cleanedUsers.push(user);
    }
  });

  if (removedCount > 0) {
    saveUsersToStorage(cleanedUsers);
    console.log(`Cleanup complete: removed ${removedCount} duplicates, kept ${cleanedUsers.length} users`);
  }

  return { removed: removedCount, cleaned: cleanedUsers };
};