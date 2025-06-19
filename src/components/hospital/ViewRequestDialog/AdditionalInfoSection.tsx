
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdditionalInfoSectionProps {
  localData: any;
  onFieldChange: (field: string, value: string) => void;
}

export default function AdditionalInfoSection({ localData, onFieldChange }: AdditionalInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Medical Codes & Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Diagnosis Code</Label>
            <Input
              value={localData.diagnosisCode || ""}
              onChange={(e) => onFieldChange('diagnosisCode', e.target.value)}
              className="mt-1"
              placeholder="Enter diagnosis code..."
            />
          </div>
          <div>
            <Label>Procedure Code</Label>
            <Input
              value={localData.procedureCode || ""}
              onChange={(e) => onFieldChange('procedureCode', e.target.value)}
              className="mt-1"
              placeholder="Enter procedure code..."
            />
          </div>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={localData.status} onValueChange={(value) => onFieldChange('status', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Need Justification">Need More Justification</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Under Process">Under Process</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Additional Notes</Label>
          <Textarea
            value={localData.additionalNotes || ""}
            onChange={(e) => onFieldChange('additionalNotes', e.target.value)}
            className="mt-1"
            rows={3}
            placeholder="Enter additional notes..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
