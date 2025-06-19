
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import NurseStats from "./NurseStats";
import NurseAnalytics from "./NurseAnalytics";
import { NurseRequest } from "@/hooks/useNurseRequests";
import { specialties, doctorsBySpecialty } from "@/data/medicalData";

interface NurseSidebarProps {
  currentNurseName: string;
  filteredRequests: NurseRequest[];
  onCreateNewRequest: () => void;
  activeStatusFilter: string | null;
  onStatusFilterClick: (status: string | null) => void;
}

export default function NurseSidebar({ 
  currentNurseName, 
  filteredRequests, 
  onCreateNewRequest,
  activeStatusFilter,
  onStatusFilterClick
}: NurseSidebarProps) {
  const navigate = useNavigate();
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
    <aside className="w-[19rem] bg-blue-50 flex flex-col items-center p-6 border-r">
      <div className="text-center mb-4">
        <img 
          src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
          alt="My Clinic Logo" 
          className="h-8 w-auto mx-auto mb-2"
        />
        <h1 className="text-lg font-bold text-blue-900">Nurse Dashboard</h1>
        <p className="text-xs text-blue-700">{currentNurseName}</p>
      </div>

      <Button className="w-full mb-6" variant="default" onClick={onCreateNewRequest}>
        <Plus className="w-4 h-4 mr-2" />
        Create New Request
      </Button>

      <NurseStats 
        filteredRequests={filteredRequests} 
        activeStatusFilter={activeStatusFilter}
        onStatusFilterClick={onStatusFilterClick}
      />

      {/* Hospital Privileges with Filters */}
      <div className="w-full mt-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Hospital Privileges</h3>
        
        {/* Privilege Filters */}
        <div className="space-y-2 mb-3">
          <Select value={privilegeSpecialtyFilter} onValueChange={setPrivilegeSpecialtyFilter}>
            <SelectTrigger className="w-full text-xs">
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
            <SelectTrigger className="w-full text-xs">
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
              className="w-full text-xs text-red-600 hover:text-red-700"
            >
              Clear Privilege Filters
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {filteredPrivileges.map((hospital) => (
            <div
              key={hospital.name}
              className="p-2 bg-white rounded-lg border text-xs"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700 truncate font-medium">{hospital.name}</span>
                <span className="font-bold text-blue-600">{hospital.cases}</span>
              </div>
              <div className="text-gray-500 text-xs">
                {hospital.doctors.join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <NurseAnalytics filteredRequests={filteredRequests} currentNurseName={currentNurseName} />

      <Button 
        variant="outline"
        onClick={() => navigate("/role-selection")}
        className="w-full flex items-center gap-2 mt-auto border-blue-300 text-blue-700 hover:bg-blue-100"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Roles
      </Button>
    </aside>
  );
}
