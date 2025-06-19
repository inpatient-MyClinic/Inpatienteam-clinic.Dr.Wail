
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { specialties, doctorsBySpecialty } from "@/data/medicalData";

export default function NurseHospitalPrivileges() {
  const [privilegeSpecialtyFilter, setPrivilegeSpecialtyFilter] = useState("all");
  const [privilegeDoctorFilter, setPrivilegeDoctorFilter] = useState("all");

  // Mock hospital privileges data with doctors and specialties
  const hospitalPrivileges = [
    { name: "King Khaled Hospital", cases: 12, doctors: ["Dr. Ahmed Salem", "Dr. Sarah Ali"], specialty: "urology" },
    { name: "King Abdulaziz Hospital", cases: 8, doctors: ["Dr. Mohammed Ibrahim"], specialty: "orthopedics" },
    { name: "King Faisal Hospital", cases: 15, doctors: ["Dr. Ahmed Hassan", "Dr. Fatima Al-Zahra"], specialty: "gastroenterology" },
    { name: "Prince Sultan Hospital", cases: 6, doctors: ["Dr. Omar Khalil"], specialty: "cardiology" },
  ];

  const availableDoctorsForPrivilege = privilegeSpecialtyFilter !== "all" ? 
    doctorsBySpecialty[privilegeSpecialtyFilter as keyof typeof doctorsBySpecialty] || [] : 
    [];

  const filteredPrivileges = hospitalPrivileges.filter(hospital => {
    const matchesSpecialty = privilegeSpecialtyFilter === "all" || hospital.specialty === privilegeSpecialtyFilter;
    const matchesDoctor = privilegeDoctorFilter === "all" || hospital.doctors.some(doctor => 
      availableDoctorsForPrivilege.some(d => d.label === doctor && d.value === privilegeDoctorFilter)
    );
    return matchesSpecialty && matchesDoctor;
  });

  const clearPrivilegeFilters = () => {
    setPrivilegeSpecialtyFilter("all");
    setPrivilegeDoctorFilter("all");
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Hospital Privileges</h3>
      
      {/* Privilege Filters */}
      <div className="flex gap-4 mb-4">
        <Select value={privilegeSpecialtyFilter} onValueChange={setPrivilegeSpecialtyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specialties.map((specialty) => (
              <SelectItem key={specialty.value} value={specialty.value}>
                {specialty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={privilegeDoctorFilter} 
          onValueChange={setPrivilegeDoctorFilter}
          disabled={privilegeSpecialtyFilter === "all"}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Doctors</SelectItem>
            {availableDoctorsForPrivilege.map((doctor) => (
              <SelectItem key={doctor.value} value={doctor.value}>
                {doctor.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(privilegeSpecialtyFilter !== "all" || privilegeDoctorFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearPrivilegeFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear Privilege Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrivileges.map((hospital) => (
          <div
            key={hospital.name}
            className="p-4 bg-white rounded-lg border shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-900">{hospital.name}</h4>
              <span className="font-bold text-blue-600 text-lg">{hospital.cases}</span>
            </div>
            <div className="text-gray-600 text-sm">
              {hospital.doctors.join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
