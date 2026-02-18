import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RequestFormData } from "@/types/request";
import { servicesBySpecialty } from "@/data/medicalData";
import VoiceDictationButton from "./VoiceDictationButton";

interface AdditionalInfoSectionProps {
  form: Partial<RequestFormData>;
  onFieldChange: (key: string, value: string) => void;
  selectedSpecialty: string;
}

const urgencyOptions = [
  { value: "normal", label: "Normal" },
  { value: "urgent", label: "Urgent" },
  { value: "emergency", label: "Emergency" }
];

const AdditionalInfoSection = ({ form, onFieldChange, selectedSpecialty }: AdditionalInfoSectionProps) => {
  const availableServices = selectedSpecialty && servicesBySpecialty[selectedSpecialty as keyof typeof servicesBySpecialty] 
    ? servicesBySpecialty[selectedSpecialty as keyof typeof servicesBySpecialty]
    : [];

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Information</h3>
      
      {/* Diagnosis and Service Description moved to NotesSection (AI-assisted) */}

      <div>
        <label className="block font-medium text-gray-600 mb-1">Urgency</label>
        <Select 
          value={form.urgency || ""} 
          onValueChange={(value) => onFieldChange("urgency", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select urgency level" />
          </SelectTrigger>
          <SelectContent>
            {urgencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Admission Duration (days)</label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={form.admissionDuration || ""}
            onChange={(e) => onFieldChange("admissionDuration", e.target.value)}
            placeholder="Enter admission duration in days"
            min="0"
            className="flex-1"
          />
          <VoiceDictationButton
            currentValue={form.admissionDuration || ""}
            onResult={(text) => onFieldChange("admissionDuration", text)}
            append={false}
          />
        </div>
      </div>

    </div>
  );
};

export default AdditionalInfoSection;
