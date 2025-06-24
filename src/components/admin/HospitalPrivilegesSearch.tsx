
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { specialties, getDoctorsBySpecialty, getHospitalsBySpecialty } from "@/data/medicalData";

const HospitalPrivilegesSearch = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const doctorsBySpecialty = getDoctorsBySpecialty();
  
  // Get available doctors based on selected specialty
  const availableDoctors = selectedSpecialty === "all" 
    ? Object.values(doctorsBySpecialty).flat()
    : doctorsBySpecialty[selectedSpecialty] || [];

  // Get hospital privileges data
  const getPrivilegesData = () => {
    let data: Array<{
      doctor: string;
      specialty: string;
      hospital: string;
      hasPrivilege: boolean;
      lastUpdated: string;
    }> = [];

    // Generate mock data for display
    availableDoctors.forEach(doctor => {
      const hospitals = selectedSpecialty === "ophthalmology" 
        ? getHospitalsBySpecialty("ophthalmology")
        : getHospitalsBySpecialty("default");
      
      hospitals.forEach(hospital => {
        data.push({
          doctor: doctor.label,
          specialty: selectedSpecialty === "all" 
            ? specialties.find(s => doctorsBySpecialty[s.value]?.some(d => d.label === doctor.label))?.label || "Unknown"
            : specialties.find(s => s.value === selectedSpecialty)?.label || "Unknown",
          hospital,
          hasPrivilege: Math.random() > 0.3, // Mock privilege status
          lastUpdated: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
      });
    });

    // Apply filters
    if (selectedDoctor !== "all") {
      data = data.filter(item => item.doctor === selectedDoctor);
    }
    
    if (searchTerm) {
      data = data.filter(item => 
        item.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  };

  const privilegesData = getPrivilegesData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Hospital Privileges Search
        </CardTitle>
        <CardDescription>
          Search and monitor doctor privileges across hospitals by specialty
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Specialty</label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Doctor</label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {availableDoctors.map(doctor => (
                  <SelectItem key={doctor.value} value={doctor.label}>
                    {doctor.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search doctors or hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Privilege Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {privilegesData.length > 0 ? (
                privilegesData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.doctor}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.specialty}</Badge>
                    </TableCell>
                    <TableCell>{item.hospital}</TableCell>
                    <TableCell>
                      <Badge variant={item.hasPrivilege ? "default" : "destructive"}>
                        {item.hasPrivilege ? "Active" : "No Access"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{item.lastUpdated}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No privileges data found for the selected criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            Showing {privilegesData.length} privilege records
            {selectedSpecialty !== "all" && ` for ${specialties.find(s => s.value === selectedSpecialty)?.label}`}
            {selectedDoctor !== "all" && ` for ${selectedDoctor}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalPrivilegesSearch;
