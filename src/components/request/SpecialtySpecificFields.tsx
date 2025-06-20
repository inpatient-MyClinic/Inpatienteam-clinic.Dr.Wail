
import React from "react";
import { Input } from "@/components/ui/input";
import { RequestFormData } from "@/types/request";

interface SpecialtySpecificFieldsProps {
  form: Partial<RequestFormData>;
  selectedSpecialty: string;
  onFieldChange: (key: string, value: string) => void;
}

const SpecialtySpecificFields = ({ 
  form, 
  selectedSpecialty, 
  onFieldChange 
}: SpecialtySpecificFieldsProps) => {
  // Render specialty-specific fields based on selected specialty
  if (selectedSpecialty === "orthopedics") {
    return (
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900">Orthopedic Specific Information</h4>
        <div>
          <label className="block font-medium text-gray-600 mb-1">
            Required Implant <span className="text-red-500">*</span>
          </label>
          <Input
            value={form.requiredImplant || ""}
            onChange={(e) => onFieldChange("requiredImplant", e.target.value)}
            placeholder="Enter required implant details"
            required
          />
        </div>
      </div>
    );
  }

  if (selectedSpecialty === "obgyn") {
    return (
      <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
        <h4 className="font-medium text-pink-900">OB/GYN Specific Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Last Menstrual Period (LMP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={form.lastMenstrualPeriod || ""}
              onChange={(e) => onFieldChange("lastMenstrualPeriod", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-medium text-gray-600 mb-1">
              Estimated Due Date (EDD) <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={form.estimatedDueDate || ""}
              onChange={(e) => onFieldChange("estimatedDueDate", e.target.value)}
              required
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SpecialtySpecificFields;
