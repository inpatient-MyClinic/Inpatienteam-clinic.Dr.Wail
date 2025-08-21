import { UnifiedRequest } from './dataIntegrationService';
import { useUnifiedData } from '@/hooks/useUnifiedData';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'case-coordinator' | 'hospital' | 'finance' | 'customer-care';
  hospital?: string;
  specialty?: string;
  department?: string;
  permissions: {
    canViewAll: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    canUpload: boolean;
  };
}

export interface DashboardData {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  overdueRequests: number;
  recentRequests: UnifiedRequest[];
  statusDistribution: Record<string, number>;
  specialtyDistribution?: Record<string, number>;
  hospitalDistribution?: Record<string, number>;
}

class UserDataService {
  // Get user permissions based on role
  getUserPermissions(role: string): UserProfile['permissions'] {
    const basePermissions = {
      canViewAll: false,
      canEdit: false,
      canDelete: false,
      canExport: false,
      canUpload: false
    };

    switch (role.toLowerCase()) {
      case 'admin':
        return {
          canViewAll: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
          canUpload: true
        };
      
      case 'doctor':
        return {
          ...basePermissions,
          canEdit: true,
          canExport: true
        };
      
      case 'nurse':
        return {
          ...basePermissions,
          canEdit: true
        };
      
      case 'case-coordinator':
        return {
          ...basePermissions,
          canEdit: true,
          canExport: true
        };
      
      case 'hospital':
        return {
          ...basePermissions,
          canEdit: true,
          canExport: true
        };
      
      case 'finance':
        return {
          ...basePermissions,
          canExport: true
        };
      
      default:
        return basePermissions;
    }
  }

  // Calculate dashboard statistics for a user
  calculateDashboardData(requests: UnifiedRequest[], userRole: string): DashboardData {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => 
      ['pending', 'under process', 'waiting'].includes(r.status.toLowerCase())
    ).length;
    const completedRequests = requests.filter(r => 
      ['completed', 'done', 'finished'].includes(r.status.toLowerCase())
    ).length;
    
    // Calculate overdue requests (pending for more than 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const overdueRequests = requests.filter(r => {
      if (!['pending', 'under process'].includes(r.status.toLowerCase())) return false;
      const requestDate = new Date(r.dateCreated);
      return requestDate < sevenDaysAgo;
    }).length;

    // Recent requests (last 30 days)
    const recentRequests = requests
      .filter(r => {
        const requestDate = new Date(r.dateCreated);
        return requestDate >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
      .slice(0, 10);

    // Status distribution
    const statusDistribution: Record<string, number> = {};
    requests.forEach(request => {
      const status = request.status || 'Unknown';
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    // Role-specific distributions
    const result: DashboardData = {
      totalRequests,
      pendingRequests,
      completedRequests,
      overdueRequests,
      recentRequests,
      statusDistribution
    };

    // Add specialty distribution for doctors and admins
    if (['admin', 'doctor'].includes(userRole.toLowerCase())) {
      const specialtyDistribution: Record<string, number> = {};
      requests.forEach(request => {
        const specialty = request.specialty || 'Unknown';
        specialtyDistribution[specialty] = (specialtyDistribution[specialty] || 0) + 1;
      });
      result.specialtyDistribution = specialtyDistribution;
    }

    // Add hospital distribution for admins and case coordinators
    if (['admin', 'case-coordinator'].includes(userRole.toLowerCase())) {
      const hospitalDistribution: Record<string, number> = {};
      requests.forEach(request => {
        const hospital = request.hospitalName || 'Unknown';
        hospitalDistribution[hospital] = (hospitalDistribution[hospital] || 0) + 1;
      });
      result.hospitalDistribution = hospitalDistribution;
    }

    return result;
  }

  // Filter requests for analytics based on user role
  getAnalyticsData(requests: UnifiedRequest[], userRole: string, userInfo?: any): any[] {
    const filteredRequests = this.filterRequestsByRole(requests, userRole, userInfo);
    
    return filteredRequests.map(req => ({
      id: req.id,
      patientMRN: req.patientMRN || req.hospitalMRN || "Unknown MRN",
      type: req.admissionType === "In-Patient" ? "IP" : "OP",
      description: req.serviceDescription || "Medical Request",
      user: req.createdBy || "Unknown",
      status: req.operationStatus === "Done" ? "Completed" : (req.operationStatus || req.status || "Pending"),
      date: req.dateCreated || new Date().toISOString().split('T')[0],
      specialty: req.specialty || "General",
      hospital: req.hospitalName || "Unknown Hospital",
      caseCoordinator: req.assignedCoordinator || req.caseManager || "Unassigned",
      requestDate: req.dateCreated ? `${req.dateCreated}T${req.timeCreated || '00:00'}` : null,
      completionDate: req.status === "Done" || req.status === "Completed" ? new Date() : null,
      serviceDescription: req.serviceDescription || "Unknown Service",
      referredFrom: req.clinicBranch || req.referredFrom || "Unknown",
      admissionType: req.admissionType || "Unknown",
      clinicBranch: req.clinicBranch || "Unknown"
    }));
  }

  // Filter requests based on role and user info
  private filterRequestsByRole(requests: UnifiedRequest[], role: string, userInfo?: any): UnifiedRequest[] {
    switch (role.toLowerCase()) {
      case 'admin':
        return requests; // Admins see all

      case 'doctor':
        return requests.filter(req => 
          req.doctorName === userInfo?.name || 
          req.specialty === userInfo?.specialty ||
          req.createdBy === userInfo?.name
        );

      case 'nurse':
        return requests.filter(req => 
          req.hospitalName === userInfo?.hospital ||
          req.assignedCoordinator === userInfo?.name
        );

      case 'case-coordinator':
        return requests.filter(req => 
          req.assignedCoordinator === userInfo?.name ||
          req.caseManager === userInfo?.name ||
          req.hospitalName === userInfo?.hospital
        );

      case 'hospital':
        return requests.filter(req => 
          req.hospitalName === userInfo?.hospital ||
          req.referredToHospital === userInfo?.hospital
        );

      case 'finance':
        return requests.filter(req => 
          req.hospitalName === userInfo?.hospital &&
          ['completed', 'done'].includes(req.status.toLowerCase())
        );

      case 'customer-care':
        return requests.filter(req => 
          req.assignedCoordinator === userInfo?.name ||
          req.status.toLowerCase().includes('complaint')
        );

      default:
        return [];
    }
  }

  // Get overdue requests for a specific user
  getOverdueRequests(requests: UnifiedRequest[], userRole: string, userInfo?: any): UnifiedRequest[] {
    const userRequests = this.filterRequestsByRole(requests, userRole, userInfo);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return userRequests.filter(req => {
      if (!['pending', 'under process', 'waiting'].includes(req.status.toLowerCase())) {
        return false;
      }
      
      const requestDate = new Date(req.dateCreated);
      return requestDate < sevenDaysAgo;
    });
  }

  // Get requests by status for a specific user
  getRequestsByStatus(requests: UnifiedRequest[], status: string, userRole: string, userInfo?: any): UnifiedRequest[] {
    const userRequests = this.filterRequestsByRole(requests, userRole, userInfo);
    return userRequests.filter(req => 
      req.status.toLowerCase() === status.toLowerCase() ||
      req.operationStatus?.toLowerCase() === status.toLowerCase()
    );
  }
}

export const userDataService = new UserDataService();