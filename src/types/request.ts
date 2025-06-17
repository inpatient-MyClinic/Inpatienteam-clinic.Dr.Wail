
export interface RequestFormData {
  patientName: string;
  patientNationalId: string;
  patientMobileNo: string;
  hospitalMRN: string;
  hospitalName: string;
  specialty: string;
  doctorName: string;
  serviceDescription: string;
  expectedSurgeryDate: string;
  admissionType: string;
  expectedRevenue: string;
  actualRevenue: string;
  history: string;
  notes: string;
}

export interface Specialty {
  value: string;
  label: string;
}

export interface Doctor {
  value: string;
  label: string;
}
