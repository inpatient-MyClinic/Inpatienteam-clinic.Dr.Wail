
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { requestStorage, StoredRequest } from "@/services/requestStorage";

// Request workflow statuses
export const REQUEST_STATUSES = {
  PENDING: "Pending",
  UNDER_PROCESS: "Under Process", 
  PATIENT_CONTACTED: "Patient Contacted",
  SUBMITTED_TO_INSURANCE: "Submitted to Insurance",
  APPROVED_BY_HOSPITAL: "Approved by Hospital",
  REJECTED: "Rejected",
  DONE: "Done",
  NEED_JUSTIFICATION: "Need Justification",
  NOT_COMPLETED: "Not Completed",
  DELAYED: "Delayed"
};

export interface NurseRequest {
  id: number;
  patientName: string;
  mrn: string;
  serviceDescription: string;
  hospital: string;
  status: string;
  assignedDoctor: string;
  assignedDoctorValue: string;
  specialty: string;
  createdAt: string;
  phone: string;
  expectedSurgeryDate: string;
  createdBy: string;
  attachments: string[];
  isDelayed: boolean;
  notifications: string[];
}

// Convert StoredRequest to NurseRequest format
const convertToNurseRequest = (req: StoredRequest): NurseRequest => ({
  id: req.id,
  patientName: req.patientName || '',
  mrn: req.hospitalMRN || '',
  serviceDescription: req.serviceDescription || '',
  hospital: req.hospitalName || req.referredToHospital || '',
  status: req.status || REQUEST_STATUSES.PENDING,
  assignedDoctor: req.assignedDoctor || req.doctorName || '',
  assignedDoctorValue: req.assignedDoctor || req.doctorName || '',
  specialty: req.specialty || '',
  createdAt: req.dateCreated ? `${req.dateCreated}T${req.timeCreated || '00:00'}:00Z` : new Date().toISOString(),
  phone: req.patientMobileNo || '',
  expectedSurgeryDate: req.expectedSurgeryDate || '',
  createdBy: req.createdBy || 'Unknown',
  attachments: req.attachments || [],
  isDelayed: req.isDelayed || false,
  notifications: req.notifications || []
});

export const useNurseRequests = (currentNurseName: string) => {
  const { toast } = useToast();
  
  // Initialize storage data on first load
  useEffect(() => {
    requestStorage.initializeSampleData();
  }, []);

  // Get requests from centralized storage
  const [requests, setRequests] = useState<NurseRequest[]>([]);

  // Load requests on component mount and when storage changes
  useEffect(() => {
    const loadRequests = () => {
      const storedRequests = requestStorage.getAllRequests();
      const convertedRequests = storedRequests.map(convertToNurseRequest);
      setRequests(convertedRequests);
    };

    loadRequests();
    
    // Set up storage change listener
    const handleStorageChange = () => loadRequests();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for delayed requests
  useEffect(() => {
    const checkDelayedRequests = () => {
      const now = new Date();
      const businessStart = 9; // 9 AM
      const businessEnd = 20; // 8 PM
      
      setRequests(prev => prev.map(req => {
        if (req.status === REQUEST_STATUSES.PENDING) {
          const createdTime = new Date(req.createdAt);
          const hoursDiff = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
          
          const currentHour = now.getHours();
          const isBusinessHours = currentHour >= businessStart && currentHour <= businessEnd;
          
          if (hoursDiff >= 4 && isBusinessHours && !req.isDelayed) {
            return {
              ...req,
              isDelayed: true,
              status: REQUEST_STATUSES.DELAYED,
              notifications: [...req.notifications, "Request automatically forwarded to hospital due to delay"]
            };
          }
        }
        return req;
      }));
    };

    const interval = setInterval(checkDelayedRequests, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle notifications for incomplete requests
  useEffect(() => {
    const incompleteRequests = requests.filter(req => req.status === REQUEST_STATUSES.NOT_COMPLETED);
    incompleteRequests.forEach(req => {
      toast({
        title: "Action Required",
        description: `Request ${req.id} for ${req.patientName} needs completion`,
        variant: "destructive",
      });
    });
  }, [requests, toast]);

  const updateStatus = (requestId: number, newStatus: string) => {
    // Update in centralized storage
    requestStorage.updateRequest(requestId, { 
      status: newStatus,
      notifications: [...(requestStorage.getAllRequests().find(r => r.id === requestId)?.notifications || []), `Status updated to ${newStatus}`]
    });

    // Update local state
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { 
          ...req, 
          status: newStatus,
          notifications: [...req.notifications, `Status updated to ${newStatus}`]
        } : req
      )
    );

    toast({
      title: "Status Updated",
      description: `Request ${requestId} status changed to ${newStatus}`,
    });
  };

  // Filter to show only requests created by this nurse
  const filteredRequests = requests.filter(request => 
    request.createdBy === currentNurseName
  );

  return {
    requests,
    filteredRequests,
    updateStatus
  };
};
