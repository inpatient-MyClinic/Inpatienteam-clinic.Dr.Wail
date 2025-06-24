
import { logAuditTrail } from '@/utils/userUtils';

export interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  requestId: number;
  timestamp: string;
  recipients: string[];
  read: boolean;
  senderRole?: string;
  metadata?: any;
}

export class NotificationService {
  static sendMissingDocumentNotification(requestId: number, patientName: string, creatorEmail: string, doctorName: string) {
    const notifications: NotificationData[] = [
      {
        id: Date.now(),
        type: 'missing_document',
        title: 'Missing Documents Required',
        message: `Request for ${patientName} requires additional documentation. Please review and upload missing documents.`,
        requestId,
        timestamp: new Date().toISOString(),
        recipients: ['doctor', 'nurse'],
        read: false,
        senderRole: 'case-coordinator',
        metadata: { creatorEmail, doctorName }
      }
    ];
    
    this.storeNotifications(notifications);
    console.log(`Missing document notification sent for request ${requestId}`);
  }
  
  static sendInsuranceRejectionNotification(requestId: number, patientName: string, caseManager: string, creatorEmail: string, doctorName: string) {
    const notifications: NotificationData[] = [
      {
        id: Date.now(),
        type: 'insurance_rejection',
        title: 'Insurance Rejected - Justification Needed',
        message: `Insurance has rejected the request for ${patientName}. Additional justification and documentation required.`,
        requestId,
        timestamp: new Date().toISOString(),
        recipients: ['case-coordinator'],
        read: false,
        senderRole: 'hospital',
        metadata: { caseManager, creatorEmail, doctorName }
      },
      {
        id: Date.now() + 1,
        type: 'insurance_rejection',
        title: 'Insurance Rejected - Action Required',
        message: `Insurance has rejected the request for ${patientName}. Please provide additional justification.`,
        requestId,
        timestamp: new Date().toISOString(),
        recipients: ['doctor', 'nurse'],
        read: false,
        senderRole: 'hospital',
        metadata: { creatorEmail, doctorName }
      }
    ];
    
    this.storeNotifications(notifications);
    console.log(`Insurance rejection notifications sent for request ${requestId}`);
  }
  
  static sendStatusUpdateNotification(requestId: number, patientName: string, oldStatus: string, newStatus: string, updatedBy: string, recipients: string[]) {
    const notification: NotificationData = {
      id: Date.now(),
      type: 'status_update',
      title: `Request Status Updated`,
      message: `Request for ${patientName} status changed from "${oldStatus}" to "${newStatus}".`,
      requestId,
      timestamp: new Date().toISOString(),
      recipients,
      read: false,
      senderRole: updatedBy,
      metadata: { oldStatus, newStatus }
    };
    
    this.storeNotifications([notification]);
    console.log(`Status update notification sent for request ${requestId}`);
  }
  
  static sendHospitalSubmissionNotification(requestId: number, patientName: string, hospitalName: string) {
    const notification: NotificationData = {
      id: Date.now(),
      type: 'hospital_submission',
      title: 'Request Submitted to Hospital',
      message: `Request for ${patientName} has been submitted to ${hospitalName} for processing.`,
      requestId,
      timestamp: new Date().toISOString(),
      recipients: ['hospital'],
      read: false,
      senderRole: 'case-coordinator',
      metadata: { hospitalName }
    };
    
    this.storeNotifications([notification]);
    console.log(`Hospital submission notification sent for request ${requestId}`);
  }
  
  private static storeNotifications(notifications: NotificationData[]) {
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = [...existingNotifications, ...notifications];
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }
  
  static getNotificationsForUser(userRole: string): NotificationData[] {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    return notifications.filter((notification: NotificationData) => 
      notification.recipients.includes(userRole)
    ).sort((a: NotificationData, b: NotificationData) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  static markAsRead(notificationId: number) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = notifications.map((notification: NotificationData) => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }
}
