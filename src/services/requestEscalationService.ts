
import { logAuditTrail } from '@/utils/userUtils';

export interface RequestEscalationData {
  id: number;
  createdAt: string;
  status: string;
  assignedCoordinator?: string;
  doctorName: string;
  hospitalName: string;
  patientName: string;
}

export class RequestEscalationService {
  private static checkInterval: NodeJS.Timeout | null = null;
  
  static startEscalationMonitoring() {
    // Check every 30 minutes for requests that need escalation
    this.checkInterval = setInterval(() => {
      this.checkForEscalation();
    }, 30 * 60 * 1000); // 30 minutes
    
    console.log("Request escalation monitoring started");
  }
  
  static stopEscalationMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("Request escalation monitoring stopped");
    }
  }
  
  static checkForEscalation() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Only process during working hours (10 AM to 7 PM)
    if (currentHour < 10 || currentHour >= 19) {
      return;
    }
    
    const storedRequests = localStorage.getItem('medical_requests');
    if (!storedRequests) return;
    
    const requests: RequestEscalationData[] = JSON.parse(storedRequests);
    
    requests.forEach(request => {
      if (this.shouldEscalateRequest(request)) {
        this.escalateToHospital(request);
      }
    });
  }
  
  static shouldEscalateRequest(request: RequestEscalationData): boolean {
    // Check if request is unassigned and 4 hours have passed
    if (request.assignedCoordinator || request.status !== 'Pending') {
      return false;
    }
    
    const createdTime = new Date(request.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff >= 4;
  }
  
  static escalateToHospital(request: RequestEscalationData) {
    console.log(`Escalating request ${request.id} to hospital after 4 hours`);
    
    // Update request status
    const storedRequests = localStorage.getItem('medical_requests');
    if (storedRequests) {
      const requests = JSON.parse(storedRequests);
      const updatedRequests = requests.map((req: any) => {
        if (req.id === request.id) {
          return {
            ...req,
            status: 'Escalated to Hospital',
            escalatedAt: new Date().toISOString(),
            isOverdue: true
          };
        }
        return req;
      });
      
      localStorage.setItem('medical_requests', JSON.stringify(updatedRequests));
    }
    
    // Send notifications
    this.notifyCaseManagers(request);
    this.notifyHospital(request);
    
    // Log audit trail
    logAuditTrail(
      request.id.toString(),
      'Automatic Escalation',
      {
        reason: 'No case coordinator assigned within 4 hours',
        escalatedTo: request.hospitalName,
        originalStatus: 'Pending'
      },
      'System'
    );
  }
  
  static notifyCaseManagers(request: RequestEscalationData) {
    // Store notification for case managers
    const notification = {
      id: Date.now(),
      type: 'escalation',
      title: 'Request Escalated to Hospital',
      message: `Request for ${request.patientName} has been automatically escalated to ${request.hospitalName} after 4 hours without assignment.`,
      requestId: request.id,
      timestamp: new Date().toISOString(),
      recipients: ['case-coordinator'],
      read: false
    };
    
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    existingNotifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(existingNotifications));
    
    console.log(`Notification sent to case managers for request ${request.id}`);
  }
  
  static notifyHospital(request: RequestEscalationData) {
    // Store notification for hospital
    const notification = {
      id: Date.now(),
      type: 'escalated_request',
      title: 'New Escalated Request',
      message: `Request for ${request.patientName} has been escalated to your hospital for processing.`,
      requestId: request.id,
      timestamp: new Date().toISOString(),
      recipients: ['hospital'],
      read: false
    };
    
    const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    existingNotifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(existingNotifications));
    
    console.log(`Notification sent to hospital for escalated request ${request.id}`);
  }
  
  static markAsOverdueWhenAssigned(requestId: number, coordinatorName: string) {
    const storedRequests = localStorage.getItem('medical_requests');
    if (storedRequests) {
      const requests = JSON.parse(storedRequests);
      const updatedRequests = requests.map((req: any) => {
        if (req.id === requestId && req.escalatedAt) {
          return {
            ...req,
            assignedCoordinator: coordinatorName,
            isOverdue: true,
            assignedAt: new Date().toISOString()
          };
        }
        return req;
      });
      
      localStorage.setItem('medical_requests', JSON.stringify(updatedRequests));
      
      logAuditTrail(
        requestId.toString(),
        'Overdue Assignment',
        {
          coordinatorName,
          reason: 'Request was escalated before assignment'
        },
        coordinatorName
      );
    }
  }
}
