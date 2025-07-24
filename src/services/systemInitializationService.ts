
import { RequestEscalationService } from './requestEscalationService';
import { DataBackupService } from './dataBackupService';

export class SystemInitializationService {
  static initialize() {
    console.log('Initializing medical request system...');
    
    // Start the escalation monitoring service
    RequestEscalationService.startEscalationMonitoring();
    
    // Initialize backup service
    DataBackupService.initializeBackupService();
    
    // Initialize empty notifications if none exist
    if (!localStorage.getItem('notifications')) {
      localStorage.setItem('notifications', '[]');
    }
    
    // Initialize empty medical requests if none exist
    if (!localStorage.getItem('medical_requests')) {
      localStorage.setItem('medical_requests', '[]');
    }
    
    console.log('Medical request system initialized successfully');
  }
  
  static cleanup() {
    console.log('Cleaning up medical request system...');
    RequestEscalationService.stopEscalationMonitoring();
    DataBackupService.stopBackupService();
  }
}
