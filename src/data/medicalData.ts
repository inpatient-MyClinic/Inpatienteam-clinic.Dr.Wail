import { loadUsersFromStorage, User } from "@/components/settings/userManagement/UserStorage";

export const specialties = [
  { value: "gastroenterology", label: "Gastroenterology (GIT)" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "orthopedic", label: "Orthopedic" }, // Add variant
  { value: "general_surgery", label: "General Surgery" },
  { value: "ent", label: "ENT" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "obgyn", label: "Obstetrics & Gynecology (OB/GYN)" },
  { value: "urology", label: "Urology" },
  { value: "radiology", label: "Radiology" },
  { value: "neurology", label: "Neurology" },
  { value: "neurosurgery", label: "Neurosurgery" }, // Add missing specialty
  { value: "vascular_surgery", label: "Vascular Surgery" }, // Add missing specialty
];

export const referralSources = [
  "MCJ1",
  "MCJ2", 
  "MCJ O",
  "MCJ R",
  "MCR"
];

// Updated hospital list
export const hospitals = [
  "DSAH",
  "DSFH (Basateen Branch)", 
  "Al Salamah Hospital",
  "EMC/ European Medical Center",
  "King's College Hospital",
  "IMC",
  "DSFH (main)",
  "Al Batal Eye Centre",
  "Bin Rushd Eye Center"
];

// Hospitals filtered by specialty
export const hospitalsBySpecialty: Record<string, string[]> = {
  ophthalmology: [
    "Al Batal Eye Centre",
    "Bin Rushd Eye Center"
  ],
  // For all other specialties, show all hospitals
  default: hospitals
};

// Function to get hospitals by specialty
export const getHospitalsBySpecialty = (specialty: string): string[] => {
  return hospitalsBySpecialty[specialty] || hospitalsBySpecialty.default;
};

// Dynamic function to get doctors by specialty from User Management
export const getDoctorsBySpecialty = () => {
  const users = loadUsersFromStorage();
  const doctors = users.filter(user => user.category === "Doctor");
  
  console.log('Processing doctors for specialty grouping:', doctors);
  
  const doctorsBySpecialty: Record<string, Array<{ value: string; label: string; privileges: string[] }>> = {};
  
  // Initialize all specialties with empty arrays
  specialties.forEach(specialty => {
    doctorsBySpecialty[specialty.value] = [];
  });
  
  // Group doctors by their specialty
  doctors.forEach(doctor => {
    let specialty = doctor.specialty?.toLowerCase().replace(/\s+/g, '_') || "none";
    
    // Handle specialty mapping variations
    if (specialty === "orthopedic") specialty = "orthopedics";
    if (specialty === "vascular_surgery") specialty = "vascular_surgery";
    if (specialty.includes("obgyn") || specialty.includes("obstetrics")) specialty = "obgyn";
    
    const displayName = doctor.email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    console.log(`Mapping doctor ${doctor.email} with specialty "${doctor.specialty}" to group "${specialty}"`);
    
    if (!doctorsBySpecialty[specialty]) {
      doctorsBySpecialty[specialty] = [];
    }
    
    doctorsBySpecialty[specialty].push({
      value: doctor.id,
      label: `Dr. ${displayName}`,
      privileges: hospitals // For now, give all doctors access to all hospitals
    });
  });
  
  console.log('Final doctors by specialty:', doctorsBySpecialty);
  return doctorsBySpecialty;
};

// Export the dynamic doctorsBySpecialty
export const doctorsBySpecialty = getDoctorsBySpecialty();

export const servicesBySpecialty = {
  gastroenterology: [
    "Upper Endoscopy",
    "Colonoscopy",
    "ERCP (Endoscopic Retrograde Cholangiopancreatography)",
    "Liver Biopsy",
    "Gastric Band Surgery",
    "Gallbladder Surgery",
    "Hernia Repair",
  ],
  orthopedics: [
    "Joint Replacement Surgery (Hip/Knee)",
    "Arthroscopic Surgery",
    "Fracture Repair",
    "Spine Surgery",
    "Sports Injury Treatment",
    "Bone Tumor Surgery",
    "Limb Reconstruction",
  ],
  general_surgery: [
    "Appendectomy",
    "Gallbladder Surgery (Laparoscopic)",
    "Hernia Repair",
    "Bowel Surgery",
    "Thyroid Surgery",
    "Breast Surgery",
    "Abdominal Surgery",
  ],
  ent: [
    "Tonsillectomy",
    "Adenoidectomy",
    "Sinus Surgery",
    "Ear Surgery (Tympanoplasty)",
    "Nose Surgery (Rhinoplasty)",
    "Throat Surgery",
    "Hearing Implant Surgery",
  ],
  ophthalmology: [
    "Cataract Surgery",
    "Retinal Surgery",
    "Glaucoma Surgery",
    "Corneal Transplant",
    "LASIK Surgery",
    "Eyelid Surgery",
    "Diabetic Eye Treatment",
  ],
  obgyn: [
    "Cesarean Section",
    "Hysterectomy",
    "Ovarian Surgery",
    "Fibroid Removal",
    "Endometriosis Treatment",
    "Fertility Surgery",
    "High-Risk Pregnancy Management",
  ],
  urology: [
    "Kidney Stone Removal",
    "Prostate Surgery",
    "Bladder Surgery",
    "Kidney Surgery",
    "Ureter Surgery",
    "Male Fertility Surgery",
    "Urinary Incontinence Surgery",
  ],
  radiology: [
    "CT-Guided Biopsy",
    "Interventional Radiology",
    "Angiography",
    "Embolization Procedures",
    "Drainage Procedures",
    "Stent Placement",
    "Radiofrequency Ablation",
  ],
  neurology: [
    "Brain Tumor Surgery",
    "Spinal Cord Surgery",
    "Epilepsy Surgery",
    "Deep Brain Stimulation",
    "Aneurysm Surgery",
    "Stroke Intervention",
    "Peripheral Nerve Surgery",
  ],
};
