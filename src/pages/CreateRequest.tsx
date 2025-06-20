
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { RequestFormData } from "@/types/request";
import PatientInfoSection from "@/components/request/PatientInfoSection";
import HospitalInfoSection from "@/components/request/HospitalInfoSection";
import MedicalInfoSection from "@/components/request/MedicalInfoSection";
import SpecialtySpecificFields from "@/components/request/SpecialtySpecificFields";
import SurgeryDetailsSection from "@/components/request/SurgeryDetailsSection";
import NotesSection from "@/components/request/NotesSection";
import AttachmentSection from "@/components/request/AttachmentSection";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

const CreateRequest = () => {
  const [form, setForm] = useState<Partial<RequestFormData>>({});
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-capture date and time on component mount
  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
    
    setForm(prev => ({
      ...prev,
      dateCreated: currentDate,
      timeCreated: currentTime
    }));
  }, []);

  function handleFieldChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSpecialtyChange(specialty: string) {
    setSelectedSpecialty(specialty);
    setSelectedDoctor(""); // Reset doctor when specialty changes
    setForm((prev) => ({ 
      ...prev, 
      specialty,
      doctorName: "", 
      serviceDescription: "",
      referredToHospital: "",
      // Clear specialty-specific fields
      requiredImplant: "",
      lastMenstrualPeriod: "",
      estimatedDueDate: ""
    }));
  }

  function handleDoctorChange(doctor: string) {
    setSelectedDoctor(doctor);
    setForm((prev) => ({
      ...prev,
      doctorName: doctor,
      referredToHospital: "" // Reset hospital when doctor changes
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

  function handlePrintReport() {
    const printContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; color: #1e40af;">Medical Request Report</h1>
        <hr style="margin: 20px 0;">
        
        <div style="margin-bottom: 20px;">
          <h3>Request Information</h3>
          <p><strong>Date Created:</strong> ${form.dateCreated}</p>
          <p><strong>Time Created:</strong> ${form.timeCreated}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Patient Information</h3>
          <p><strong>Name:</strong> ${form.patientName || 'N/A'}</p>
          <p><strong>National ID:</strong> ${form.patientNationalId || 'N/A'}</p>
          <p><strong>Mobile:</strong> ${form.patientMobileNo || 'N/A'}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Medical Information</h3>
          <p><strong>Specialty:</strong> ${form.specialty || 'N/A'}</p>
          <p><strong>Doctor:</strong> ${form.doctorName || 'N/A'}</p>
          <p><strong>Referred From:</strong> ${form.referredFrom || 'N/A'}</p>
          <p><strong>Referred To Hospital:</strong> ${form.referredToHospital || 'N/A'}</p>
          <p><strong>Service:</strong> ${form.serviceDescription || 'N/A'}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Surgery Details</h3>
          <p><strong>Expected Surgery Date:</strong> ${form.expectedSurgeryDate || 'N/A'}</p>
          <p><strong>Admission Type:</strong> ${form.admissionType || 'N/A'}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Notes</h3>
          <p><strong>History:</strong> ${form.history || 'N/A'}</p>
          <p><strong>Notes:</strong> ${form.notes || 'N/A'}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Attachments</h3>
          <p>${attachments.length > 0 ? attachments.map(file => file.name).join(', ') : 'No attachments'}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const requestData = { 
      ...form, 
      status: "Pending", 
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrintReport}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Print Report
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Auto-captured Date and Time Display */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Request Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-blue-700 mb-1">Date Created</label>
                <div className="text-blue-900 font-medium">{form.dateCreated}</div>
              </div>
              <div>
                <label className="block font-medium text-blue-700 mb-1">Time Created</label>
                <div className="text-blue-900 font-medium">{form.timeCreated}</div>
              </div>
            </div>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <PatientInfoSection 
              form={form} 
              onFieldChange={handleFieldChange} 
            />
            
            <MedicalInfoSection 
              form={form} 
              selectedSpecialty={selectedSpecialty}
              selectedDoctor={selectedDoctor}
              onFieldChange={handleFieldChange}
              onSpecialtyChange={handleSpecialtyChange}
              onDoctorChange={handleDoctorChange}
            />

            <SpecialtySpecificFields
              form={form}
              selectedSpecialty={selectedSpecialty}
              onFieldChange={handleFieldChange}
            />
            
            <HospitalInfoSection 
              form={form} 
              onFieldChange={handleFieldChange} 
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
