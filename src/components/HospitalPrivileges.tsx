
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HospitalPrivilege {
  name: string;
  cases: number;
}

interface HospitalPrivilegesProps {
  privileges: HospitalPrivilege[];
}

export default function HospitalPrivileges({ privileges }: HospitalPrivilegesProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Hospital Privileges</CardTitle>
        <CardDescription>Hospitals where you have active privileges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {privileges.map((hospital, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <Badge variant="secondary" className="flex-1">
                {hospital.name}
              </Badge>
              <span className="text-sm text-gray-600 ml-2">
                {hospital.cases} cases referred
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
