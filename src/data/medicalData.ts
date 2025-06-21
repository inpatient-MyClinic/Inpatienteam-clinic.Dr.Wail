
import { loadUsersFromStorage, User } from "@/components/settings/userManagement/UserStorage";

export const specialties = [
  { value: "gastroenterology", label: "Gastroenterology (GIT)" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "general_surgery", label: "General Surgery" },
  { value: "ent", label: "ENT" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "obgyn", label: "Obstetrics & Gynecology (OB/GYN)" },
  { value: "urology", label: "Urology" },
  { value: "radiology", label: "Radiology" },
  { value: "neurology", label: "Neurology" },
];

export const referralSources = [
  "MCJ1",
  "MCJ2", 
  "MCJ O",
  "MCJ R",
  "MCR"
];

export const hospitals = [
  "King Fahad Hospital",
  "King Faisal Hospital", 
  "King Abdulaziz Hospital",
  "Prince Sultan Hospital"
];

// Dynamic function to get doctors by specialty from User Management
export const getDoctorsBySpecialty = () => {
  const users = loadUsersFromStorage();
  const doctors = users.filter(user => user.category === "Doctor");
  
  const doctorsBySpecialty: Record<string, Array<{ value: string; label: string; privileges: string[] }>> = {};
  
  // Initialize all specialties with empty arrays
  specialties.forEach(specialty => {
    doctorsBySpecialty[specialty.value] = [];
  });
  
  // Group doctors by their specialty
  doctors.forEach(doctor => {
    const specialty = doctor.specialty || "none";
    const displayName = doctor.email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (!doctorsBySpecialty[specialty]) {
      doctorsBySpecialty[specialty] = [];
    }
    
    doctorsBySpecialty[specialty].push({
      value: doctor.id,
      label: `Dr. ${displayName}`,
      privileges: hospitals // For now, give all doctors access to all hospitals
    });
  });
  
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
