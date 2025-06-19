
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data - in real app this would come from your backend/database
const doctors = [
  { id: "1", name: "Dr. Ahmed Hassan", specialty: "Cardiology" },
  { id: "2", name: "Dr. Sarah Mohammed", specialty: "Neurology" },
  { id: "3", name: "Dr. Omar Ali", specialty: "Orthopedics" },
  { id: "4", name: "Dr. Fatima Ibrahim", specialty: "Pediatrics" },
  { id: "5", name: "Dr. Khaled Mahmoud", specialty: "Surgery" },
  { id: "6", name: "Dr. Nadia Salim", specialty: "Radiology" },
];

const hospitals = [
  { id: "1", name: "Al-Noor Hospital" },
  { id: "2", name: "City Medical Center" },
  { id: "3", name: "Royal Hospital" },
  { id: "4", name: "Green Valley Hospital" },
  { id: "5", name: "Unity Medical Complex" },
];

const specialties = ["All", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Surgery", "Radiology"];

// Mock privilege data - doctorId -> hospitalId -> boolean
const initialPrivileges = {
  "1": { "1": true, "2": true, "3": false, "4": true, "5": false },
  "2": { "1": false, "2": true, "3": true, "4": false, "5": true },
  "3": { "1": true, "2": false, "3": true, "4": true, "5": false },
  "4": { "1": true, "2": true, "3": false, "4": false, "5": true },
  "5": { "1": false, "2": true, "3": true, "4": true, "5": true },
  "6": { "1": true, "2": false, "3": false, "4": true, "5": false },
};

// Mock current user - in real app this would come from auth context
const currentUser = {
  id: "admin1",
  role: "Admin", // "Admin", "Case Coordinator", "Doctor"
  doctorId: null // would be set if role is "Doctor"
};

const PrivilegeManagement = () => {
  const { toast } = useToast();
  const [privileges, setPrivileges] = useState(initialPrivileges);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedHospital, setSelectedHospital] = useState("All");

  // Check if user can edit privileges
  const canEdit = currentUser.role === "Admin";

  // Filter doctors based on search and filters
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "All" || doctor.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [searchTerm, selectedSpecialty]);

  // Filter hospitals based on selection
  const filteredHospitals = useMemo(() => {
    if (selectedHospital === "All") return hospitals;
    return hospitals.filter(hospital => hospital.id === selectedHospital);
  }, [selectedHospital]);

  const togglePrivilege = (doctorId: string, hospitalId: string) => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to modify privileges",
        variant: "destructive"
      });
      return;
    }

    setPrivileges(prev => ({
      ...prev,
      [doctorId]: {
        ...prev[doctorId],
        [hospitalId]: !prev[doctorId]?.[hospitalId]
      }
    }));

    const doctor = doctors.find(d => d.id === doctorId);
    const hospital = hospitals.find(h => h.id === hospitalId);
    const newStatus = !privileges[doctorId]?.[hospitalId] ? "granted" : "revoked";

    toast({
      title: "Privilege Updated",
      description: `${doctor?.name} privilege ${newStatus} for ${hospital?.name}`
    });
  };

  const hasPrivilege = (doctorId: string, hospitalId: string) => {
    return privileges[doctorId]?.[hospitalId] || false;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-900">Privilege Management</h1>
        <p className="text-gray-600">
          {canEdit 
            ? "Manage doctor privileges across hospitals" 
            : "View doctor privileges across hospitals"
          }
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filter Options
          </CardTitle>
          <CardDescription>Filter the privilege matrix by doctor, hospital, or specialty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Doctor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by doctor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="specialty">Filter by Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="hospital">Filter by Hospital</Label>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Hospitals</SelectItem>
                  {hospitals.map(hospital => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privilege Matrix</CardTitle>
          <CardDescription>
            {canEdit 
              ? "Click checkboxes to grant or revoke privileges" 
              : "View-only access to privilege information"
            }
          </CardDescription>
          {currentUser.role === "Case Coordinator" && (
            <Badge variant="secondary" className="w-fit">
              View Only Access
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Doctor</TableHead>
                  <TableHead className="min-w-[120px]">Specialty</TableHead>
                  {filteredHospitals.map(hospital => (
                    <TableHead key={hospital.id} className="text-center min-w-[150px]">
                      {hospital.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map(doctor => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.specialty}</Badge>
                    </TableCell>
                    {filteredHospitals.map(hospital => (
                      <TableCell key={hospital.id} className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={hasPrivilege(doctor.id, hospital.id)}
                            onCheckedChange={() => togglePrivilege(doctor.id, hospital.id)}
                            disabled={!canEdit}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                          />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">Created by Dr. Wail Ahmed</p>
      </div>
    </div>
  );
};

export default PrivilegeManagement;
