
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  specialtyFilter: string;
  setSpecialtyFilter: (value: string) => void;
  doctorFilter: string;
  setDoctorFilter: (value: string) => void;
}

export default function FilterBar({
  specialtyFilter,
  setSpecialtyFilter,
  doctorFilter,
  setDoctorFilter
}: FilterBarProps) {
  const specialties = [
    { value: "all", label: "All Specialties" },
    { value: "urology", label: "Urology" },
    { value: "orthopedics", label: "Orthopedics" },
    { value: "gastroenterology", label: "Gastroenterology" },
    { value: "cardiology", label: "Cardiology" }
  ];

  const doctors = [
    { value: "all", label: "All Doctors" },
    { value: "dr_ahmed_salem_uro", label: "Dr. Ahmed Salem" },
    { value: "dr_sara_ali_ortho", label: "Dr. Sara Ali" },
    { value: "dr_khalid_hassan_gastro", label: "Dr. Khalid Hassan" }
  ];

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Specialty:</label>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((specialty) => (
              <SelectItem key={specialty.value} value={specialty.value}>
                {specialty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Doctor:</label>
        <Select value={doctorFilter} onValueChange={setDoctorFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.value} value={doctor.value}>
                {doctor.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
