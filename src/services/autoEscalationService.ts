interface RequestEscalationData {
  id: string;
  patientName: string;
  hospital: string;
  createdAt: string;
  assignedCoordinator?: string;
  status: string;
}

class AutoEscalationService {
  private static escalationInterval: NodeJS.Timeout | null = null;
  private static readonly ESCALATION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  static startMonitoring(): void {
    if (this.escalationInterval) {
      clearInterval(this.escalationInterval);
    }

    // Check every 30 minutes for requests to escalate
    this.escalationInterval = setInterval(() => {
      this.checkForEscalation();
    }, 30 * 60 * 1000);

    console.log('Auto-escalation monitoring started');
  }

  static stopMonitoring(): void {
    if (this.escalationInterval) {
      clearInterval(this.escalationInterval);
      this.escalationInterval = null;
    }
    console.log('Auto-escalation monitoring stopped');
  }

  static checkForEscalation(): void {
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    const assignments = JSON.parse(localStorage.getItem('coordinator_hospital_assignments') || '[]');
    const currentTime = new Date().getTime();

    requests.forEach((request: RequestEscalationData) => {
      if (this.shouldEscalateRequest(request, currentTime)) {
        const targetCoordinator = this.getTargetCoordinator(request.hospital, assignments);
        
        if (targetCoordinator) {
          this.escalateRequest(request, targetCoordinator);
        }
      }
    });
  }

  private static shouldEscalateRequest(request: RequestEscalationData, currentTime: number): boolean {
    // Don't escalate if already assigned to a coordinator
    if (request.assignedCoordinator) {
      return false;
    }

    // Don't escalate completed/cancelled requests
    const completedStatuses = ['completed', 'cancelled', 'rejected', 'done'];
    if (completedStatuses.includes(request.status.toLowerCase())) {
      return false;
    }

    // Check if request is older than 4 hours
    const requestTime = new Date(request.createdAt).getTime();
    const timeDifference = currentTime - requestTime;
    
    return timeDifference >= this.ESCALATION_TIMEOUT;
  }

  private static getTargetCoordinator(hospital: string, assignments: any[]): string | null {
    // Find assignments for this hospital
    const hospitalCoordinators = assignments.filter(assignment => 
      assignment.hospitals.includes(hospital)
    );

    // Only auto-escalate if exactly one coordinator is assigned
    // If 0 or 2+ coordinators, don't auto-escalate
    if (hospitalCoordinators.length === 1) {
      return hospitalCoordinators[0].coordinatorName;
    }

    return null;
  }

  private static escalateRequest(request: RequestEscalationData, coordinatorName: string): void {
    // Update the request with coordinator assignment
    const requests = JSON.parse(localStorage.getItem('medical_requests') || '[]');
    const updatedRequests = requests.map((req: any) => {
      if (req.id === request.id) {
        return {
          ...req,
          assignedCoordinator: coordinatorName,
          coordinatorActionTime: new Date().toISOString(),
          escalatedAt: new Date().toISOString(),
          escalationReason: 'Auto-escalated after 4 hours of inactivity'
        };
      }
      return req;
    });

    localStorage.setItem('medical_requests', JSON.stringify(updatedRequests));

    // Log the escalation
    this.logEscalation(request, coordinatorName);

    // Create notification for the coordinator
    this.createNotification(request, coordinatorName);

    console.log(`Auto-escalated request ${request.id} to coordinator ${coordinatorName}`);
  }

  private static logEscalation(request: RequestEscalationData, coordinatorName: string): void {
    const auditTrail = JSON.parse(localStorage.getItem('audit_trail') || '[]');
    const logEntry = {
      id: Date.now().toString(),
      requestId: request.id,
      action: 'Auto-Escalation',
      userName: 'System',
      userEmail: 'system@myclinic.com.sa',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      details: {
        escalatedTo: coordinatorName,
        reason: 'Request unassigned for 4+ hours',
        hospital: request.hospital,
        patientName: request.patientName
      }
    };

    auditTrail.push(logEntry);
    localStorage.setItem('audit_trail', JSON.stringify(auditTrail));
  }

  private static createNotification(request: RequestEscalationData, coordinatorName: string): void {
    const notifications = JSON.parse(localStorage.getItem('coordinator_notifications') || '[]');
    const notification = {
      id: Date.now().toString(),
      coordinatorName,
      requestId: request.id,
      patientName: request.patientName,
      hospital: request.hospital,
      message: `Request auto-escalated to you due to 4+ hours of inactivity`,
      type: 'escalation',
      timestamp: new Date().toISOString(),
      read: false
    };

    notifications.push(notification);
    localStorage.setItem('coordinator_notifications', JSON.stringify(notifications));
  }

  static getEscalationStats(): any {
    const auditTrail = JSON.parse(localStorage.getItem('audit_trail') || '[]');
    const escalations = auditTrail.filter((entry: any) => entry.action === 'Auto-Escalation');
    
    const today = new Date().toLocaleDateString();
    const thisWeek = escalations.filter((entry: any) => {
      const entryDate = new Date(entry.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo;
    });

    return {
      total: escalations.length,
      today: escalations.filter((entry: any) => entry.date === today).length,
      thisWeek: thisWeek.length,
      byCoordinator: escalations.reduce((acc: any, entry: any) => {
        const coordinator = entry.details?.escalatedTo || 'Unknown';
        acc[coordinator] = (acc[coordinator] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

export default AutoEscalationService;