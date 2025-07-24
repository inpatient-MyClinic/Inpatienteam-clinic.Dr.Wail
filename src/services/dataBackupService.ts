import { requestStorage } from './requestStorage';
import { loadUsersFromStorage } from '@/components/settings/userManagement/UserStorage';

export type BackupSchedule = 'disabled' | 'now' | 'daily' | 'weekly';

interface BackupSettings {
  schedule: BackupSchedule;
  time: string; // Format: "HH:MM"
  lastBackup?: string;
  enabled: boolean;
}

interface BackupData {
  timestamp: string;
  version: string;
  requests: any[];
  users: any[];
  settings: any;
  notifications: any[];
  metadata: {
    totalRequests: number;
    totalUsers: number;
    exportedBy: string;
  };
}

export class DataBackupService {
  private static readonly BACKUP_SETTINGS_KEY = 'backup_settings';
  private static readonly BACKUP_DATA_KEY = 'backup_data';
  private static intervalId: NodeJS.Timeout | null = null;

  static getBackupSettings(): BackupSettings {
    const saved = localStorage.getItem(this.BACKUP_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Default settings: daily backup at 2:00 AM
    return {
      schedule: 'daily',
      time: '02:00',
      enabled: true
    };
  }

  static saveBackupSettings(settings: BackupSettings): void {
    localStorage.setItem(this.BACKUP_SETTINGS_KEY, JSON.stringify(settings));
    this.scheduleNextBackup();
  }

  static createBackup(): BackupData {
    const requests = requestStorage.getAllRequests();
    const users = loadUsersFromStorage();
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const settings = {
      backup_settings: this.getBackupSettings(),
      // Add other settings as needed
    };

    const backupData: BackupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      requests,
      users,
      settings,
      notifications,
      metadata: {
        totalRequests: requests.length,
        totalUsers: users.length,
        exportedBy: 'System Admin'
      }
    };

    return backupData;
  }

  static downloadBackup(): void {
    const backupData = this.createBackup();
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `medical_system_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    // Update last backup time
    const settings = this.getBackupSettings();
    settings.lastBackup = new Date().toISOString();
    this.saveBackupSettings(settings);
  }

  static saveBackupToStorage(): void {
    const backupData = this.createBackup();
    localStorage.setItem(this.BACKUP_DATA_KEY, JSON.stringify(backupData));
    
    // Update last backup time
    const settings = this.getBackupSettings();
    settings.lastBackup = new Date().toISOString();
    this.saveBackupSettings(settings);
  }

  static restoreFromFile(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backupData: BackupData = JSON.parse(e.target?.result as string);
          this.restoreFromBackup(backupData);
          resolve(true);
        } catch (error) {
          console.error('Failed to restore backup:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  static restoreFromBackup(backupData: BackupData): void {
    // Clear existing data
    this.clearAllData();
    
    // Restore requests
    localStorage.setItem('medical_requests', JSON.stringify(backupData.requests));
    
    // Restore users
    localStorage.setItem('enhancedUserManagementUsers', JSON.stringify(backupData.users));
    
    // Restore notifications
    localStorage.setItem('notifications', JSON.stringify(backupData.notifications));
    
    // Restore settings
    if (backupData.settings.backup_settings) {
      localStorage.setItem(this.BACKUP_SETTINGS_KEY, JSON.stringify(backupData.settings.backup_settings));
    }
    
    console.log('Data restored successfully from backup');
  }

  static clearAllData(): void {
    // Clear all application data
    const keysToRemove = [
      'medical_requests',
      'enhancedUserManagementUsers',
      'enhancedUserManagementUsersBackup',
      'notifications',
      'hospital_privileges',
      'user_sessions',
      'request_templates'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('All application data cleared');
  }

  static scheduleNextBackup(): void {
    // Clear existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const settings = this.getBackupSettings();
    
    if (!settings.enabled || settings.schedule === 'disabled') {
      return;
    }

    if (settings.schedule === 'now') {
      this.downloadBackup();
      return;
    }

    const now = new Date();
    const [hours, minutes] = settings.time.split(':').map(Number);
    
    let nextBackup = new Date();
    nextBackup.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, schedule for tomorrow (daily) or next week (weekly)
    if (nextBackup <= now) {
      if (settings.schedule === 'daily') {
        nextBackup.setDate(nextBackup.getDate() + 1);
      } else if (settings.schedule === 'weekly') {
        nextBackup.setDate(nextBackup.getDate() + 7);
      }
    }
    
    const timeUntilBackup = nextBackup.getTime() - now.getTime();
    
    this.intervalId = setTimeout(() => {
      this.saveBackupToStorage();
      this.downloadBackup();
      
      // Schedule the next backup based on interval
      if (settings.schedule === 'daily') {
        this.intervalId = setInterval(() => {
          this.saveBackupToStorage();
          this.downloadBackup();
        }, 24 * 60 * 60 * 1000); // 24 hours
      } else if (settings.schedule === 'weekly') {
        this.intervalId = setInterval(() => {
          this.saveBackupToStorage();
          this.downloadBackup();
        }, 7 * 24 * 60 * 60 * 1000); // 1 week
      }
    }, timeUntilBackup);
    
    console.log(`Next backup scheduled for: ${nextBackup.toLocaleString()}`);
  }

  static initializeBackupService(): void {
    this.scheduleNextBackup();
    console.log('Data backup service initialized');
  }

  static stopBackupService(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('Data backup service stopped');
  }
}