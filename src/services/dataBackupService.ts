import { requestStorage } from './requestStorage';
import { loadUsersFromStorage } from '@/components/settings/userManagement/UserStorage';

export type BackupSchedule = 'disabled' | 'now' | 'daily' | 'weekly' | 'monthly';

interface BackupSettings {
  schedule: BackupSchedule;
  time: string; // Format: "HH:MM"
  lastBackup?: string;
  enabled: boolean;
  maxVersions: number;
  keepMainVersion: boolean;
}

interface BackupVersion {
  id: string;
  timestamp: string;
  version: string;
  isMainVersion: boolean;
  data: BackupData;
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
  private static readonly BACKUP_VERSIONS_KEY = 'backup_versions';
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
      enabled: true,
      maxVersions: 3,
      keepMainVersion: true
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
    this.saveBackupVersion(backupData, false);
    
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

  static saveBackupVersion(backupData: BackupData, isMainVersion: boolean = false): void {
    const versions = this.getBackupVersions();
    const settings = this.getBackupSettings();
    
    const newVersion: BackupVersion = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      version: backupData.version,
      isMainVersion,
      data: backupData
    };
    
    versions.push(newVersion);
    
    // Clean up old versions but keep main version
    const sortedVersions = versions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const mainVersions = sortedVersions.filter(v => v.isMainVersion);
    const regularVersions = sortedVersions.filter(v => !v.isMainVersion);
    
    // Keep only the latest versions according to settings
    const keptVersions = [
      ...mainVersions,
      ...regularVersions.slice(0, settings.maxVersions)
    ];
    
    localStorage.setItem(this.BACKUP_VERSIONS_KEY, JSON.stringify(keptVersions));
  }

  static getBackupVersions(): BackupVersion[] {
    const saved = localStorage.getItem(this.BACKUP_VERSIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  static setMainVersion(versionId: string): void {
    const versions = this.getBackupVersions();
    const updatedVersions = versions.map(v => ({
      ...v,
      isMainVersion: v.id === versionId
    }));
    localStorage.setItem(this.BACKUP_VERSIONS_KEY, JSON.stringify(updatedVersions));
  }

  static deleteVersion(versionId: string): void {
    const versions = this.getBackupVersions();
    const version = versions.find(v => v.id === versionId);
    
    if (version?.isMainVersion) {
      throw new Error('Cannot delete main version');
    }
    
    const filteredVersions = versions.filter(v => v.id !== versionId);
    localStorage.setItem(this.BACKUP_VERSIONS_KEY, JSON.stringify(filteredVersions));
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
    
    // Initialize fresh data structure for production
    this.initializeProductionData();
    
    console.log('All application data cleared and production data initialized');
  }

  static clearPatientDataOnly(): void {
    // Clear only patient/request data, keep users and settings
    localStorage.setItem('medical_requests', JSON.stringify([]));
    localStorage.setItem('notifications', JSON.stringify([]));
    
    // Set a flag to prevent sample data reinitialization
    localStorage.setItem('sample_data_cleared', 'true');
    
    // Trigger storage events to update UI
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'medical_requests',
      newValue: '[]'
    }));
    window.dispatchEvent(new CustomEvent('requestsUpdated'));
    
    console.log('All patient data cleared, users and settings preserved');
  }

  static initializeProductionData(): void {
    // Initialize empty but valid data structures
    localStorage.setItem('medical_requests', JSON.stringify([]));
    localStorage.setItem('enhancedUserManagementUsers', JSON.stringify([]));
    localStorage.setItem('notifications', JSON.stringify([]));
    
    // Create main version backup with empty data
    const emptyBackup = this.createBackup();
    this.saveBackupVersion(emptyBackup, true);
    
    console.log('Production data structure initialized');
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
    } else if (settings.schedule === 'monthly') {
      nextBackup.setMonth(nextBackup.getMonth() + 1);
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
      } else if (settings.schedule === 'monthly') {
        this.intervalId = setInterval(() => {
          this.saveBackupToStorage();
          this.downloadBackup();
        }, 30 * 24 * 60 * 60 * 1000); // 30 days
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