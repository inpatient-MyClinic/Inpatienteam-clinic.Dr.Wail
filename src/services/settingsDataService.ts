import { toast } from "sonner";

// Settings data keys for localStorage
const STORAGE_KEYS = {
  USERS: 'enhancedUserManagementUsers',
  HOSPITAL_CODES: 'hospital_codes',
  SERVICE_PRICING: 'service_pricing',
  AUDIT_TRAIL: 'audit_trail',
  MEDICAL_REQUESTS: 'medical_requests',
  SYSTEM_SETTINGS: 'system_settings',
  CUSTOM_FIELDS: 'custom_fields',
  ADMIN_FIELDS: 'admin_fields',
  DOCTOR_MANAGEMENT: 'doctor_management',
  USER_TRACKER: 'user_tracker_activities',
  NPS_TARGETS: 'nps_targets'
} as const;

export interface SettingsData {
  users: any[];
  hospitalCodes: any[];
  servicePricing: any[];
  auditTrail: any[];
  medicalRequests: any[];
  systemSettings: any;
  customFields: any[];
  adminFields: any[];
  doctorManagement: any[];
  userTracker: any[];
  npsTargets: any;
}

class SettingsDataService {
  // Get all settings data from localStorage
  getAllData(): SettingsData {
    return {
      users: this.getData(STORAGE_KEYS.USERS, []),
      hospitalCodes: this.getData(STORAGE_KEYS.HOSPITAL_CODES, []),
      servicePricing: this.getData(STORAGE_KEYS.SERVICE_PRICING, []),
      auditTrail: this.getData(STORAGE_KEYS.AUDIT_TRAIL, []),
      medicalRequests: this.getData(STORAGE_KEYS.MEDICAL_REQUESTS, []),
      systemSettings: this.getData(STORAGE_KEYS.SYSTEM_SETTINGS, {}),
      customFields: this.getData(STORAGE_KEYS.CUSTOM_FIELDS, []),
      adminFields: this.getData(STORAGE_KEYS.ADMIN_FIELDS, []),
      doctorManagement: this.getData(STORAGE_KEYS.DOCTOR_MANAGEMENT, []),
      userTracker: this.getData(STORAGE_KEYS.USER_TRACKER, []),
      npsTargets: this.getData(STORAGE_KEYS.NPS_TARGETS, {})
    };
  }

  // Get data from localStorage with fallback
  getData(key: string, fallback: any = null): any {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) {
        return fallback;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error(`Error loading data for key ${key}:`, error);
      return fallback;
    }
  }

  // Save data to localStorage
  saveData(key: string, data: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      toast.error(`Failed to save ${key} data. Storage may be full.`);
      return false;
    }
  }

  // Clear specific data
  clearData(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error clearing data for key ${key}:`, error);
      return false;
    }
  }

  // Clear all settings data
  clearAllData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      toast.success('All settings data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      toast.error('Failed to clear all data');
      return false;
    }
  }

  // Backup all data to a downloadable file
  exportAllData(): void {
    try {
      const allData = this.getAllData();
      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(dataBlob);
      downloadLink.download = `settings_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success('Settings data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export settings data');
    }
  }

  // Import data from a backup file
  async importAllData(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data: SettingsData = JSON.parse(text);
      
      // Save each data type
      let successCount = 0;
      let totalCount = 0;
      
      if (data.users) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.USERS, data.users)) successCount++;
      }
      
      if (data.hospitalCodes) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.HOSPITAL_CODES, data.hospitalCodes)) successCount++;
      }
      
      if (data.servicePricing) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.SERVICE_PRICING, data.servicePricing)) successCount++;
      }
      
      if (data.auditTrail) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.AUDIT_TRAIL, data.auditTrail)) successCount++;
      }
      
      if (data.medicalRequests) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.MEDICAL_REQUESTS, data.medicalRequests)) successCount++;
      }
      
      if (data.systemSettings) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.SYSTEM_SETTINGS, data.systemSettings)) successCount++;
      }
      
      if (data.customFields) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.CUSTOM_FIELDS, data.customFields)) successCount++;
      }
      
      if (data.adminFields) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.ADMIN_FIELDS, data.adminFields)) successCount++;
      }
      
      if (data.doctorManagement) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.DOCTOR_MANAGEMENT, data.doctorManagement)) successCount++;
      }
      
      if (data.userTracker) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.USER_TRACKER, data.userTracker)) successCount++;
      }
      
      if (data.npsTargets) {
        totalCount++;
        if (this.saveData(STORAGE_KEYS.NPS_TARGETS, data.npsTargets)) successCount++;
      }
      
      if (successCount === totalCount) {
        toast.success(`Successfully imported ${successCount} data sets`);
        return true;
      } else {
        toast.error(`Only ${successCount} of ${totalCount} data sets imported successfully`);
        return false;
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import settings data. Invalid file format.');
      return false;
    }
  }

  // Get data summary for display
  getDataSummary(): { [key: string]: number } {
    const allData = this.getAllData();
    return {
      'Users': allData.users.length,
      'Hospital Codes': allData.hospitalCodes.length,
      'Service Pricing': allData.servicePricing.length,
      'Audit Trail': allData.auditTrail.length,
      'Medical Requests': allData.medicalRequests.length,
      'User Tracker Activities': allData.userTracker.length
    };
  }

  // Check if data exists
  hasData(): boolean {
    const summary = this.getDataSummary();
    return Object.values(summary).some(count => count > 0);
  }
}

export const settingsDataService = new SettingsDataService();
export { STORAGE_KEYS };