
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { specialties, doctorsBySpecialty } from "@/data/medicalData";

const DoctorManagement = () => {
  const { toast } = useToast();
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [newDoctorName, setNewDoctorName] = useState("");
  const [doctors, setDoctors] = useState(doctorsBySpecialty);

  const handleAddDoctor = () => {
    if (!selectedSpecialty || !newDoctorName) {
      toast({
        title: "Error",
        description: "Please select specialty and enter doctor name",
        variant: "destructive"
      });
      return;
    }

    const newDoctor = {
      value: `dr_${newDoctorName.toLowerCase().replace(/\s+/g, '_')}_${selectedSpecialty}`,
      label: newDoctorName
    };

    setDoctors(prev => ({
      ...prev,
      [selectedSpecialty]: [...(prev[selectedSpecialty] || []), newDoctor]
    }));

    setNewDoctorName("");
    toast({
      title: "Success",
      description: `Dr. ${newDoctorName} added to ${selectedSpecialty}`
    });
  };

  const handleDeleteDoctor = (specialty: string, doctorValue: string) => {
    setDoctors(prev => ({
      ...prev,
      [specialty]: prev[specialty].filter(doc => doc.value !== doctorValue)
    }));
    
    toast({
      title: "Success",
      description: "Doctor removed successfully"
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
          <CardTitle>Manage Doctors by Specialty</CardTitle>
        </CardHeader>
        <CardContent>
          {specialties.map(specialty => (
            <div key={specialty.value} className="mb-6">
              <h3 className="font-semibold mb-2">{specialty.label}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(doctors[specialty.value] || []).map(doctor => (
                    <TableRow key={doctor.value}>
                      <TableCell>{doctor.label}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteDoctor(specialty.value, doctor.value)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorManagement;
