import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RequestFormData } from "@/types/request";
import { specialties, getDoctorsBySpecialtyFresh, servicesBySpecialty, referralSources, getHospitalsBySpecialty } from "@/data/medicalData";
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
  const [selectedHospital, setSelectedHospital] = useState<string>(form.referredToHospital || "");
  const [opdDate, setOpdDate] = useState<Date>();

  // Get doctors for selected specialty - get fresh data from user management
  const getDoctorsForSpecialty = (specialty: string) => {
    if (!specialty) return [];
    const freshDoctorsBySpecialty = getDoctorsBySpecialtyFresh();
    const doctors = freshDoctorsBySpecialty[specialty as keyof typeof freshDoctorsBySpecialty];
    console.log(`Getting doctors for ${specialty}:`, doctors);
    return doctors || [];
  };

  const availableDoctors = getDoctorsForSpecialty(selectedSpecialty);
  const availableServices = selectedSpecialty ? servicesBySpecialty[selectedSpecialty as keyof typeof servicesBySpecialty] || [] : [];
  
  // Get hospitals based on specialty
  const availableHospitals = getHospitalsBySpecialty(selectedSpecialty);
  
  // Get hospitals where selected doctor has privileges
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
      
      {/* Specialty Selection */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">Specialty</label>
        <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-60 overflow-y-auto">
            {specialties.map((specialty) => (
              <SelectItem 
                key={specialty.value} 
                value={specialty.value}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {specialty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Doctor Selection */}
      {selectedSpecialty && (
        <div>
          <label className="block font-medium text-gray-600 mb-1">
            Treating Doctor Name
            <span className="text-sm text-gray-400 ml-2">
              ({availableDoctors.length} doctor{availableDoctors.length !== 1 ? 's' : ''} available)
            </span>
          </label>
          <Select value={selectedDoctor} onValueChange={onDoctorChange}>
            <SelectTrigger className="w-full">
              <SelectValue 
                placeholder={
                  availableDoctors.length > 0 
                    ? "Select doctor" 
                    : `No doctors available for ${selectedSpecialty}`
                } 
              />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-60 overflow-y-auto">
              {availableDoctors.length > 0 ? (
                availableDoctors.map((doctor) => (
                  <SelectItem 
                    key={doctor.value} 
                    value={doctor.label}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {doctor.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-doctors" disabled className="text-gray-400">
                  No doctors available for {selectedSpecialty}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Referral Source */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">Referred From</label>
        <Select value={form.referredFrom || ""} onValueChange={(value) => onFieldChange("referredFrom", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select referral source" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
            {referralSources.map((source) => (
              <SelectItem 
                key={source} 
                value={source}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hospital Selection */}
      <div>
        <label className="block font-medium text-gray-600 mb-1">Referred To Hospital</label>
        <Select value={selectedHospital} onValueChange={handleHospitalChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select hospital" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-60 overflow-y-auto">
            {hospitalOptions.map((hospital) => (
              <SelectItem 
                key={hospital} 
                value={hospital}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {hospital}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* DSFH OPD Booking Date */}
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
            <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="start">
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

      {/* Service Description */}
      {selectedSpecialty && availableServices.length > 0 && (
        <div>
          <label className="block font-medium text-gray-600 mb-1">Service Description</label>
          <Select value={form.serviceDescription || ""} onValueChange={(value) => onFieldChange("serviceDescription", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-60 overflow-y-auto">
              {availableServices.map((service) => (
                <SelectItem 
                  key={service} 
                  value={service}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
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