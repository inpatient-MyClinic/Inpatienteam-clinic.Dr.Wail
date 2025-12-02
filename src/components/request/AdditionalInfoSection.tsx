import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RequestFormData } from "@/types/request";
import { servicesBySpecialty } from "@/data/medicalData";

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

const coverageTypes = [
  { value: "full", label: "Full Coverage" },
  { value: "partial", label: "Partial Coverage" },
  { value: "self_pay", label: "Self Pay" },
  { value: "insurance", label: "Insurance" }
];

const AdditionalInfoSection = ({ form, onFieldChange, selectedSpecialty }: AdditionalInfoSectionProps) => {
  // Get services for the selected specialty
  const availableServices = selectedSpecialty && servicesBySpecialty[selectedSpecialty as keyof typeof servicesBySpecialty] 
    ? servicesBySpecialty[selectedSpecialty as keyof typeof servicesBySpecialty]
    : [];

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Information</h3>
      
      <div>
        <label className="block font-medium text-gray-600 mb-1">Diagnosis</label>
        <Textarea
          value={form.diagnosis || ""}
          onChange={(e) => onFieldChange("diagnosis", e.target.value)}
          placeholder="Enter diagnosis details"
          rows={3}
        />
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Service Description</label>
        <Select 
          value={form.serviceDescription || ""} 
          onValueChange={(value) => onFieldChange("serviceDescription", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service description" />
          </SelectTrigger>
          <SelectContent>
            {availableServices.map((service) => (
              <SelectItem key={service} value={service}>
                {service}
              </SelectItem>
            ))}
            {availableServices.length === 0 && (
              <SelectItem value="no-service-placeholder" disabled>
                {selectedSpecialty ? "No services available for this specialty" : "Select a specialty first"}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

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
        <Input
          type="number"
          value={form.admissionDuration || ""}
          onChange={(e) => onFieldChange("admissionDuration", e.target.value)}
          placeholder="Enter admission duration in days"
          min="0"
        />
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Coverage Type</label>
        <Select 
          value={form.coverageType || ""} 
          onValueChange={(value) => onFieldChange("coverageType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select coverage type" />
          </SelectTrigger>
          <SelectContent>
            {coverageTypes.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AdditionalInfoSection;