
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PatientInfoSection from "./PatientInfoSection";
import MedicalInfoSection from "./MedicalInfoSection";
import MedicalHistorySection from "./MedicalHistorySection";
import InsuranceContactSection from "./InsuranceContactSection";
import AdditionalInfoSection from "./AdditionalInfoSection";
import AttachmentsSection from "./AttachmentsSection";
import DialogActions from "./DialogActions";

interface ViewRequestDialogProps {
  request: any;
  onStatusUpdate?: (requestId: number, newStatus: string, notes?: string) => void;
}

export default function ViewRequestDialog({ request, onStatusUpdate }: ViewRequestDialogProps) {
  const [localData, setLocalData] = useState({
    patientName: request.patientName || "",
    mrn: request.mrn || "",
    phone: request.phone || "",
    idNumber: request.idNumber || "",
    age: request.age || "",
    gender: request.gender || "",
    nationality: request.nationality || "",
    serviceDescription: request.serviceDescription || "",
    diagnosis: request.diagnosis || "",
    urgency: request.urgency || "Normal",
    expectedSurgeryDate: request.expectedSurgeryDate || "",
    hospital: request.hospital || "",
    doctorName: request.doctorName || "",
    specialty: request.specialty || "",
    medicalHistory: request.medicalHistory || "",
    currentMedications: request.currentMedications || "",
    allergies: request.allergies || "",
    insuranceCompany: request.insuranceCompany || "",
    policyNumber: request.policyNumber || "",
    contactPerson: request.contactPerson || "",
    contactPhone: request.contactPhone || "",
    contactEmail: request.contactEmail || "",
    notes: request.notes || "",
    status: request.status || "",
    rejectionReason: request.rejectionReason || ""
  });

  const [hasModifications, setHasModifications] = useState(false);
  const { toast } = useToast();

  const handleFieldChange = (field: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check if any field has been modified from original
    const isModified = Object.keys(localData).some(key => {
      if (key === field) return value !== (request[key] || "");
      return localData[key as keyof typeof localData] !== (request[key] || "");
    });

    setHasModifications(isModified);
  };

  const handleSubmit = () => {
    if (onStatusUpdate) {
      onStatusUpdate(request.id, localData.status, localData.notes);
    }
    
    setHasModifications(false);
    
    toast({
      title: "Request Updated",
      description: "Request has been updated successfully",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Details - {request.patientName}</DialogTitle>
          <DialogDescription>
            Complete request information and medical details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientInfoSection localData={localData} onFieldChange={handleFieldChange} />
            <MedicalInfoSection localData={localData} onFieldChange={handleFieldChange} />
          </div>
          
          <MedicalHistorySection localData={localData} onFieldChange={handleFieldChange} />
          <InsuranceContactSection localData={localData} onFieldChange={handleFieldChange} />
          <AdditionalInfoSection localData={localData} onFieldChange={handleFieldChange} />
          
          {request.attachments && request.attachments.length > 0 && (
            <AttachmentsSection attachments={request.attachments} />
          )}
          
          {hasModifications && (
            <DialogActions onSubmit={handleSubmit} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
