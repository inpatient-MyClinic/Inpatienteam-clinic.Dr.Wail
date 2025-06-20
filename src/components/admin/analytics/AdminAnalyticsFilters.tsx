
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminAnalyticsFiltersProps {
  filterBy: string;
  selectedSpecialty: string;
  selectedHospital: string;
  selectedDoctor: string;
  selectedCoordinator: string;
  specialties: string[];
  hospitals: string[];
  doctors: string[];
  coordinators: string[];
  onFilterByChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onHospitalChange: (value: string) => void;
  onDoctorChange: (value: string) => void;
  onCoordinatorChange: (value: string) => void;
}

export default function AdminAnalyticsFilters({
  filterBy,
  selectedSpecialty,
  selectedHospital,
  selectedDoctor,
  selectedCoordinator,
  specialties,
  hospitals,
  doctors,
  coordinators,
  onFilterByChange,
  onSpecialtyChange,
  onHospitalChange,
  onDoctorChange,
  onCoordinatorChange
}: AdminAnalyticsFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Filters</CardTitle>
        <CardDescription>Filter analytics by various criteria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedHospital} onValueChange={onHospitalChange}>
            <SelectTrigger>
              <SelectValue placeholder="Hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hospitals</SelectItem>
              {hospitals.map(hospital => (
                <SelectItem key={hospital} value={hospital}>{hospital}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDoctor} onValueChange={onDoctorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {doctors.map(doctor => (
                <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCoordinator} onValueChange={onCoordinatorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Coordinator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Coordinators</SelectItem>
              {coordinators.map(coordinator => (
                <SelectItem key={coordinator} value={coordinator}>{coordinator}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={onFilterByChange}>
            <SelectTrigger>
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
