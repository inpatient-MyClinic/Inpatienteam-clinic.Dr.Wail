
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InsuranceContactSectionProps {
  localData: any;
  onFieldChange: (field: string, value: string) => void;
}

export default function InsuranceContactSection({ localData, onFieldChange }: InsuranceContactSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insurance Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Insurance Provider</Label>
            <Input
              value={localData.insuranceProvider}
              onChange={(e) => onFieldChange('insuranceProvider', e.target.value)}
              className="mt-1"
              placeholder="Enter insurance provider..."
            />
          </div>
          <div>
            <Label>Insurance Number</Label>
            <Input
              value={localData.insuranceNumber}
              onChange={(e) => onFieldChange('insuranceNumber', e.target.value)}
              className="mt-1"
              placeholder="Enter insurance number..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Emergency Contact</Label>
            <Input
              value={localData.emergencyContact}
              onChange={(e) => onFieldChange('emergencyContact', e.target.value)}
              className="mt-1"
              placeholder="Enter emergency contact..."
            />
          </div>
          <div>
            <Label>Referring Doctor</Label>
            <Input
              value={localData.referringDoctor}
              onChange={(e) => onFieldChange('referringDoctor', e.target.value)}
              className="mt-1"
              placeholder="Enter referring doctor..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
