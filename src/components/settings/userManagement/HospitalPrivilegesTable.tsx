
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
    const matchesSpecialty = selectedSpecialty === "all" || 
      (doctor.specialty && doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase());
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
    <div className="space-y-4 h-[75vh] flex flex-col">
      {/* Filters - Fixed at top */}
      <div className="flex gap-4 items-center flex-shrink-0">
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

      {/* Scrollable Table Container */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="min-w-[1400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow className="border-b-2">
                  <TableHead className="min-w-[220px] bg-white font-semibold sticky left-0 z-20 border-r shadow-sm">
                    Doctor
                  </TableHead>
                  <TableHead className="min-w-[140px] bg-white font-semibold sticky left-[220px] z-20 border-r shadow-sm">
                    Specialty
                  </TableHead>
                  {hospitals.map(hospital => (
                    <TableHead key={hospital} className="text-center min-w-[160px] bg-white font-semibold">
                      <div className="text-xs leading-tight px-2 py-1">{hospital}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doctor => (
                    <TableRow key={doctor.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium sticky left-0 bg-white border-r z-10 shadow-sm">
                        <div className="truncate max-w-[200px]" title={doctor.email}>
                          {doctor.email}
                        </div>
                      </TableCell>
                      <TableCell className="sticky left-[220px] bg-white border-r z-10 shadow-sm">
                        {doctor.specialty ? (
                          <Badge variant="outline" className="text-xs">
                            {doctor.specialty}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
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
                    <TableCell colSpan={hospitals.length + 2} className="text-center py-8 text-gray-500">
                      No doctors found matching the criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="text-sm text-gray-500 flex-shrink-0">
        Showing {filteredDoctors.length} of {doctors.length} doctors
      </div>
    </div>
  );
};

export default HospitalPrivilegesTable;
