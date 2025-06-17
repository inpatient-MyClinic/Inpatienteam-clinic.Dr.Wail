
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserCheck, Stethoscope, Heart, Building2, Users, Calculator, Headphones } from "lucide-react";

const roles = [
  { 
    label: "Doctor", 
    value: "doctor", 
    route: "/doctor-dashboard", 
    icon: Stethoscope,
    color: "bg-blue-600 hover:bg-blue-700",
    description: "View and manage patient requests"
  },
  { 
    label: "Nurse", 
    value: "nurse", 
    route: "/nurse-dashboard", 
    icon: Heart,
    color: "bg-red-600 hover:bg-red-700",
    description: "Assist with patient care coordination"
  },
  { 
    label: "Case Coordinator", 
    value: "coordinator", 
    route: "/case-coordinator-dashboard", 
    icon: Users,
    color: "bg-green-600 hover:bg-green-700",
    description: "Coordinate patient cases and requests"
  },
  { 
    label: "Hospital", 
    value: "hospital", 
    route: "/hospital-dashboard", 
    icon: Building2,
    color: "bg-purple-600 hover:bg-purple-700",
    description: "Manage hospital operations"
  },
  { 
    label: "Finance", 
    value: "finance", 
    route: "/finance-dashboard", 
    icon: Calculator,
    color: "bg-yellow-600 hover:bg-yellow-700",
    description: "Handle financial operations and payments"
  },
  { 
    label: "Customer Care", 
    value: "customer-care", 
    route: "/customer-care-dashboard", 
    icon: Headphones,
    color: "bg-indigo-600 hover:bg-indigo-700",
    description: "Support customers and send surveys"
  },
  { 
    label: "Admin", 
    value: "admin", 
    route: "/admin", 
    icon: UserCheck,
    color: "bg-gray-600 hover:bg-gray-700",
    description: "System administration and analytics"
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Inpatient Management System</h1>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Role</h2>
            <p className="text-gray-600">Choose your role to access the appropriate dashboard</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Button
                  key={role.value}
                  onClick={() => handleRoleSelect(role.route)}
                  className={`h-auto p-6 flex flex-col items-center gap-4 ${role.color} text-white`}
                  variant="default"
                >
                  <Icon size={48} />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">{role.label}</h3>
                    <p className="text-sm opacity-90 mt-1">{role.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm">
        © inpatient Dr. wail
      </footer>
    </div>
  );
}
