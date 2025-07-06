
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, ChevronDown, ChevronUp, Table } from "lucide-react";
import { User } from "./types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import HospitalPrivilegesTable from "./HospitalPrivilegesTable";

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
  const [showPrivilegesTable, setShowPrivilegesTable] = useState(false);

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

            {/* Hospital Privileges Table Button */}
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Manage All Hospital Privileges</h4>
                <p className="text-sm text-blue-700">
                  View and modify hospital privileges for all doctors in a comprehensive table view
                </p>
              </div>
              <Dialog open={showPrivilegesTable} onOpenChange={setShowPrivilegesTable}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="flex items-center gap-2">
                    <Table className="w-4 h-4" />
                    Open Privileges Table
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
                  <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Hospital Privileges Management
                    </DialogTitle>
                    <DialogDescription>
                      Manage hospital access privileges for all doctors. Click checkboxes to grant or revoke access.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="px-6 pb-6 h-[calc(95vh-120px)]">
                    <HospitalPrivilegesTable 
                      users={users} 
                      onUpdateUser={onUpdateUser}
                    />
                  </div>
                </DialogContent>
              </Dialog>
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
