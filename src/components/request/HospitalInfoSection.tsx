
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestFormData } from "@/types/request";
import { hospitals, getHospitalsBySpecialty } from "@/data/medicalData";
import VoiceDictationButton from "./VoiceDictationButton";

interface HospitalInfoSectionProps {
  form: Partial<RequestFormData>;
  onFieldChange: (key: string, value: string) => void;
}

const HospitalInfoSection = ({ form, onFieldChange }: HospitalInfoSectionProps) => {
  const availableHospitals = form.specialty ? getHospitalsBySpecialty(form.specialty) : hospitals;
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Hospital Information</h3>
      
      <div>
        <label className="block font-medium text-gray-600 mb-1">Hospital MRN</label>
        <div className="flex items-center gap-1">
          <Input
            value={form.hospitalMRN || ""}
            onChange={(e) => onFieldChange("hospitalMRN", e.target.value)}
            required
            className="flex-1"
          />
          <VoiceDictationButton
            currentValue={form.hospitalMRN || ""}
            onResult={(text) => onFieldChange("hospitalMRN", text)}
            append={false}
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Hospital Name</label>
        <Select value={form.hospitalName || ""} onValueChange={(value) => onFieldChange("hospitalName", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select hospital" />
          </SelectTrigger>
          <SelectContent>
            {availableHospitals.map((hospital) => (
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
