
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MedicalInfoSectionProps {
  localData: any;
  onFieldChange: (field: string, value: string) => void;
}

export default function MedicalInfoSection({ localData, onFieldChange }: MedicalInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Medical Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Service Description</Label>
          <Textarea
            value={localData.serviceDescription}
            onChange={(e) => onFieldChange('serviceDescription', e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>
        <div>
          <Label>Specialty</Label>
          <Input
            value={localData.specialty}
            onChange={(e) => onFieldChange('specialty', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Doctor</Label>
          <Input
            value={localData.doctor}
            onChange={(e) => onFieldChange('doctor', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Priority</Label>
          <Select value={localData.priority} onValueChange={(value) => onFieldChange('priority', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Expected Surgery Date</Label>
          <Input
            type="date"
            value={localData.expectedSurgeryDate}
            onChange={(e) => onFieldChange('expectedSurgeryDate', e.target.value)}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
}
