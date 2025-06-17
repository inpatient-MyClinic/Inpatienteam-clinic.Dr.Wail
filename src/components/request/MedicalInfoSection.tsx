
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestFormData } from "@/types/request";
import { specialties, doctorsBySpecialty, servicesBySpecialty } from "@/data/medicalData";

interface MedicalInfoSectionProps {
  form: Partial<RequestFormData>;
  selectedSpecialty: string;
  onFieldChange: (key: string, value: string) => void;
  onSpecialtyChange: (specialty: string) => void;
}

const MedicalInfoSection = ({ 
  form, 
  selectedSpecialty, 
  onFieldChange, 
  onSpecialtyChange 
}: MedicalInfoSectionProps) => {
  const availableDoctors = selectedSpecialty ? doctorsBySpecialty[selectedSpecialty] || [] : [];
  const availableServices = selectedSpecialty ? servicesBySpecialty[selectedSpecialty] || [] : [];

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Medical Information</h3>
      
      <div>
        <label className="block font-medium text-gray-600 mb-1">Specialty</label>
        <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((specialty) => (
              <SelectItem key={specialty.value} value={specialty.value}>
                {specialty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSpecialty && (
        <div>
          <label className="block font-medium text-gray-600 mb-1">Treating Doctor Name</label>
          <Select value={form.doctorName || ""} onValueChange={(value) => onFieldChange("doctorName", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {availableDoctors.map((doctor) => (
                <SelectItem key={doctor.value} value={doctor.label}>
                  {doctor.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedSpecialty && (
        <div>
          <label className="block font-medium text-gray-600 mb-1">Service Description</label>
          <Select value={form.serviceDescription || ""} onValueChange={(value) => onFieldChange("serviceDescription", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {availableServices.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default MedicalInfoSection;
