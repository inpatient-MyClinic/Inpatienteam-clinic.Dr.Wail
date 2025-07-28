
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface SpecialtySpecificFieldsProps {
  specialty: string;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const SpecialtySpecificFields = ({ specialty, formData, handleInputChange }: SpecialtySpecificFieldsProps) => {
  const nonAssistanceHospitals = ["DSFH (main)", "DSFH (Basateen Branch)", "EMC/ European Medical Center"];
  const assistanceSpecialties = ["orthopedics", "general_surgery", "ent"];
  
  const shouldShowAssistanceField = !nonAssistanceHospitals.includes(formData.hospitalName) && 
                                   assistanceSpecialties.includes(specialty);

  const renderAssistanceField = () => {
    if (!shouldShowAssistanceField) return null;

    return (
      <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="assistanceNeeded"
            checked={formData.assistanceNeeded || false}
            onCheckedChange={(checked) => handleInputChange('assistanceNeeded', checked)}
          />
          <Label htmlFor="assistanceNeeded" className="text-sm font-medium">
            Assistance Needed
          </Label>
        </div>
        
        {formData.assistanceNeeded && (
          <div>
            <Label htmlFor="companySystem">Company/System Needed</Label>
            <Input
              id="companySystem"
              value={formData.companySystem || ''}
              onChange={(e) => handleInputChange('companySystem', e.target.value)}
              placeholder="Enter company or system requirements"
            />
          </div>
        )}
      </div>
    );
  };

  switch (specialty) {
    case 'orthopedics':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="requiredImplant">Required Implant *</Label>
            <Input
              id="requiredImplant"
              value={formData.requiredImplant || ''}
              onChange={(e) => handleInputChange('requiredImplant', e.target.value)}
              placeholder="Specify implant details"
              required
            />
          </div>
          {renderAssistanceField()}
        </div>
      );

    case 'obgyn':
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="lastMenstrualPeriod">Last Menstrual Period *</Label>
            <Input
              id="lastMenstrualPeriod"
              type="date"
              value={formData.lastMenstrualPeriod || ''}
              onChange={(e) => handleInputChange('lastMenstrualPeriod', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="estimatedDueDate">Estimated Due Date *</Label>
            <Input
              id="estimatedDueDate"
              type="date"
              value={formData.estimatedDueDate || ''}
              onChange={(e) => handleInputChange('estimatedDueDate', e.target.value)}
              required
            />
          </div>
        </div>
      );

    case 'general_surgery':
      return (
        <div className="space-y-4">
          {renderAssistanceField()}
        </div>
      );

    case 'ent':
      return (
        <div className="space-y-4">
          {renderAssistanceField()}
        </div>
      );

    default:
      return null;
  }
};

export default SpecialtySpecificFields;
