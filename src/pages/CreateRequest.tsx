
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RequestFormData } from "@/types/request";
import PatientInfoSection from "@/components/request/PatientInfoSection";
import HospitalInfoSection from "@/components/request/HospitalInfoSection";
import MedicalInfoSection from "@/components/request/MedicalInfoSection";
import SurgeryDetailsSection from "@/components/request/SurgeryDetailsSection";
import NotesSection from "@/components/request/NotesSection";
import AttachmentSection from "@/components/request/AttachmentSection";
import Footer from "@/components/Footer";

const CreateRequest = () => {
  const [form, setForm] = useState<Partial<RequestFormData>>({});
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleFieldChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSpecialtyChange(specialty: string) {
    setSelectedSpecialty(specialty);
    setForm((prev) => ({ 
      ...prev, 
      specialty,
      doctorName: "", 
      serviceDescription: ""
    }));
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  }

  function removeAttachment(index: number) {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const requestData = { 
      ...form, 
      status: "Pending", 
      dateCreated: new Date().toISOString(),
      attachments: attachments.map(file => file.name),
      statusHistory: [
        { status: "Pending", timestamp: new Date().toISOString(), user: "System" }
      ]
    };
    
    console.log("New request created:", requestData);
    
    toast({
      title: "Request Created",
      description: "Request has been successfully created with status: Pending",
    });
    
    setTimeout(() => {
      navigate(-1);
    }, 2000);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/c67ccb49-2aa9-4695-b493-032a2724eaa7.png" 
                alt="Doctor Portal Logo" 
                className="h-10 w-auto"
              />
              <h2 className="text-2xl font-bold text-blue-900">Create New Request</h2>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Back to Dashboard
            </Button>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <PatientInfoSection 
              form={form} 
              onFieldChange={handleFieldChange} 
            />
            
            <HospitalInfoSection 
              form={form} 
              onFieldChange={handleFieldChange} 
            />
            
            <MedicalInfoSection 
              form={form} 
              selectedSpecialty={selectedSpecialty}
              onFieldChange={handleFieldChange}
              onSpecialtyChange={handleSpecialtyChange}
            />
            
            <SurgeryDetailsSection 
              form={form} 
              onFieldChange={handleFieldChange} 
            />
            
            <NotesSection 
              form={form} 
              onFieldChange={handleFieldChange} 
            />
            
            <AttachmentSection 
              attachments={attachments}
              onFileUpload={handleFileUpload}
              onRemoveAttachment={removeAttachment}
            />

            <Button type="submit" className="w-full">
              Create Request
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateRequest;
