
import { useState, useMemo, useEffect } from 'react';
import { isWithinInterval, parseISO, differenceInHours, isAfter, isBefore, setHours } from 'date-fns';
import { requestStorage, StoredRequest } from "@/services/requestStorage";

export interface CaseCoordinatorRequest {
  id: number;
  patientName: string;
  mrn: string;
  serviceDescription: string;
  hospital: string;
  status: string;
  createdAt: string;
  expectedSurgeryDate: string;
  agreedSurgeryDate?: string;
  isDelayed: boolean;
  doctorName: string;
  assignedDoctor: string;
  attachments?: string[];
  assignedCoordinator?: string;
  coordinatorActionTime?: string;
  delayCause?: "doctor" | "hospital" | "insurance" | "patient";
}

export const COORDINATOR_REQUEST_STATUSES = {
  NEW_REQUEST: "New Request",
  PENDING: "Pending",
  UNDER_PROCESS: "Under Process", 
  PATIENT_CONTACTED: "Patient Contacted",
  SUBMITTED_TO_INSURANCE: "Submitted to Insurance",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DONE: "Done",
  NEED_JUSTIFICATION: "Need Justification",
  NOT_COMPLETED: "Not Completed",
  DELAYED: "Delayed",
  SCHEDULED: "Scheduled",
  POSTPONED: "Postponed",
  CANCELLED: "Cancelled"
} as const;

// Mock data for case coordinator requests
const mockRequests: CaseCoordinatorRequest[] = [
  {
    id: 1,
    patientName: "Ahmed Hassan",
    mrn: "MRN-001",
    serviceDescription: "Cardiac Surgery - Valve Replacement",
    hospital: "King Khaled Hospital",
    status: COORDINATOR_REQUEST_STATUSES.APPROVED,
    createdAt: "2024-01-15T10:30:00Z",
    expectedSurgeryDate: "2024-02-01",
    agreedSurgeryDate: "2024-02-03",
    isDelayed: false,
    doctorName: "Dr. Ahmed Salem",
    assignedDoctor: "Dr. Ahmed Salem",
    assignedCoordinator: "Sarah Johnson",
    coordinatorActionTime: "2024-01-15T11:00:00Z",
    attachments: ["cardiac_report.pdf", "echo_results.pdf"],
    delayCause: "hospital"
  },
  {
    id: 2,
    patientName: "Sara Ali",
    mrn: "MRN-002", 
    serviceDescription: "Orthopedic Surgery - Knee Replacement",
    hospital: "King Abdulaziz Hospital",
    status: COORDINATOR_REQUEST_STATUSES.PENDING,
    createdAt: "2024-01-16T14:20:00Z",
    expectedSurgeryDate: "2024-02-10",
    agreedSurgeryDate: "2024-02-12",
    isDelayed: false,
    doctorName: "Dr. Mohammed Khalil",
    assignedDoctor: "Dr. Mohammed Khalil",
    assignedCoordinator: "Sarah Johnson",
    attachments: ["xray_knee.pdf"],
    delayCause: "doctor"
  },
  {
    id: 3,
    patientName: "Omar Khalil",
    mrn: "MRN-003",
    serviceDescription: "Neurosurgery - Brain Tumor Removal",
    hospital: "King Faisal Hospital", 
    status: COORDINATOR_REQUEST_STATUSES.UNDER_PROCESS,
    createdAt: "2024-01-17T09:15:00Z",
    expectedSurgeryDate: "2024-02-15",
    isDelayed: false,
    doctorName: "Dr. Fatima Nour",
    assignedDoctor: "Dr. Fatima Nour",
    assignedCoordinator: "Sarah Johnson",
    coordinatorActionTime: "2024-01-17T10:00:00Z",
    attachments: ["mri_brain.pdf", "ct_scan.pdf"],
    delayCause: "insurance"
  },
  {
    id: 4,
    patientName: "Fatima Nour",
    mrn: "MRN-004",
    serviceDescription: "General Surgery - Appendectomy",
    hospital: "Prince Sultan Hospital",
    status: COORDINATOR_REQUEST_STATUSES.DONE,
    createdAt: "2024-01-18T11:45:00Z",
    expectedSurgeryDate: "2024-01-25",
    agreedSurgeryDate: "2024-01-25",
    isDelayed: false,
    doctorName: "Dr. Ali Hassan",
    assignedDoctor: "Dr. Ali Hassan",
    assignedCoordinator: "Sarah Johnson",
    coordinatorActionTime: "2024-01-18T12:15:00Z",
    attachments: ["lab_results.pdf"],
    delayCause: "patient"
  },
  {
    id: 5,
    patientName: "Mohammed Al-Rashid",
    mrn: "MRN-005",
    serviceDescription: "Plastic Surgery - Reconstruction",
    hospital: "King Fahd Hospital",
    status: COORDINATOR_REQUEST_STATUSES.REJECTED,
    createdAt: "2024-01-19T16:30:00Z",
    expectedSurgeryDate: "2024-02-20",
    isDelayed: false,
    doctorName: "Dr. Layla Hassan",
    assignedDoctor: "Dr. Layla Hassan",
    attachments: [],
    delayCause: "insurance"
  },
  {
    id: 6,
    patientName: "Layla Hassan",
    mrn: "MRN-006",
    serviceDescription: "Emergency Surgery - Trauma",
    hospital: "National Guard Hospital",
    status: COORDINATOR_REQUEST_STATUSES.SCHEDULED,
    createdAt: "2024-01-20T08:00:00Z",
    expectedSurgeryDate: "2024-01-30",
    agreedSurgeryDate: "2024-02-02",
    isDelayed: true,
    doctorName: "Dr. Omar Khalil",
    assignedDoctor: "Dr. Omar Khalil",
    assignedCoordinator: "John Doe",
    coordinatorActionTime: "2024-01-20T15:00:00Z",
    attachments: ["trauma_report.pdf", "emergency_notes.pdf"],
    delayCause: "hospital"
  }
];

function isOverdue(request: CaseCoordinatorRequest): boolean {
  const createdAt = parseISO(request.createdAt);
  const workStart = setHours(createdAt, 10); // 10 AM
  const workEnd = setHours(createdAt, 20); // 8 PM
  
  // Check if request was created during work hours
  if (isAfter(createdAt, workStart) && isBefore(createdAt, workEnd)) {
    const actionTime = request.coordinatorActionTime ? parseISO(request.coordinatorActionTime) : null;
    if (!actionTime) {
      // No action taken, check if 4 hours have passed
      return differenceInHours(new Date(), createdAt) > 4;
    } else {
      // Action taken, check if it was within 4 hours
      return differenceInHours(actionTime, createdAt) > 4;
    }
  }
  return false;
}

// Convert StoredRequest to CaseCoordinatorRequest format
const convertToCaseCoordinatorRequest = (req: StoredRequest): CaseCoordinatorRequest => ({
  id: req.id,
  patientName: req.patientName || '',
  mrn: req.hospitalMRN || '',
  serviceDescription: req.serviceDescription || '',
  hospital: req.hospitalName || req.referredToHospital || '',
  status: req.status || COORDINATOR_REQUEST_STATUSES.PENDING,
  createdAt: req.dateCreated ? `${req.dateCreated}T${req.timeCreated || '00:00'}:00Z` : new Date().toISOString(),
  expectedSurgeryDate: req.expectedSurgeryDate || '',
  agreedSurgeryDate: req.agreedSurgeryDate,
  isDelayed: req.isDelayed || false,
  doctorName: req.doctorName || '',
  assignedDoctor: req.assignedDoctor || req.doctorName || '',
  attachments: req.attachments || [],
  assignedCoordinator: req.assignedCoordinator,
  coordinatorActionTime: req.coordinatorActionTime,
  delayCause: req.delayCause
});

export function useCaseCoordinatorRequests(coordinatorName: string) {
  const [requests, setRequests] = useState<CaseCoordinatorRequest[]>([]);

  // Initialize storage data and load requests
  useEffect(() => {
    requestStorage.initializeSampleData();
    
    const loadRequests = () => {
      // Debug localStorage content
      const rawData = localStorage.getItem('medicalRequests');
      console.log('Case Coordinator - Raw localStorage data:', rawData);
      
      const storedRequests = requestStorage.getAllRequests();
      const convertedRequests = storedRequests.map(convertToCaseCoordinatorRequest);
      console.log('Case Coordinator - All stored requests:', storedRequests);
      console.log('Case Coordinator - Converted requests:', convertedRequests);
      console.log('Case Coordinator - Total requests found:', convertedRequests.length);
      setRequests(convertedRequests);
    };

    loadRequests();
    
    // Set up storage change listener and custom request update listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'medical_requests') {
        console.log('Case Coordinator - Storage changed, reloading requests...');
        loadRequests();
      }
    };
    const handleRequestsUpdate = () => {
      console.log('Case Coordinator - Requests updated, reloading...');
      loadRequests();
    };
    
    // Also set up a periodic check every 2 seconds to ensure data is fresh
    const intervalId = setInterval(() => {
      loadRequests();
    }, 2000);
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('requestsUpdated', handleRequestsUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('requestsUpdated', handleRequestsUpdate);
      clearInterval(intervalId);
    };
  }, []);

  const allRequests = useMemo(() => requests, [requests]);
  
  const coordinatorRequests = useMemo(() => {
    // Show all requests - case coordinators should see everything to manage workload
    return requests;
  }, [requests]);

  const overdueRequests = useMemo(() => {
    return coordinatorRequests.filter(request => isOverdue(request));
  }, [coordinatorRequests]);

  const updateStatus = (requestId: number, newStatus: string) => {
    // Update in centralized storage
    requestStorage.updateRequest(requestId, { status: newStatus });
    
    // Update local state
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus }
          : request
      )
    );
    
    console.log(`Updating request ${requestId} status to ${newStatus}`);
  };

  const assignToCoordinator = (requestId: number, coordinatorName: string) => {
    const actionTime = new Date().toISOString();
    
    // Update in centralized storage
    requestStorage.updateRequest(requestId, { 
      assignedCoordinator: coordinatorName, 
      coordinatorActionTime: actionTime 
    });
    
    // Update local state
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === requestId 
          ? { ...request, assignedCoordinator: coordinatorName, coordinatorActionTime: actionTime }
          : request
      )
    );
    
    console.log(`Assigned request ${requestId} to ${coordinatorName}`);
  };

  return {
    requests,
    allRequests,
    coordinatorRequests,
    overdueRequests,
    updateStatus,
    assignToCoordinator
  };
}
