
import { useState, useMemo } from 'react';

export interface CaseCoordinatorRequest {
  id: number;
  patientName: string;
  mrn: string;
  serviceDescription: string;
  hospital: string;
  status: string;
  paymentStatus: "Paid" | "Not Paid";
  createdAt: string;
  expectedSurgeryDate: string;
  isDelayed: boolean;
  doctorName: string;
  attachments?: string[];
}

export const COORDINATOR_REQUEST_STATUSES = {
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
} as const;

// Mock data for case coordinator requests
const mockRequests: CaseCoordinatorRequest[] = [
  {
    id: 1,
    patientName: "Ahmed Hassan",
    mrn: "MRN-001",
    serviceDescription: "Cardiac Surgery - Valve Replacement",
    hospital: "King Khaled Hospital",
    status: COORDINATOR_REQUEST_STATUSES.APPROVED_BY_HOSPITAL,
    paymentStatus: "Paid",
    createdAt: "2024-01-15T10:30:00Z",
    expectedSurgeryDate: "2024-02-01",
    isDelayed: false,
    doctorName: "Dr. Ahmed Salem",
    attachments: ["cardiac_report.pdf", "echo_results.pdf"]
  },
  {
    id: 2,
    patientName: "Sara Ali",
    mrn: "MRN-002", 
    serviceDescription: "Orthopedic Surgery - Knee Replacement",
    hospital: "King Abdulaziz Hospital",
    status: COORDINATOR_REQUEST_STATUSES.PENDING,
    paymentStatus: "Not Paid",
    createdAt: "2024-01-16T14:20:00Z",
    expectedSurgeryDate: "2024-02-10",
    isDelayed: false,
    doctorName: "Dr. Mohammed Khalil",
    attachments: ["xray_knee.pdf"]
  },
  {
    id: 3,
    patientName: "Omar Khalil",
    mrn: "MRN-003",
    serviceDescription: "Neurosurgery - Brain Tumor Removal",
    hospital: "King Faisal Hospital", 
    status: COORDINATOR_REQUEST_STATUSES.UNDER_PROCESS,
    paymentStatus: "Paid",
    createdAt: "2024-01-17T09:15:00Z",
    expectedSurgeryDate: "2024-02-15",
    isDelayed: false,
    doctorName: "Dr. Fatima Nour",
    attachments: ["mri_brain.pdf", "ct_scan.pdf"]
  },
  {
    id: 4,
    patientName: "Fatima Nour",
    mrn: "MRN-004",
    serviceDescription: "General Surgery - Appendectomy",
    hospital: "Prince Sultan Hospital",
    status: COORDINATOR_REQUEST_STATUSES.DONE,
    paymentStatus: "Paid",
    createdAt: "2024-01-18T11:45:00Z",
    expectedSurgeryDate: "2024-01-25",
    isDelayed: false,
    doctorName: "Dr. Ali Hassan",
    attachments: ["lab_results.pdf"]
  },
  {
    id: 5,
    patientName: "Mohammed Al-Rashid",
    mrn: "MRN-005",
    serviceDescription: "Plastic Surgery - Reconstruction",
    hospital: "King Fahd Hospital",
    status: COORDINATOR_REQUEST_STATUSES.REJECTED,
    paymentStatus: "Not Paid",
    createdAt: "2024-01-19T16:30:00Z",
    expectedSurgeryDate: "2024-02-20",
    isDelayed: false,
    doctorName: "Dr. Layla Hassan",
    attachments: []
  },
  {
    id: 6,
    patientName: "Layla Hassan",
    mrn: "MRN-006",
    serviceDescription: "Emergency Surgery - Trauma",
    hospital: "National Guard Hospital",
    status: COORDINATOR_REQUEST_STATUSES.DELAYED,
    paymentStatus: "Paid",
    createdAt: "2024-01-20T08:00:00Z",
    expectedSurgeryDate: "2024-01-30",
    isDelayed: true,
    doctorName: "Dr. Omar Khalil",
    attachments: ["trauma_report.pdf", "emergency_notes.pdf"]
  }
];

export function useCaseCoordinatorRequests(coordinatorName: string) {
  const [requests] = useState<CaseCoordinatorRequest[]>(mockRequests);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => 
      request.status !== COORDINATOR_REQUEST_STATUSES.REJECTED
    );
  }, [requests]);

  const updateStatus = (requestId: number, newStatus: string) => {
    console.log(`Updating request ${requestId} status to ${newStatus}`);
    // This would typically update the request status in the backend
  };

  const updatePaymentStatus = (requestId: number, paymentStatus: "Paid" | "Not Paid") => {
    console.log(`Updating request ${requestId} payment status to ${paymentStatus}`);
    // This would typically update the payment status in the backend
  };

  return {
    requests,
    filteredRequests,
    updateStatus,
    updatePaymentStatus
  };
}
