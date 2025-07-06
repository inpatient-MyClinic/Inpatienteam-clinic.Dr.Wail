
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { User } from "./types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [isOpen, setIsOpen] = useState(false);

  const doctors = users.filter(user => user.category === "Doctor");

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

  const doctorsWithPrivileges = doctors.filter(d => d.hospitalPrivileges && d.hospitalPrivileges.length > 0);
  const totalPrivileges = doctors.reduce((sum, doctor) => sum + (doctor.hospitalPrivileges?.length || 0), 0);

  return (
    <Card>
      <CardHeader>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <div>
                  <CardTitle className="text-lg">Doctor Hospital Privileges</CardTitle>
                  <CardDescription className="text-sm">
                    {doctorsWithPrivileges.length} doctors with {totalPrivileges} total privileges
                  </CardDescription>
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Quick Add */}
            <div className="flex gap-4 items-end p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Doctor</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
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
                <label className="block text-sm font-medium mb-2">Hospital</label>
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital" />
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
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {doctorsWithPrivileges.slice(0, 3).map(doctor => (
                <div key={doctor.id} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm truncate">{doctor.email}</div>
                  <div className="text-xs text-gray-500 mb-2">{doctor.specialty || "No specialty"}</div>
                  <Badge variant="secondary" className="text-xs">
                    {doctor.hospitalPrivileges?.length || 0} hospitals
                  </Badge>
                </div>
              ))}
              {doctorsWithPrivileges.length > 3 && (
                <div className="p-3 border rounded-lg flex items-center justify-center text-gray-500">
                  +{doctorsWithPrivileges.length - 3} more doctors
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
};

export default DoctorPrivileges;
