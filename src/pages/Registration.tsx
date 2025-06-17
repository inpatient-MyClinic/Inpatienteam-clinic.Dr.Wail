
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Stethoscope, Heart, Building2, Users, Calculator, Headphones } from "lucide-react";

const roles = [
  { value: "doctor", label: "Doctor", icon: Stethoscope },
  { value: "nurse", label: "Nurse", icon: Heart },
  { value: "case-coordinator", label: "Case Coordinator", icon: Users },
  { value: "hospital", label: "Hospital", icon: Building2 },
  { value: "finance", label: "Finance", icon: Calculator },
  { value: "customer-care", label: "Customer Care", icon: Headphones },
  { value: "admin", label: "Admin", icon: UserCheck },
];

export default function Registration() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    hospital: "",
    specialty: "",
    licenseNumber: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFieldChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration data:", form);
    
    toast({
      title: "Registration Successful",
      description: "Your account has been created successfully.",
    });
    
    // Navigate to role selection after registration
    navigate("/role-selection");
  };

  const getRoleIcon = (roleValue: string) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.icon : UserCheck;
  };

  const selectedRoleIcon = getRoleIcon(form.role);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-900">Inpatient Management System</h1>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Register to access the system</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <Input
                type="text"
                value={form.fullName}
                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <Select value={form.role} onValueChange={(value) => handleFieldChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          {role.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
              <Select value={form.hospital} onValueChange={(value) => handleFieldChange("hospital", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="king-fahad">King Fahad Hospital</SelectItem>
                  <SelectItem value="king-faisal">King Faisal Hospital</SelectItem>
                  <SelectItem value="king-abdulaziz">King Abdulaziz Hospital</SelectItem>
                  <SelectItem value="prince-sultan">Prince Sultan Hospital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(form.role === "doctor" || form.role === "nurse") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <Select value={form.specialty} onValueChange={(value) => handleFieldChange("specialty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="general_surgery">General Surgery</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(form.role === "doctor" || form.role === "nurse") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <Input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) => handleFieldChange("licenseNumber", e.target.value)}
                  required
                  placeholder="Enter your license number"
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Register
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/role-selection")}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm">
        © inpatient Dr. wail
      </footer>
    </div>
  );
}
