
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { specialties } from "@/data/medicalData";
import { loadUsersFromStorage, saveUsersToStorage } from "./settings/userManagement/UserStorage";
import { User } from "./settings/userManagement/types";

const DoctorManagement = () => {
  const { toast } = useToast();
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [newDoctorName, setNewDoctorName] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load users from storage on component mount
  const loadUsers = () => {
    setIsRefreshing(true);
    const loadedUsers = loadUsersFromStorage();
    console.log('Loaded users for Doctor Management:', loadedUsers);
    setUsers(loadedUsers);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Get doctors only (users with category "Doctor")
  const doctors = users.filter(user => user.category === "Doctor");
  console.log('Filtered doctors:', doctors);

  // Group doctors by specialty with proper handling
  const doctorsBySpecialty = doctors.reduce((acc, doctor) => {
    const specialty = doctor.specialty || "none";
    console.log(`Doctor ${doctor.email} has specialty: ${specialty}`);
    
    if (!acc[specialty]) {
      acc[specialty] = [];
    }
    acc[specialty].push({
      value: doctor.id,
      label: doctor.email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: doctor.email
    });
    return acc;
  }, {} as Record<string, Array<{ value: string; label: string; email: string }>>);

  console.log('Doctors grouped by specialty:', doctorsBySpecialty);

  const handleAddDoctor = () => {
    if (!selectedSpecialty || !newDoctorName) {
      toast({
        title: "Error",
        description: "Please select specialty and enter doctor name",
        variant: "destructive"
      });
      return;
    }

    // Create new doctor user
    const newDoctor: User = {
      id: Date.now().toString(),
      email: `${newDoctorName.toLowerCase().replace(/\s+/g, '.')}@hospital.com`,
      category: "Doctor",
      specialty: selectedSpecialty === "none" ? undefined : selectedSpecialty,
      status: "Active",
      createdAt: new Date().toISOString().split('T')[0],
      fieldPermissions: {
        patientName: "edit",
        mrn: "edit",
        serviceDescription: "edit",
        hospital: "edit",
        status: "edit",
        assignedDoctor: "edit",
        phone: "edit",
        expectedSurgeryDate: "edit",
        paymentStatus: "view",
        notes: "edit"
      }
    };

    const updatedUsers = [...users, newDoctor];
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);

    setNewDoctorName("");
    toast({
      title: "Success",
      description: `Dr. ${newDoctorName} added to ${selectedSpecialty === "none" ? "No Specialty" : specialties.find(s => s.value === selectedSpecialty)?.label || selectedSpecialty}`
    });
  };

  const handleDeleteDoctor = (doctorId: string) => {
    const updatedUsers = users.filter(user => user.id !== doctorId);
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
    
    toast({
      title: "Success",
      description: "Doctor removed successfully"
    });
  };

  const refreshData = () => {
    loadUsers();
    toast({
      title: "Data Refreshed",
      description: "Doctor data has been refreshed from User Management"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Doctor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Specialty</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Doctor Name</Label>
              <Input
                value={newDoctorName}
                onChange={(e) => setNewDoctorName(e.target.value)}
                placeholder="Enter doctor name"
              />
            </div>
            <Button onClick={handleAddDoctor}>
              <Plus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Manage Doctors by Specialty</CardTitle>
              <p className="text-sm text-gray-600">
                Showing doctors from User Management data ({doctors.length} total doctors)
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {specialties.map(specialty => {
            const specialtyDoctors = doctorsBySpecialty[specialty.value] || [];
            return (
              <div key={specialty.value} className="mb-6">
                <h3 className="font-semibold mb-2">
                  {specialty.label} ({specialtyDoctors.length})
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor Email</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialtyDoctors.length > 0 ? (
                      specialtyDoctors.map(doctor => (
                        <TableRow key={doctor.value}>
                          <TableCell>{doctor.email}</TableCell>
                          <TableCell>Dr. {doctor.label}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteDoctor(doctor.value)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500">
                          No doctors found for this specialty
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            );
          })}

          {/* Show doctors with no specialty */}
          {doctorsBySpecialty["none"] && doctorsBySpecialty["none"].length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">
                No Specialty ({doctorsBySpecialty["none"].length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Email</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctorsBySpecialty["none"].map(doctor => (
                    <TableRow key={doctor.value}>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell>Dr. {doctor.label}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDoctor(doctor.value)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorManagement;
