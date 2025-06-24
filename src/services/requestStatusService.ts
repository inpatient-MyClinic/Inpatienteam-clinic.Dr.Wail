
import { NotificationService } from './notificationService';
import { logAuditTrail } from '@/utils/userUtils';

export interface StatusUpdateData {
  requestId: number;
  newStatus: string;
  updatedBy: string;
  reason?: string;
  metadata?: any;
}

export class RequestStatusService {
  private static readonly STATUS_FLOW = {
    'Pending': ['Under Process', 'Missing Document', 'Escalated to Hospital'],
    'Missing Document': ['Under Process', 'Pending'],
    'Under Process': ['Submitted to Hospital', 'Missing Document', 'Pending'],
    'Submitted to Hospital': ['Under Process by Hospital', 'Need More Justification'],
    'Under Process by Hospital': ['Submitted to Insurance', 'Need More Justification'],
    'Submitted to Insurance': ['Approved by Hospital', 'Need More Justification'],
    'Approved by Hospital': ['Done', 'Need More Justification'],
    'Need More Justification': ['Under Process by Hospital', 'Rejected'],
    'Escalated to Hospital': ['Under Process by Hospital'],
    'Rejected': [],
    'Done': []
  };
  
  static updateRequestStatus(data: StatusUpdateData): boolean {
    const request = this.getRequest(data.requestId);
    if (!request) {
      console.error(`Request ${data.requestId} not found`);
      return false;
    }
    
    const currentStatus = request.status;
    
    // Validate status transition
    if (!this.isValidStatusTransition(currentStatus, data.newStatus)) {
      console.error(`Invalid status transition from ${currentStatus} to ${data.newStatus}`);
      return false;
    }
    
    // Update the request
    const updatedRequest = {
      ...request,
      status: data.newStatus,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: data.updatedBy,
      ...(data.metadata || {})
    };
    
    // Add to status history
    if (!updatedRequest.statusHistory) {
      updatedRequest.statusHistory = [];
    }
    updatedRequest.statusHistory.push({
      status: data.newStatus,
      timestamp: new Date().toISOString(),
      user: data.updatedBy,
      reason: data.reason
    });
    
    this.saveRequest(updatedRequest);
    
    // Handle status-specific logic
    this.handleStatusSpecificLogic(updatedRequest, currentStatus, data);
    
    // Log audit trail
    logAuditTrail(
      data.requestId.toString(),
      'Status Update',
      {
        oldStatus: currentStatus,
        newStatus: data.newStatus,
        reason: data.reason,
        metadata: data.metadata
      },
      data.updatedBy
    );
    
    return true;
  }
  
  private static isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    const allowedTransitions = this.STATUS_FLOW[currentStatus as keyof typeof this.STATUS_FLOW];
    return allowedTransitions?.includes(newStatus) || false;
  }
  
  private static handleStatusSpecificLogic(request: any, oldStatus: string, data: StatusUpdateData) {
    const { newStatus, updatedBy, requestId } = data;
    
    switch (newStatus) {
      case 'Missing Document':
        NotificationService.sendMissingDocumentNotification(
          requestId,
          request.patientName,
          request.createdBy || '',
          request.doctorName
        );
        break;
        
      case 'Submitted to Hospital':
        NotificationService.sendHospitalSubmissionNotification(
          requestId,
          request.patientName,
          request.hospitalName || request.referredToHospital
        );
        break;
        
      case 'Need More Justification':
        NotificationService.sendInsuranceRejectionNotification(
          requestId,
          request.patientName,
          request.assignedCoordinator || '',
          request.createdBy || '',
          request.doctorName
        );
        break;
        
      case 'Under Process by Hospital':
        // Hospital starts processing
        NotificationService.sendStatusUpdateNotification(
          requestId,
          request.patientName,
          oldStatus,
          newStatus,
          updatedBy,
          ['case-coordinator', 'doctor', 'nurse']
        );
        break;
        
      case 'Approved by Hospital':
        NotificationService.sendStatusUpdateNotification(
          requestId,
          request.patientName,
          oldStatus,
          newStatus,
          updatedBy,
          ['case-coordinator', 'doctor', 'nurse']
        );
        break;
        
      case 'Done':
        NotificationService.sendStatusUpdateNotification(
          requestId,
          request.patientName,
          oldStatus,
          'Procedure Completed',
          updatedBy,
          ['case-coordinator', 'doctor', 'nurse', 'hospital']
        );
        break;
        
      case 'Rejected':
        NotificationService.sendStatusUpdateNotification(
          requestId,
          request.patientName,
          oldStatus,
          'Request Rejected',
          updatedBy,
          ['case-coordinator', 'doctor', 'nurse']
        );
        break;
    }
  }
  
  static assignCoordinatorToRequest(requestId: number, coordinatorName: string): boolean {
    const request = this.getRequest(requestId);
    if (!request) return false;
    
    const wasEscalated = request.escalatedAt;
    
    const updatedRequest = {
      ...request,
      assignedCoordinator: coordinatorName,
      assignedAt: new Date().toISOString(),
      isOverdue: wasEscalated // Mark as overdue if it was escalated
    };
    
    this.saveRequest(updatedRequest);
    
    logAuditTrail(
      requestId.toString(),
      'Coordinator Assignment',
      {
        coordinatorName,
        wasEscalated,
        isOverdue: wasEscalated
      },
      coordinatorName
    );
    
    return true;
  }
  
  private static getRequest(requestId: number): any {
    const storedRequests = localStorage.getItem('medical_requests');
    if (!storedRequests) return null;
    
    const requests = JSON.parse(storedRequests);
    return requests.find((req: any) => req.id === requestId);
  }
  
  private static saveRequest(updatedRequest: any) {
    const storedRequests = localStorage.getItem('medical_requests');
    if (!storedRequests) return;
    
    const requests = JSON.parse(storedRequests);
    const updatedRequests = requests.map((req: any) => 
      req.id === updatedRequest.id ? updatedRequest : req
    );
    
    localStorage.setItem('medical_requests', JSON.stringify(updatedRequests));
  }
  
  static getRequestsByStatus(status: string): any[] {
    const storedRequests = localStorage.getItem('medical_requests');
    if (!storedRequests) return [];
    
    const requests = JSON.parse(storedRequests);
    return requests.filter((req: any) => req.status === status);
  }
  
  static getOverdueRequests(): any[] {
    const storedRequests = localStorage.getItem('medical_requests');
    if (!storedRequests) return [];
    
    const requests = JSON.parse(storedRequests);
    return requests.filter((req: any) => req.isOverdue === true);
  }
}
