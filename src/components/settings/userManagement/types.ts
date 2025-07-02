
export type User = {
  id: string;
  email: string;
  category: string;
  specialty?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  fieldPermissions: Record<string, "none" | "view" | "edit">;
  hospitalPrivileges?: string[];
};

export const userCategories = [
  "Admin",
  "Doctor", 
  "Nurse",
  "Case Coordinator",
  "Hospital",
  "Finance",
  "Customer Service"
];

export const specialties = [
  "Cardiology",
  "Neurology", 
  "Orthopedics",
  "Pediatrics",
  "Surgery",
  "Radiology",
  "Emergency Medicine",
  "Internal Medicine",
  "Dermatology",
  "Psychiatry"
];

export const systemFields = [
  { id: "patientName", name: "Patient Name", required: true },
  { id: "mrn", name: "MRN", required: true },
  { id: "serviceDescription", name: "Service Description", required: true },
  { id: "hospital", name: "Hospital", required: true },
  { id: "status", name: "Status", required: true },
  { id: "assignedDoctor", name: "Assigned Doctor", required: false },
  { id: "phone", name: "Phone", required: false },
  { id: "expectedSurgeryDate", name: "Expected Surgery Date", required: false },
  { id: "paymentStatus", name: "Payment Status", required: false },
  { id: "notes", name: "Notes", required: false }
];

export const defaultFieldPermissions = {
  "Admin": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: "edit" }), {}),
  "Doctor": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: field.id === "paymentStatus" ? "view" : "edit" }), {}),
  "Nurse": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: field.id === "paymentStatus" ? "none" : "edit" }), {}),
  "Case Coordinator": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: "view" }), {}),
  "Hospital": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: "view" }), {}),
  "Finance": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: field.id === "paymentStatus" ? "edit" : "view" }), {}),
  "Customer Service": systemFields.reduce((acc, field) => ({ ...acc, [field.id]: "view" }), {})
};
