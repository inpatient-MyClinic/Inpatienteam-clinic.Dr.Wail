
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Building2 } from "lucide-react";
import { User } from "./types";

interface DoctorPrivilegesProps {
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

const DoctorPrivileges = ({ users, onUpdateUser }: DoctorPrivilegesProps) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedHospital, setSelectedHospital] = useState<string>("");

  const doctors = users.filter(user => user.category === "Doctor");
  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  const addHospitalPrivilege = () => {
    if (!selectedDoctor || !selectedHospital) return;
    
    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor) return;

    const currentPrivileges = doctor.hospitalPrivileges || [];
    if (!currentPrivileges.includes(selectedHospital)) {
      onUpdateUser(selectedDoctor, {
        hospitalPrivileges: [...currentPrivileges, selectedHospital]
      });
    }
    setSelectedHospital("");
  };

  const removeHospitalPrivilege = (doctorId: string, hospital: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    const currentPrivileges = doctor.hospitalPrivileges || [];
    onUpdateUser(doctorId, {
      hospitalPrivileges: currentPrivileges.filter(h => h !== hospital)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Doctor Hospital Privileges
        </CardTitle>
        <CardDescription>
          Manage which hospitals each doctor can access and create requests for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Hospital Privilege */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Select Doctor</label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.email} {doctor.specialty && `(${doctor.specialty})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Select Hospital</label>
            <Select value={selectedHospital} onValueChange={setSelectedHospital}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a hospital" />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map(hospital => (
                  <SelectItem key={hospital} value={hospital}>
                    {hospital}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={addHospitalPrivilege}
            disabled={!selectedDoctor || !selectedHospital}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Privilege
          </Button>
        </div>

        {/* Current Privileges */}
        <div className="space-y-4">
          <h3 className="font-medium">Current Hospital Privileges</h3>
          {doctors.length === 0 ? (
            <p className="text-gray-500 text-sm">No doctors found. Add doctors first to assign hospital privileges.</p>
          ) : (
            <div className="space-y-3">
              {doctors.map(doctor => (
                <div key={doctor.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{doctor.email}</h4>
                      {doctor.specialty && (
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      )}
                    </div>
                    <Badge variant="outline">{doctor.category}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {doctor.hospitalPrivileges && doctor.hospitalPrivileges.length > 0 ? (
                      doctor.hospitalPrivileges.map(hospital => (
                        <div key={hospital} className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {hospital}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => removeHospitalPrivilege(doctor.id, hospital)}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No hospital privileges assigned</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorPrivileges;
