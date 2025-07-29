
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

// Updated hospital list - includes all hospitals
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
  // For all other specialties, show general hospitals (excluding eye centers)
  default: [
    "DSAH",
    "DSFH (Basateen Branch)", 
    "Al Salamah Hospital",
    "EMC/ European Medical Center",
    "King's College Hospital",
    "IMC",
    "DSFH (main)"
  ]
};

// Function to get hospitals by specialty
export const getHospitalsBySpecialty = (specialty: string): string[] => {
  return hospitalsBySpecialty[specialty] || hospitalsBySpecialty.default;
};

// Static doctors data - always available for all users
const staticDoctorsBySpecialty = {
  cardiology: [
    { value: "card1", label: "Dr. Ahmed Al-Mansouri", privileges: [...hospitals] },
    { value: "card2", label: "Dr. Sarah Johnson", privileges: [...hospitals] }
  ],
  ent: [
    { value: "ent1", label: "Dr. Omar Hassan", privileges: [...hospitals] },
    { value: "ent2", label: "Dr. Lisa Chen", privileges: [...hospitals] }
  ],
  gastroenterology: [
    { value: "git1", label: "Dr. Mohammed Al-Rashid", privileges: [...hospitals] },
    { value: "git2", label: "Dr. Emily Wilson", privileges: [...hospitals] }
  ],
  general_surgery: [
    { value: "gs1", label: "Dr. Khalid Al-Zahra", privileges: [...hospitals] },
    { value: "gs2", label: "Dr. Michael Brown", privileges: [...hospitals] }
  ],
  neurology: [
    { value: "neuro1", label: "Dr. Fatima Al-Qasimi", privileges: [...hospitals] },
    { value: "neuro2", label: "Dr. David Smith", privileges: [...hospitals] }
  ],
  neurosurgery: [
    { value: "ns1", label: "Dr. Hassan Al-Maktoum", privileges: [...hospitals] },
    { value: "ns2", label: "Dr. Jennifer Davis", privileges: [...hospitals] }
  ],
  obgyn: [
    { value: "obgyn1", label: "Dr. Aisha Al-Nahyan", privileges: [...hospitals] },
    { value: "obgyn2", label: "Dr. Maria Rodriguez", privileges: [...hospitals] }
  ],
  ophthalmology: [
    { value: "opht1", label: "Dr. Saeed Al-Mansouri", privileges: ["Al Batal Eye Centre", "Bin Rushd Eye Center"] },
    { value: "opht2", label: "Dr. Robert Taylor", privileges: ["Al Batal Eye Centre", "Bin Rushd Eye Center"] }
  ],
  orthopedics: [
    { value: "ortho1", label: "Dr. Ali Al-Rashid", privileges: [...hospitals] },
    { value: "ortho2", label: "Dr. James Wilson", privileges: [...hospitals] },
    { value: "ortho3", label: "Dr. Ahmed Al-Zahra", privileges: [...hospitals] }
  ],
  urology: [
    { value: "uro1", label: "Dr. Yousef Al-Maktoum", privileges: [...hospitals] },
    { value: "uro2", label: "Dr. Christopher Lee", privileges: [...hospitals] }
  ],
  vascular_surgery: [
    { value: "vasc1", label: "Dr. Mariam Al-Qasimi", privileges: [...hospitals] },
    { value: "vasc2", label: "Dr. Daniel Martinez", privileges: [...hospitals] }
  ]
};

// Function to get doctors by specialty - loads from user management system
export const getDoctorsBySpecialty = () => {
  console.log('getDoctorsBySpecialty: Loading doctors from user management system');
  
  try {
    const users = loadUsersFromStorage();
    const doctors = users.filter(user => user.category === 'Doctor' && user.status === 'Active');
    
    // Group doctors by specialty
    const doctorsBySpecialty: Record<string, Array<{ value: string; label: string; privileges: string[] }>> = {};
    
    // Initialize all specialties
    specialties.forEach(specialty => {
      doctorsBySpecialty[specialty.value] = [];
    });
    
    // Add doctors to their specialties
    doctors.forEach(doctor => {
      if (doctor.specialty) {
        const doctorData = {
          value: doctor.id,
          label: doctor.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          privileges: doctor.hospitalPrivileges || []
        };
        
        if (doctorsBySpecialty[doctor.specialty]) {
          doctorsBySpecialty[doctor.specialty].push(doctorData);
        }
      }
    });
    
    console.log('getDoctorsBySpecialty: Loaded doctors by specialty:', doctorsBySpecialty);
    return doctorsBySpecialty;
  } catch (error) {
    console.error('Error loading doctors from user management:', error);
    // Fallback to static data if there's an error
    console.log('getDoctorsBySpecialty: Falling back to static data');
    return staticDoctorsBySpecialty;
  }
};

// Export a function that gets fresh data each time
export const getDoctorsBySpecialtyFresh = () => getDoctorsBySpecialty();

// Export the dynamic doctorsBySpecialty - this will be updated when needed
export let doctorsBySpecialty = getDoctorsBySpecialty();

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
