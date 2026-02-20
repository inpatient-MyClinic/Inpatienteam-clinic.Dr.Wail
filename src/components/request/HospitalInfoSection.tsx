
import React from "react";
import { Input } from "@/components/ui/input";
import { RequestFormData } from "@/types/request";
import { hospitals, getHospitalsBySpecialty } from "@/data/medicalData";
import { DataSyncService } from "@/services/dataSync";
import VoiceDictationButton from "./VoiceDictationButton";
import SearchableCombobox from "./SearchableCombobox";

interface HospitalInfoSectionProps {
  form: Partial<RequestFormData>;
  onFieldChange: (key: string, value: string) => void;
}

const HospitalInfoSection = ({ form, onFieldChange }: HospitalInfoSectionProps) => {
  const specialtyHospitals = form.specialty ? getHospitalsBySpecialty(form.specialty) : hospitals;
  const allHospitals = [...new Set([...specialtyHospitals, ...DataSyncService.getAllHospitalNames()])];

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-foreground border-b pb-2">Hospital Information</h3>
      
      <div>
        <label className="block font-medium text-muted-foreground mb-1">Hospital MRN</label>
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
        <label className="block font-medium text-muted-foreground mb-1">Hospital Name</label>
        <SearchableCombobox
          options={allHospitals}
          value={form.hospitalName || ""}
          onChange={(value) => onFieldChange("hospitalName", value)}
          placeholder="Type hospital name to search..."
          emptyMessage="No hospitals found"
          allowCustom={false}
        />
      </div>
    </div>
  );
};

export default HospitalInfoSection;
