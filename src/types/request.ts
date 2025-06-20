
export interface RequestFormData {
  // Auto-captured fields
  dateCreated: string;
  timeCreated: string;
  
  // Patient Information
  patientName: string;
  patientNationalId: string;
  patientMobileNo: string;
  
  // Medical Information - moved up
  specialty: string;
  doctorName: string;
  referredFrom: string;
  referredToHospital: string;
  
  // Hospital Information
  hospitalMRN: string;
  hospitalName: string;
  
  // Service Information
  serviceDescription: string;
  
  // Specialty-specific fields
  requiredImplant?: string; // For Orthopedics
  lastMenstrualPeriod?: string; // For OB/GYN
  estimatedDueDate?: string; // For OB/GYN
  
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
