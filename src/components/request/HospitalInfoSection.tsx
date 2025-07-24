
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestFormData } from "@/types/request";
import { hospitals } from "@/data/medicalData";

interface HospitalInfoSectionProps {
  form: Partial<RequestFormData>;
  onFieldChange: (key: string, value: string) => void;
}

const HospitalInfoSection = ({ form, onFieldChange }: HospitalInfoSectionProps) => {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Hospital Information</h3>
      
      <div>
        <label className="block font-medium text-gray-600 mb-1">Hospital MRN</label>
        <Input
          value={form.hospitalMRN || ""}
          onChange={(e) => onFieldChange("hospitalMRN", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Hospital Name</label>
        <Select value={form.hospitalName || ""} onValueChange={(value) => onFieldChange("hospitalName", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select hospital" />
          </SelectTrigger>
          <SelectContent>
            {hospitals.map((hospital) => (
              <SelectItem key={hospital} value={hospital}>
                {hospital}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default HospitalInfoSection;
