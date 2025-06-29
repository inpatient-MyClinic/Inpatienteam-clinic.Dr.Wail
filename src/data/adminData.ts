
// Sample admin data with additional fields for analytics
export const adminData = [
  {
    id: "ADM001",
    type: "User Management",
    description: "New doctor registration",
    user: "Dr. Ahmed Salem",
    status: "Pending",
    date: "2025-06-20",
    priority: "High",
    specialty: "Cardiology",
    hospital: "King Abdulaziz Hospital",
    caseCoordinator: "Sarah Al-Mahmoud",
    requestDate: new Date("2025-06-18"),
    completionDate: null
  },
  {
    id: "ADM002",
    type: "System Settings",
    description: "Hospital privilege update",
    user: "Admin",
    status: "Completed",
    date: "2025-06-19",
    priority: "Medium",
    specialty: "Orthopedics",
    hospital: "Prince Sultan Hospital",
    caseCoordinator: "Ahmed Hassan",
    requestDate: new Date("2025-06-17"),
    completionDate: new Date("2025-06-19")
  },
  {
    id: "ADM003",
    type: "Reports",
    description: "Monthly analytics report",
    user: "Finance Team",
    status: "In Progress",
    date: "2025-06-18",
    priority: "Low",
    specialty: "General Surgery",
    hospital: "Medical Center",
    caseCoordinator: "Fatima Ali",
    requestDate: new Date("2025-06-16"),
    completionDate: null
  }
];
