
export interface RequestFormData {
  // Auto-captured fields
  dateCreated: string;
  timeCreated: string;
  startTime?: string;
  completionTime?: string;
  
  // Patient Information
  patientName: string;
  patientMRN?: string;
  patientNationalId: string;
  patientMobileNo: string;
  patientPhone?: string;
  email?: string;
  
  // Medical Information - moved up
  specialty: string;
  doctorName: string;
  referredFrom: string;
  referredToHospital: string;
  
  // Hospital Information
  hospitalMRN: string;
  hospitalName: string;
  clinicBranch?: string;
  hospitalFileNumber?: string;
  
  // Service Information
  serviceDescription: string;
  
  // Case Management
  caseManager?: string;
  receivedDocuments?: string;
  smsIntroduction?: string;
  patientContacted?: string;
  preferredCommunication?: string;
  
  // Financial Information
  insuranceType?: string;
  insuranceNumber?: string;
  
  // Dates and Scheduling
  fileOpeningDate?: string;
  orderSubmissionDate?: string;
  agreedBookingDate?: string;
  
  // Order and Approval
  orderSubmission?: string;
  approvalNumber?: string;
  approvalStatus?: string;
  preOpStatus?: string;
  
  // Status and Outcome
  operationStatus?: string;
  reasonPendingCancellation?: string;
  categoryOfFailure?: string;
  
  // Specialty-specific fields
  requiredImplant?: string; // For Orthopedics
  lastMenstrualPeriod?: string; // For OB/GYN
  estimatedDueDate?: string; // For OB/GYN
  
  // DSFH specific field
  opdBookingDate?: string; // For DSFH hospital
  
  // Surgery Details (simplified)
  expectedSurgeryDate: string;
  admissionType: string;
  
  // Notes and History
  history: string;
  notes: string;
  
  // Status fields
  status?: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    user: string;
  }>;
  attachments?: string[];
}

export interface Specialty {
  value: string;
  label: string;
}

export interface Doctor {
  value: string;
  label: string;
  privileges: string[]; // List of hospitals this doctor has privileges at
}
