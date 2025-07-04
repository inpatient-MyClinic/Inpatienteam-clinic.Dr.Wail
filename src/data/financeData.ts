
import { Transaction } from '@/types/finance';

export const initialTransactions: Transaction[] = [
  {
    id: "FIN001",
    patientName: "Ahmed Mohammed",
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
    serviceDescription: "General Surgery Procedure",
    hospital: "Medical Center",
    doctor: "Dr. Mohammed Hassan",
    specialty: "General Surgery",
    amount: "₹12,000",
    status: "Delay Payment",
    date: "2025-06-08"
  }
];
