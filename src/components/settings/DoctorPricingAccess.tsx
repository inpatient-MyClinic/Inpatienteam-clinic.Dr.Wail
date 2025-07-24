import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, EyeOff, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { specialties } from "@/components/settings/userManagement/types";

interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  hasPricingAccess: boolean;
}

// Mock data for doctors
const mockDoctors: Doctor[] = [
  { id: "1", name: "Dr. Ahmed Al-Rashid", email: "ahmed.rashid@hospital.com", specialty: "Cardiology", hasPricingAccess: true },
  { id: "2", name: "Dr. Fatima Al-Zahra", email: "fatima.zahra@hospital.com", specialty: "Cardiology", hasPricingAccess: false },
  { id: "3", name: "Dr. Mohammed Al-Otaibi", email: "mohammed.otaibi@hospital.com", specialty: "Orthopedics", hasPricingAccess: true },
  { id: "4", name: "Dr. Sarah Al-Mansouri", email: "sarah.mansouri@hospital.com", specialty: "Orthopedics", hasPricingAccess: false },
  { id: "5", name: "Dr. Omar Al-Fahad", email: "omar.fahad@hospital.com", specialty: "Neurology", hasPricingAccess: true },
  { id: "6", name: "Dr. Aisha Al-Khalifa", email: "aisha.khalifa@hospital.com", specialty: "Pediatrics", hasPricingAccess: false },
  { id: "7", name: "Dr. Khalid Al-Salam", email: "khalid.salam@hospital.com", specialty: "Surgery", hasPricingAccess: true },
  { id: "8", name: "Dr. Nora Al-Qasimi", email: "nora.qasimi@hospital.com", specialty: "Radiology", hasPricingAccess: false },
];

const DoctorPricingAccess = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter doctors based on specialty and search term
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const specialtyMatch = selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;
      const searchMatch = searchTerm === "" || 
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return specialtyMatch && searchMatch;
    });
  }, [doctors, selectedSpecialty, searchTerm]);

  const toggleDoctorAccess = (doctorId: string) => {
    setDoctors(prev => prev.map(doctor => 
      doctor.id === doctorId 
        ? { ...doctor, hasPricingAccess: !doctor.hasPricingAccess }
        : doctor
    ));
    
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      toast({
        title: "Access Updated",
        description: `Pricing access ${doctor.hasPricingAccess ? 'revoked from' : 'granted to'} ${doctor.name}`,
      });
    }
  };

  const grantAccessToAll = () => {
    setDoctors(prev => prev.map(doctor => 
      filteredDoctors.some(fd => fd.id === doctor.id)
        ? { ...doctor, hasPricingAccess: true }
        : doctor
    ));
    
    toast({
      title: "Bulk Access Granted",
      description: `Pricing access granted to ${filteredDoctors.length} doctors`,
    });
  };

  const revokeAccessFromAll = () => {
    setDoctors(prev => prev.map(doctor => 
      filteredDoctors.some(fd => fd.id === doctor.id)
        ? { ...doctor, hasPricingAccess: false }
        : doctor
    ));
    
    toast({
      title: "Bulk Access Revoked",
      description: `Pricing access revoked from ${filteredDoctors.length} doctors`,
    });
  };

  const clearFilters = () => {
    setSelectedSpecialty("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedSpecialty !== "all" || searchTerm !== "";
  const doctorsWithAccess = filteredDoctors.filter(d => d.hasPricingAccess).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Doctor Pricing Access Control
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control which doctors can view pricing information in their dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{doctorsWithAccess}</div>
              <div className="text-sm text-muted-foreground">With Access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredDoctors.length - doctorsWithAccess}</div>
              <div className="text-sm text-muted-foreground">Without Access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredDoctors.length}</div>
              <div className="text-sm text-muted-foreground">Total Doctors</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Search Doctor</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-[200px]">
              <Label>Filter by Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Bulk Actions */}
          {filteredDoctors.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={grantAccessToAll}>
                <Eye className="w-4 h-4 mr-2" />
                Grant Access to All ({filteredDoctors.length})
              </Button>
              <Button variant="outline" size="sm" onClick={revokeAccessFromAll}>
                <EyeOff className="w-4 h-4 mr-2" />
                Revoke Access from All ({filteredDoctors.length})
              </Button>
            </div>
          )}

          {/* Doctors Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Access</TableHead>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No doctors found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <Checkbox
                          checked={doctor.hasPricingAccess}
                          onCheckedChange={() => toggleDoctorAccess(doctor.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doctor.specialty}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doctor.hasPricingAccess ? "default" : "outline"}>
                          {doctor.hasPricingAccess ? "Can View Pricing" : "No Access"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorPricingAccess;