
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { specialties, doctorsBySpecialty } from "@/data/medicalData";

interface NurseFiltersProps {
  specialtyFilter: string;
  setSpecialtyFilter: (specialty: string) => void;
  doctorFilter: string;
  setDoctorFilter: (doctor: string) => void;
}

export default function NurseFilters({ 
  specialtyFilter,
  setSpecialtyFilter,
  doctorFilter,
  setDoctorFilter
}: NurseFiltersProps) {
  const availableDoctors = specialtyFilter ? 
    doctorsBySpecialty[specialtyFilter as keyof typeof doctorsBySpecialty] || [] : 
    [];

  const clearAllFilters = () => {
    setSpecialtyFilter("all");
    setDoctorFilter("all");
  };

  const hasActiveFilters = Boolean(
    specialtyFilter !== "all" || 
    doctorFilter !== "all"
  );

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Specialty Filter */}
      <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
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

      {/* Doctor Filter */}
      <Select 
        value={doctorFilter} 
        onValueChange={setDoctorFilter}
        disabled={!specialtyFilter || specialtyFilter === "all"}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by Doctor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Doctors</SelectItem>
          {availableDoctors.map((doctor) => (
            <SelectItem key={doctor.value} value={doctor.value}>
              {doctor.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-red-600 hover:text-red-700"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
