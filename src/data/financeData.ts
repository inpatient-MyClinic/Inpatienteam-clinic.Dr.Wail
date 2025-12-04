
import { Transaction } from '@/types/finance';

export const initialTransactions: Transaction[] = [
  {
    id: "FIN001",
    patientName: "Ahmed Mohammed",
    serviceCode: "CSC-001",
    serviceDescription: "Cardiac Surgery Consultation",
    hospital: "King Abdulaziz Hospital",
    doctor: "Dr. Ahmed Al-Rashid",
    specialty: "Cardiology",
    amount: "₹15,000",
    status: "Paid",
    date: "2025-06-15"
  },
  {
    id: "FIN002", 
    patientName: "Fatima Hassan",
    serviceCode: "OJR-002",
    serviceDescription: "Orthopedic Joint Replacement",
    hospital: "Prince Sultan Hospital",
    doctor: "Dr. Sarah Al-Mahmoud",
    specialty: "Orthopedics",
    amount: "₹8,500",
    status: "Pending",
    date: "2025-06-10"
  },
  {
    id: "FIN003",
    patientName: "Omar Ali",
    serviceCode: "GSP-003",
    serviceDescription: "General Surgery Procedure",
    hospital: "Medical Center",
    doctor: "Dr. Mohammed Hassan",
    specialty: "General Surgery",
    amount: "₹12,000",
    status: "Delay Payment",
    date: "2025-06-08"
  },
  {
    id: "FIN004",
    patientName: "Khalid Ibrahim",
    serviceCode: "NEU-004",
    serviceDescription: "Neurology Consultation",
    hospital: "King Fahad Hospital",
    doctor: "Dr. Nasser Al-Otaibi",
    specialty: "Neurology",
    amount: "₹9,200",
    status: "Paid",
    date: "2025-06-12"
  },
  {
    id: "FIN005",
    patientName: "Maryam Abdullah",
    serviceCode: "PED-005",
    serviceDescription: "Pediatric Surgery",
    hospital: "Children's Hospital",
    doctor: "Dr. Layla Mansour",
    specialty: "Pediatrics",
    amount: "₹7,800",
    status: "Pending",
    date: "2025-06-05"
  },
  {
    id: "FIN006",
    patientName: "Youssef Saleh",
    serviceCode: "ONC-006",
    serviceDescription: "Oncology Treatment",
    hospital: "Cancer Center",
    doctor: "Dr. Hani Al-Qahtani",
    specialty: "Oncology",
    amount: "₹25,000",
    status: "Delay Payment",
    date: "2025-06-01"
  },
  {
    id: "FIN007",
    patientName: "Noura Al-Harbi",
    serviceCode: "GYN-007",
    serviceDescription: "Gynecology Procedure",
    hospital: "Women's Health Center",
    doctor: "Dr. Amina Faisal",
    specialty: "Gynecology",
    amount: "₹11,500",
    status: "Paid",
    date: "2025-06-14"
  },
  {
    id: "FIN008",
    patientName: "Sami Al-Dosari",
    serviceCode: "URO-008",
    serviceDescription: "Urology Surgery",
    hospital: "King Abdulaziz Hospital",
    doctor: "Dr. Tariq Al-Shamsi",
    specialty: "Urology",
    amount: "₹18,000",
    status: "Pending",
    date: "2025-06-09"
  },
  {
    id: "FIN009",
    patientName: "Huda Mohammed",
    serviceCode: "DER-009",
    serviceDescription: "Dermatology Treatment",
    hospital: "Skin Care Clinic",
    doctor: "Dr. Reem Hassan",
    specialty: "Dermatology",
    amount: "₹4,500",
    status: "Paid",
    date: "2025-06-13"
  },
  {
    id: "FIN010",
    patientName: "Abdullah Al-Mutairi",
    serviceCode: "ENT-010",
    serviceDescription: "ENT Surgery",
    hospital: "Prince Sultan Hospital",
    doctor: "Dr. Khaled Nasser",
    specialty: "ENT",
    amount: "₹6,800",
    status: "Delay Payment",
    date: "2025-06-03"
  }
];
