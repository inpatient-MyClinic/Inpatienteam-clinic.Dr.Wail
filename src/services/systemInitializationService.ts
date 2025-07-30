
import { RequestEscalationService } from './requestEscalationService';
import { DataBackupService } from './dataBackupService';

export class SystemInitializationService {
  static initialize() {
    console.log('Initializing medical request system...');
    
    try {
      // Start the escalation monitoring service
      RequestEscalationService.startEscalationMonitoring();
      console.log('✓ Escalation monitoring service started');
    } catch (error) {
      console.error('Failed to start escalation monitoring:', error);
    }
    
    try {
      // Initialize backup service
      DataBackupService.initializeBackupService();
      console.log('✓ Backup service initialized');
    } catch (error) {
      console.error('Failed to initialize backup service:', error);
    }
    
    try {
      // Initialize empty notifications if none exist
      if (!localStorage.getItem('notifications')) {
        localStorage.setItem('notifications', '[]');
        console.log('✓ Notifications storage initialized');
      }
    } catch (error) {
      console.error('Failed to initialize notifications storage:', error);
    }
    
    try {
      // Initialize empty medical requests if none exist
      if (!localStorage.getItem('medical_requests')) {
        localStorage.setItem('medical_requests', '[]');
        console.log('✓ Medical requests storage initialized');
      }
    } catch (error) {
      console.error('Failed to initialize medical requests storage:', error);
    }
    
    // Initialize other essential storage items
    try {
      if (!localStorage.getItem('enhancedUserManagementUsers')) {
        localStorage.setItem('enhancedUserManagementUsers', '[]');
        console.log('✓ Users storage initialized');
      }
    } catch (error) {
      console.error('Failed to initialize users storage:', error);
    }
    
    console.log('Medical request system initialization completed');
  }
  
  static cleanup() {
    console.log('Cleaning up medical request system...');
    
    try {
      RequestEscalationService.stopEscalationMonitoring();
      console.log('✓ Escalation monitoring stopped');
    } catch (error) {
      console.error('Failed to stop escalation monitoring:', error);
    }
    
    try {
      DataBackupService.stopBackupService();
      console.log('✓ Backup service stopped');
    } catch (error) {
      console.error('Failed to stop backup service:', error);
    }
    
    console.log('Medical request system cleanup completed');
  }
}
