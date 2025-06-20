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

export const doctorsBySpecialty = {
  gastroenterology: [
    { value: "dr_ahmed_hassan_git", label: "Dr. Ahmed Hassan", privileges: ["King Fahad Hospital", "King Faisal Hospital"] },
    { value: "dr_fatima_ali_git", label: "Dr. Fatima Ali", privileges: ["King Abdulaziz Hospital", "Prince Sultan Hospital"] },
    { value: "dr_omar_salem_git", label: "Dr. Omar Salem", privileges: ["King Fahad Hospital", "King Abdulaziz Hospital"] },
    { value: "dr_sara_mahmoud_git", label: "Dr. Sara Mahmoud", privileges: ["King Faisal Hospital", "Prince Sultan Hospital"] },
  ],
  orthopedics: [
    { value: "dr_omar_khalil", label: "Dr. Omar Khalil", privileges: ["King Fahad Hospital", "King Faisal Hospital"] },
    { value: "dr_sara_mahmoud", label: "Dr. Sara Mahmoud", privileges: ["King Abdulaziz Hospital"] },
    { value: "dr_mohammed_ibrahim_ortho", label: "Dr. Mohammed Ibrahim", privileges: ["Prince Sultan Hospital", "King Fahad Hospital"] },
    { value: "dr_layla_hassan_ortho", label: "Dr. Layla Hassan", privileges: ["King Faisal Hospital", "King Abdulaziz Hospital"] },
    { value: "dr_khaled_ahmed_ortho", label: "Dr. Khaled Ahmed", privileges: ["King Fahad Hospital", "Prince Sultan Hospital"] },
  ],
  general_surgery: [
    { value: "dr_khaled_ahmed", label: "Dr. Khaled Ahmed", privileges: ["King Fahad Hospital", "King Faisal Hospital"] },
    { value: "dr_layla_omar", label: "Dr. Layla Omar", privileges: ["King Abdulaziz Hospital", "Prince Sultan Hospital"] },
    { value: "dr_ali_salem_surgery", label: "Dr. Ali Salem", privileges: ["King Fahad Hospital", "King Abdulaziz Hospital"] },
    { value: "dr_nora_hassan_surgery", label: "Dr. Nora Hassan", privileges: ["King Faisal Hospital", "Prince Sultan Hospital"] },
  ],
  ent: [
    { value: "dr_ahmed_farouk_ent", label: "Dr. Ahmed Farouk", privileges: ["King Fahad Hospital", "King Faisal Hospital"] },
    { value: "dr_maryam_ali_ent", label: "Dr. Maryam Ali", privileges: ["King Abdulaziz Hospital"] },
    { value: "dr_omar_hassan_ent", label: "Dr. Omar Hassan", privileges: ["Prince Sultan Hospital", "King Fahad Hospital"] },
    { value: "dr_fatima_salem_ent", label: "Dr. Fatima Salem", privileges: ["King Faisal Hospital", "King Abdulaziz Hospital"] },
  ],
  ophthalmology: [
    { value: "dr_sara_ibrahim_eye", label: "Dr. Sara Ibrahim", privileges: ["King Fahad Hospital", "King Faisal Hospital"] },
    { value: "dr_mohammed_omar_eye", label: "Dr. Mohammed Omar", privileges: ["King Abdulaziz Hospital", "Prince Sultan Hospital"] },
    { value: "dr_layla_ahmed_eye", label: "Dr. Layla Ahmed", privileges: ["King Fahad Hospital", "King Abdulaziz Hospital"] },
    { value: "dr_khaled_hassan_eye", label: "Dr. Khaled Hassan", privileges: ["King Faisal Hospital", "Prince Sultan Hospital"] },
  ],
  obgyn: [
    { value: "dr_fatima_mahmoud_obgyn", label: "Dr. Fatima Mahmoud", privileges: ["King Fahad Hospital", "King Faisal Hospital"] },
    { value: "dr_sara_ali_obgyn", label: "Dr. Sara Ali", privileges: ["King Abdulaziz Hospital"] },
    { value: "dr_maryam_hassan_obgyn", label: "Dr. Maryam Hassan", privileges: ["Prince Sultan Hospital", "King Fahad Hospital"] },
    { value: "dr_nora_salem_obgyn", label: "Dr. Nora Salem", privileges: ["King Faisal Hospital", "King Abdulaziz Hospital"] },
  ],
  urology: [
    { value: "dr_omar_ibrahim_uro", label: "Dr. Omar Ibrahim", privileges: ["King Fahad Hospital", "King Faisal Hospital"] },
    { value: "dr_ahmed_salem_uro", label: "Dr. Ahmed Salem", privileges: ["King Abdulaziz Hospital", "Prince Sultan Hospital"] },
    { value: "dr_khaled_ali_uro", label: "Dr. Khaled Ali", privileges: ["King Fahad Hospital", "King Abdulaziz Hospital"] },
    { value: "dr_mohammed_hassan_uro", label: "Dr. Mohammed Hassan", privileges: ["King Faisal Hospital", "Prince Sultan Hospital"] },
  ],
  radiology: [
    { value: "dr_sara_hassan_rad", label: "Dr. Sara Hassan", privileges: ["King Fahad Hospital", "King Faisal Hospital"] },
    { value: "dr_ahmed_omar_rad", label: "Dr. Ahmed Omar", privileges: ["King Abdulaziz Hospital"] },
    { value: "dr_fatima_ibrahim_rad", label: "Dr. Fatima Ibrahim", privileges: ["Prince Sultan Hospital", "King Fahad Hospital"] },
    { value: "dr_layla_salem_rad", label: "Dr. Layla Salem", privileges: ["King Faisal Hospital", "King Abdulaziz Hospital"] },
  ],
  neurology: [
    { value: "dr_mohamed_ibrahim", label: "Dr. Mohamed Ibrahim", privileges: ["King Fahad Hospital", "King Faisal Hospital"] },
    { value: "dr_nora_hassan", label: "Dr. Nora Hassan", privileges: ["King Abdulaziz Hospital", "Prince Sultan Hospital"] },
    { value: "dr_omar_ali_neuro", label: "Dr. Omar Ali", privileges: ["King Fahad Hospital", "King Abdulaziz Hospital"] },
    { value: "dr_sara_salem_neuro", label: "Dr. Sara Salem", privileges: ["King Faisal Hospital", "Prince Sultan Hospital"] },
  ],
};

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
