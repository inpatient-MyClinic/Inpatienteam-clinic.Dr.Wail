
import React from "react";
import { Input } from "@/components/ui/input";
import { RequestFormData } from "@/types/request";

interface PatientInfoSectionProps {
  form: Partial<RequestFormData>;
  onFieldChange: (key: string, value: string) => void;
}

const PatientInfoSection = ({ form, onFieldChange }: PatientInfoSectionProps) => {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Patient Information</h3>
      
      <div>
        <label className="block font-medium text-gray-600 mb-1">Patient Name</label>
        <Input
          value={form.patientName || ""}
          onChange={(e) => onFieldChange("patientName", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Patient National ID</label>
        <Input
          value={form.patientNationalId || ""}
          onChange={(e) => onFieldChange("patientNationalId", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Patient Mobile No.</label>
        <Input
          value={form.patientMobileNo || ""}
          onChange={(e) => onFieldChange("patientMobileNo", e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default PatientInfoSection;
