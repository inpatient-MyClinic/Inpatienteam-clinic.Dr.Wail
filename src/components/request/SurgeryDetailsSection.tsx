
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestFormData } from "@/types/request";

interface SurgeryDetailsSectionProps {
  form: Partial<RequestFormData>;
  onFieldChange: (key: string, value: string) => void;
}

const SurgeryDetailsSection = ({ form, onFieldChange }: SurgeryDetailsSectionProps) => {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Surgery Details</h3>
      
      <div>
        <label className="block font-medium text-gray-600 mb-1">Expected Surgery Date</label>
        <Input
          type="date"
          value={form.expectedSurgeryDate || ""}
          onChange={(e) => onFieldChange("expectedSurgeryDate", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Type of Admission</label>
        <Select value={form.admissionType || ""} onValueChange={(value) => onFieldChange("admissionType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select admission type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inpatient">Inpatient</SelectItem>
            <SelectItem value="outpatient">Outpatient</SelectItem>
            <SelectItem value="day_surgery">Day Surgery</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SurgeryDetailsSection;
