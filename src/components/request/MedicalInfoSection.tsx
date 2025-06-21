
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestFormData } from "@/types/request";
import { specialties, getDoctorsBySpecialty, servicesBySpecialty, referralSources } from "@/data/medicalData";

interface MedicalInfoSectionProps {
  form: Partial<RequestFormData>;
  selectedSpecialty: string;
  selectedDoctor: string;
  onFieldChange: (key: string, value: string) => void;
  onSpecialtyChange: (specialty: string) => void;
  onDoctorChange: (doctor: string) => void;
}

const MedicalInfoSection = ({ 
  form, 
  selectedSpecialty,
  selectedDoctor,
  onFieldChange, 
  onSpecialtyChange,
  onDoctorChange
}: MedicalInfoSectionProps) => {
  const [doctorsBySpecialty, setDoctorsBySpecialty] = useState<Record<string, Array<{ value: string; label: string; privileges: string[] }>>>({});

  // Load fresh doctor data when component mounts
  useEffect(() => {
    const freshDoctorData = getDoctorsBySpecialty();
    setDoctorsBySpecialty(freshDoctorData);
  }, []);

  const availableDoctors = selectedSpecialty ? doctorsBySpecialty[selectedSpecialty] || [] : [];
  const availableServices = selectedSpecialty ? servicesBySpecialty[selectedSpecialty] || [] : [];
  
  // Get hospitals where selected doctor has privileges
  const selectedDoctorData = availableDoctors.find(doc => doc.label === selectedDoctor);
  const availableHospitalsForDoctor = selectedDoctorData ? selectedDoctorData.privileges : [];

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
          <Select value={selectedDoctor} onValueChange={onDoctorChange}>
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

      <div>
        <label className="block font-medium text-gray-600 mb-1">Referred From</label>
        <Select value={form.referredFrom || ""} onValueChange={(value) => onFieldChange("referredFrom", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select referral source" />
          </SelectTrigger>
          <SelectContent>
            {referralSources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDoctor && (
        <div>
          <label className="block font-medium text-gray-600 mb-1">Referred To Hospital</label>
          <Select value={form.referredToHospital || ""} onValueChange={(value) => onFieldChange("referredToHospital", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select hospital" />
            </SelectTrigger>
            <SelectContent>
              {availableHospitalsForDoctor.map((hospital) => (
                <SelectItem key={hospital} value={hospital}>
                  {hospital}
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
