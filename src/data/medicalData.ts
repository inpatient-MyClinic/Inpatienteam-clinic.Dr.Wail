
import { loadUsersFromStorage, User } from "@/components/settings/userManagement/UserStorage";

export const specialties = [
  { value: "cardiology", label: "Cardiology" },
  { value: "ent", label: "ENT" },
  { value: "gastroenterology", label: "GIT (Gastroenterology)" },
  { value: "general_surgery", label: "General Surgery" },
  { value: "neurology", label: "Neurology" },
  { value: "neurosurgery", label: "Neurosurgery" },
  { value: "obgyn", label: "OBGYN" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "orthopedics", label: "Orthopaedic" },
  { value: "urology", label: "Urology" },
  { value: "vascular_surgery", label: "Vascular Surgery" },
];

export const referralSources = [
  "MCJ1",
  "MCJ2", 
  "MCJ O",
  "MCJ R",
  "MCR"
];

// Updated hospital list - eye centers removed from general list
export const hospitals = [
  "DSAH",
  "DSFH (Basateen Branch)", 
  "Al Salamah Hospital",
  "EMC/ European Medical Center",
  "King's College Hospital",
  "IMC",
  "DSFH (main)"
];

// Hospitals filtered by specialty
export const hospitalsBySpecialty: Record<string, string[]> = {
  ophthalmology: [
    "Al Batal Eye Centre",
    "Bin Rushd Eye Center"
  ],
  // For all other specialties, show all hospitals (without eye centers)
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
    let specialty = doctor.specialty?.toLowerCase().replace(/\s+/g, '_').trim() || "none";
    
    // Handle specialty mapping variations
    if (specialty === "orthopedic") specialty = "orthopedics";
    if (specialty.includes("vascular_surgery") || specialty.includes("vascular")) specialty = "vascular_surgery";
    if (specialty.includes("obgyn") || specialty.includes("obstetrics")) specialty = "obgyn";
    if (specialty.includes("git") || specialty.includes("gastroenterology")) specialty = "gastroenterology";
    if (specialty === "neurosurgery") specialty = "neurosurgery";
    
    // Remove trailing underscores
    specialty = specialty.replace(/_+$/, '');
    
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
  cardiology: [
    "Cardiac Catheterization",
    "Angioplasty",
    "Pacemaker Implantation",
    "Heart Valve Surgery",
    "Coronary Artery Bypass",
    "Echocardiogram",
    "Stress Test",
  ],
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
  neurology: [
    "Brain Tumor Surgery",
    "Spinal Cord Surgery", 
    "Epilepsy Surgery",
    "Deep Brain Stimulation",
    "Aneurysm Surgery",
    "Stroke Intervention",
    "Peripheral Nerve Surgery",
  ],
  neurosurgery: [
    "Brain Tumor Surgery",
    "Spinal Cord Surgery",
    "Aneurysm Surgery", 
    "Deep Brain Stimulation",
    "Epilepsy Surgery",
    "Craniotomy",
    "Spinal Fusion",
  ],
  vascular_surgery: [
    "Aortic Aneurysm Repair",
    "Carotid Endarterectomy",
    "Peripheral Bypass Surgery",
    "Varicose Vein Treatment",
    "Arteriovenous Fistula Creation",
    "Thrombectomy",
    "Stent Placement",
  ],
};
