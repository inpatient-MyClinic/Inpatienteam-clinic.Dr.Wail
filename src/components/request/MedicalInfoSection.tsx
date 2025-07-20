
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RequestFormData } from "@/types/request";
import { specialties, getDoctorsBySpecialty, servicesBySpecialty, referralSources, getHospitalsBySpecialty } from "@/data/medicalData";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [selectedHospital, setSelectedHospital] = useState<string>(form.referredToHospital || "");
  const [opdDate, setOpdDate] = useState<Date>();

  // Load fresh doctor data when component mounts and when specialty changes
  useEffect(() => {
    const freshDoctorData = getDoctorsBySpecialty();
    console.log('Fresh doctor data loaded:', freshDoctorData);
    setDoctorsBySpecialty(freshDoctorData);
  }, []);

  const availableDoctors = selectedSpecialty ? doctorsBySpecialty[selectedSpecialty] || [] : [];
  console.log('Available doctors for specialty', selectedSpecialty, ':', availableDoctors);
  const availableServices = selectedSpecialty ? servicesBySpecialty[selectedSpecialty] || [] : [];
  
  // Get hospitals based on specialty
  const availableHospitals = getHospitalsBySpecialty(selectedSpecialty);
  
  // Get hospitals where selected doctor has privileges (if applicable)
  const selectedDoctorData = availableDoctors.find(doc => doc.label === selectedDoctor);
  const doctorHospitals = selectedDoctorData ? selectedDoctorData.privileges : [];
  
  // For ophthalmology, use specialty-specific hospitals, otherwise use doctor privileges or all hospitals
  const hospitalOptions = selectedSpecialty === "ophthalmology" 
    ? availableHospitals 
    : (doctorHospitals.length > 0 ? [...doctorHospitals, "DSFH (main)", "DSFH (Basateen Branch)"] : availableHospitals);

  const handleHospitalChange = (hospital: string) => {
    setSelectedHospital(hospital);
    onFieldChange("referredToHospital", hospital);
    
    // Clear OPD date if not DSFH
    if (!hospital.includes("DSFH")) {
      setOpdDate(undefined);
      onFieldChange("opdBookingDate", "");
    }
  };

  const handleOpdDateChange = (date: Date | undefined) => {
    setOpdDate(date);
    if (date) {
      onFieldChange("opdBookingDate", format(date, "yyyy-MM-dd"));
    } else {
      onFieldChange("opdBookingDate", "");
    }
  };

  const isDSFHSelected = selectedHospital.includes("DSFH");

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

      <div>
        <label className="block font-medium text-gray-600 mb-1">Referred To Hospital</label>
        <Select value={selectedHospital} onValueChange={handleHospitalChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select hospital" />
          </SelectTrigger>
          <SelectContent>
            {hospitalOptions.map((hospital) => (
              <SelectItem key={hospital} value={hospital}>
                {hospital}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* DSFH OPD Booking Date - Mandatory */}
      {isDSFHSelected && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <label className="block font-medium text-gray-600 mb-2">
            OPD Booking Date <span className="text-red-500">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !opdDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {opdDate ? format(opdDate, "PPP") : "Select OPD booking date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={opdDate}
                onSelect={handleOpdDateChange}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <p className="text-sm text-yellow-700 mt-1">
            When you need us to open visit so you can make the booking
          </p>
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
