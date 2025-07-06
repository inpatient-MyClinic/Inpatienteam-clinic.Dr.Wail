
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { User } from "./types";

interface HospitalPrivilegesTableProps {
  users: User[];
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const hospitals = [
  "King Abdulaziz Hospital",
  "King Faisal Specialist Hospital", 
  "King Khalid Hospital",
  "Prince Sultan Hospital",
  "National Guard Hospital",
  "Saudi German Hospital",
  "Riyadh Care Hospital",
  "Al Mouwasat Hospital"
];

const specialties = [
  "Cardiology",
  "Neurology",
  "Orthopedics", 
  "Pediatrics",
  "Surgery",
  "Radiology",
  "Emergency Medicine",
  "Internal Medicine",
  "Dermatology",
  "Psychiatry"
];

const HospitalPrivilegesTable = ({ users, onUpdateUser }: HospitalPrivilegesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const doctors = users.filter(user => user.category === "Doctor");

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const hasPrivilege = (doctor: User, hospital: string) => {
    return doctor.hospitalPrivileges?.includes(hospital) || false;
  };

  const togglePrivilege = (doctorId: string, hospital: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    const currentPrivileges = doctor.hospitalPrivileges || [];
    let newPrivileges;

    if (currentPrivileges.includes(hospital)) {
      // Remove privilege
      newPrivileges = currentPrivileges.filter(h => h !== hospital);
    } else {
      // Add privilege
      newPrivileges = [...currentPrivileges, hospital];
    }

    onUpdateUser(doctorId, { hospitalPrivileges: newPrivileges });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search doctor by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {specialties.map(specialty => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Doctor</TableHead>
              <TableHead className="min-w-[120px]">Specialty</TableHead>
              {hospitals.map(hospital => (
                <TableHead key={hospital} className="text-center min-w-[150px]">
                  {hospital}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map(doctor => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.email}</TableCell>
                  <TableCell>
                    {doctor.specialty ? (
                      <Badge variant="outline">{doctor.specialty}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  {hospitals.map(hospital => (
                    <TableCell key={hospital} className="text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={hasPrivilege(doctor, hospital)}
                          onCheckedChange={() => togglePrivilege(doctor.id, hospital)}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={hospitals.length + 2} className="text-center py-6 text-gray-500">
                  No doctors found matching the criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredDoctors.length} of {doctors.length} doctors
      </div>
    </div>
  );
};

export default HospitalPrivilegesTable;
