
import React from "react";
import { Input } from "@/components/ui/input";
import { RequestFormData } from "@/types/request";
import VoiceDictationButton from "./VoiceDictationButton";

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
        <div className="flex items-center gap-1">
          <Input
            value={form.patientName || ""}
            onChange={(e) => onFieldChange("patientName", e.target.value)}
            required
            className="flex-1"
          />
          <VoiceDictationButton
            currentValue={form.patientName || ""}
            onResult={(text) => onFieldChange("patientName", text)}
            append={false}
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Patient National ID</label>
        <div className="flex items-center gap-1">
          <Input
            value={form.patientNationalId || ""}
            onChange={(e) => onFieldChange("patientNationalId", e.target.value)}
            required
            className="flex-1"
          />
          <VoiceDictationButton
            currentValue={form.patientNationalId || ""}
            onResult={(text) => onFieldChange("patientNationalId", text)}
            append={false}
          />
        </div>
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Patient Mobile No.</label>
        <div className="flex items-center gap-1">
          <Input
            value={form.patientMobileNo || ""}
            onChange={(e) => onFieldChange("patientMobileNo", e.target.value)}
            required
            className="flex-1"
          />
          <VoiceDictationButton
            currentValue={form.patientMobileNo || ""}
            onResult={(text) => onFieldChange("patientMobileNo", text)}
            append={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientInfoSection;
