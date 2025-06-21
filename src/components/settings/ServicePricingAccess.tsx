
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

type DoctorAccess = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  canViewPricing: boolean;
  isActive: boolean;
};

const ServicePricingAccess = () => {
  const { toast } = useToast();
  const [doctorAccess, setDoctorAccess] = useState<DoctorAccess[]>([
    {
      id: "1",
      name: "Dr. Ahmed Al-Rashid",
      email: "dr.ahmed@hospital.com",
      specialty: "Cardiology",
      canViewPricing: true,
      isActive: true
    },
    {
      id: "2",
      name: "Dr. Sarah Johnson",
      email: "dr.sarah@hospital.com",
      specialty: "Neurology",
      canViewPricing: false,
      isActive: true
    },
    {
      id: "3",
      name: "Dr. Mohammed Hassan",
      email: "dr.mohammed@hospital.com",
      specialty: "Orthopedics",
      canViewPricing: true,
      isActive: false
    },
    {
      id: "4",
      name: "Dr. Fatima Al-Zahra",
      email: "dr.fatima@hospital.com",
      specialty: "Pediatrics",
      canViewPricing: false,
      isActive: true
    }
  ]);

  const toggleViewAccess = (doctorId: string) => {
    setDoctorAccess(prev => 
      prev.map(doctor => 
        doctor.id === doctorId 
          ? { ...doctor, canViewPricing: !doctor.canViewPricing }
          : doctor
      )
    );
    
    const doctor = doctorAccess.find(d => d.id === doctorId);
    toast({
      title: "Access Updated",
      description: `${doctor?.name}'s pricing access has been ${
        doctor?.canViewPricing ? 'removed' : 'granted'
      }`
    });
  };

  const toggleActiveStatus = (doctorId: string) => {
    setDoctorAccess(prev => 
      prev.map(doctor => 
        doctor.id === doctorId 
          ? { ...doctor, isActive: !doctor.isActive, canViewPricing: doctor.isActive ? false : doctor.canViewPricing }
          : doctor
      )
    );
    
    const doctor = doctorAccess.find(d => d.id === doctorId);
    toast({
      title: "Status Updated",
      description: `${doctor?.name} has been ${
        doctor?.isActive ? 'deactivated' : 'activated'
      }`
    });
  };

  const grantAccessToAll = () => {
    setDoctorAccess(prev => 
      prev.map(doctor => 
        doctor.isActive ? { ...doctor, canViewPricing: true } : doctor
      )
    );
    
    toast({
      title: "Bulk Access Granted",
      description: "All active doctors can now view pricing"
    });
  };

  const revokeAccessFromAll = () => {
    setDoctorAccess(prev => 
      prev.map(doctor => ({ ...doctor, canViewPricing: false }))
    );
    
    toast({
      title: "Bulk Access Revoked",
      description: "Pricing access removed from all doctors"
    });
  };

  const activeDoctors = doctorAccess.filter(d => d.isActive);
  const doctorsWithAccess = doctorAccess.filter(d => d.canViewPricing && d.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Pricing Access Control</CardTitle>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Total Doctors: {doctorAccess.length}</span>
          <span>Active: {activeDoctors.length}</span>
          <span>With Pricing Access: {doctorsWithAccess.length}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={grantAccessToAll} variant="outline" size="sm">
            Grant Access to All Active
          </Button>
          <Button onClick={revokeAccessFromAll} variant="outline" size="sm">
            Revoke All Access
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doctor</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pricing Access</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctorAccess.map((doctor) => (
              <TableRow key={doctor.id} className={!doctor.isActive ? "opacity-50" : ""}>
                <TableCell>
                  <div>
                    <div className="font-medium">{doctor.name}</div>
                    <div className="text-sm text-gray-500">{doctor.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{doctor.specialty}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={doctor.isActive ? "default" : "secondary"}>
                    {doctor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {doctor.canViewPricing && doctor.isActive ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={doctor.canViewPricing && doctor.isActive ? "text-green-600" : "text-gray-400"}>
                      {doctor.canViewPricing && doctor.isActive ? "Can View" : "No Access"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Label htmlFor={`access-${doctor.id}`} className="text-xs">Access</Label>
                      <Switch
                        id={`access-${doctor.id}`}
                        checked={doctor.canViewPricing}
                        onCheckedChange={() => toggleViewAccess(doctor.id)}
                        disabled={!doctor.isActive}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Label htmlFor={`active-${doctor.id}`} className="text-xs">Active</Label>
                      <Switch
                        id={`active-${doctor.id}`}
                        checked={doctor.isActive}
                        onCheckedChange={() => toggleActiveStatus(doctor.id)}
                      />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ServicePricingAccess;
