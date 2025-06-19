
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MedicalHistorySectionProps {
  localData: any;
  onFieldChange: (field: string, value: string) => void;
}

export default function MedicalHistorySection({ localData, onFieldChange }: MedicalHistorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Medical History & Medications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Medical History</Label>
          <Textarea
            value={localData.medicalHistory}
            onChange={(e) => onFieldChange('medicalHistory', e.target.value)}
            className="mt-1"
            rows={3}
            placeholder="Enter medical history..."
          />
        </div>
        <div>
          <Label>Current Medications</Label>
          <Textarea
            value={localData.currentMedications}
            onChange={(e) => onFieldChange('currentMedications', e.target.value)}
            className="mt-1"
            rows={3}
            placeholder="Enter current medications..."
          />
        </div>
        <div>
          <Label>Allergies</Label>
          <Textarea
            value={localData.allergies}
            onChange={(e) => onFieldChange('allergies', e.target.value)}
            className="mt-1"
            rows={2}
            placeholder="Enter known allergies..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
