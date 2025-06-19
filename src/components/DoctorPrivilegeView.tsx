
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

// Mock data for current doctor - in real app this would come from auth context
const currentDoctor = {
  id: "1",
  name: "Dr. Ahmed Hassan",
  specialty: "Cardiology"
};

const hospitals = [
  { id: "1", name: "Al-Noor Hospital" },
  { id: "2", name: "City Medical Center" },
  { id: "3", name: "Royal Hospital" },
  { id: "4", name: "Green Valley Hospital" },
  { id: "5", name: "Unity Medical Complex" },
];

// Mock privilege data for current doctor
const doctorPrivileges = {
  "1": true,  // Al-Noor Hospital
  "2": true,  // City Medical Center
  "3": false, // Royal Hospital
  "4": true,  // Green Valley Hospital
  "5": false, // Unity Medical Complex
};

const DoctorPrivilegeView = () => {
  const hospitalPrivileges = hospitals.map(hospital => ({
    ...hospital,
    hasPrivilege: doctorPrivileges[hospital.id] || false
  }));

  const totalPrivileges = hospitalPrivileges.filter(h => h.hasPrivilege).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Hospital Privileges</CardTitle>
          <CardDescription>
            Hospitals where you have active privileges
          </CardDescription>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currentDoctor.specialty}</Badge>
            <Badge variant="secondary">{totalPrivileges} of {hospitals.length} hospitals</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital Name</TableHead>
                <TableHead className="text-center">Privilege Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitalPrivileges.map(hospital => (
                <TableRow key={hospital.id}>
                  <TableCell className="font-medium">{hospital.name}</TableCell>
                  <TableCell className="text-center">
                    {hospital.hasPrivilege ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <XCircle className="w-4 h-4" />
                        <span>No Access</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">Created by Dr. Wail Ahmed</p>
      </div>
    </div>
  );
};

export default DoctorPrivilegeView;
