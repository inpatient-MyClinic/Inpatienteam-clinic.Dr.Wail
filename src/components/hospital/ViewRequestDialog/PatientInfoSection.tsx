
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PatientInfoSectionProps {
  localData: any;
  onFieldChange: (field: string, value: string) => void;
}

export default function PatientInfoSection({ localData, onFieldChange }: PatientInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Hospital MRN</Label>
          <Input
            value={localData.hospitalMRN || localData.mrn}
            onChange={(e) => onFieldChange('hospitalMRN', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={localData.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>National ID</Label>
          <Input
            value={localData.nationalId}
            onChange={(e) => onFieldChange('nationalId', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Age</Label>
          <Input
            value={localData.age}
            onChange={(e) => onFieldChange('age', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Gender</Label>
          <Select value={localData.gender} onValueChange={(value) => onFieldChange('gender', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
