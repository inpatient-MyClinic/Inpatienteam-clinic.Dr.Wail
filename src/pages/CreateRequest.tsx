import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

// Specialty and doctor data
const specialties = [
  { value: "cardiology", label: "Cardiology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "neurology", label: "Neurology" },
  { value: "general_surgery", label: "General Surgery" },
  { value: "pediatrics", label: "Pediatrics" },
];

const doctorsBySpecialty = {
  cardiology: [
    { value: "dr_ahmed_hassan", label: "Dr. Ahmed Hassan" },
    { value: "dr_fatima_ali", label: "Dr. Fatima Ali" },
  ],
  orthopedics: [
    { value: "dr_omar_khalil", label: "Dr. Omar Khalil" },
    { value: "dr_sara_mahmoud", label: "Dr. Sara Mahmoud" },
  ],
  neurology: [
    { value: "dr_mohamed_ibrahim", label: "Dr. Mohamed Ibrahim" },
    { value: "dr_nora_hassan", label: "Dr. Nora Hassan" },
  ],
  general_surgery: [
    { value: "dr_khaled_ahmed", label: "Dr. Khaled Ahmed" },
    { value: "dr_layla_omar", label: "Dr. Layla Omar" },
  ],
  pediatrics: [
    { value: "dr_ali_salem", label: "Dr. Ali Salem" },
    { value: "dr_maryam_farouk", label: "Dr. Maryam Farouk" },
  ],
};

const servicesBySpecialty = {
  cardiology: [
    "Cardiac Catheterization",
    "Coronary Angioplasty",
    "Pacemaker Implantation",
    "Heart Valve Repair",
  ],
  orthopedics: [
    "Joint Replacement Surgery",
    "Arthroscopic Surgery",
    "Fracture Repair",
    "Spine Surgery",
  ],
  neurology: [
    "Brain Tumor Surgery",
    "Spinal Cord Surgery",
    "Epilepsy Surgery",
    "Deep Brain Stimulation",
  ],
  general_surgery: [
    "Appendectomy",
    "Gallbladder Surgery",
    "Hernia Repair",
    "Bowel Surgery",
  ],
  pediatrics: [
    "Pediatric Heart Surgery",
    "Cleft Palate Repair",
    "Pediatric Orthopedic Surgery",
    "Neonatal Surgery",
  ],
};

const CreateRequest = () => {
  const [form, setForm] = useState<any>({});
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const availableDoctors = selectedSpecialty ? doctorsBySpecialty[selectedSpecialty] || [] : [];
  const availableServices = selectedSpecialty ? servicesBySpecialty[selectedSpecialty] || [] : [];

  function handleFieldChange(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  function handleSpecialtyChange(specialty: string) {
    setSelectedSpecialty(specialty);
    setForm((prev: any) => ({ 
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
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Create New Request</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
        >
          Back to Dashboard
        </Button>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium text-gray-600 mb-1">Patient Name</label>
          <Input
            value={form.patientName || ""}
            onChange={(e) => handleFieldChange("patientName", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Patient National ID</label>
          <Input
            value={form.patientNationalId || ""}
            onChange={(e) => handleFieldChange("patientNationalId", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Patient Mobile No.</label>
          <Input
            value={form.patientMobileNo || ""}
            onChange={(e) => handleFieldChange("patientMobileNo", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Hospital MRN</label>
          <Input
            value={form.hospitalMRN || ""}
            onChange={(e) => handleFieldChange("hospitalMRN", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Hospital Name</label>
          <Select value={form.hospitalName || ""} onValueChange={(value) => handleFieldChange("hospitalName", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="King Fahad Hospital">King Fahad Hospital</SelectItem>
              <SelectItem value="King Faisal Hospital">King Faisal Hospital</SelectItem>
              <SelectItem value="King Abdulaziz Hospital">King Abdulaziz Hospital</SelectItem>
              <SelectItem value="Prince Sultan Hospital">Prince Sultan Hospital</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Specialty</label>
          <Select value={selectedSpecialty} onValueChange={handleSpecialtyChange}>
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
            <Select value={form.doctorName || ""} onValueChange={(value) => handleFieldChange("doctorName", value)}>
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
            <Select value={form.serviceDescription || ""} onValueChange={(value) => handleFieldChange("serviceDescription", value)}>
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

        <div>
          <label className="block font-medium text-gray-600 mb-1">Expected Surgery Date</label>
          <Input
            type="date"
            value={form.expectedSurgeryDate || ""}
            onChange={(e) => handleFieldChange("expectedSurgeryDate", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Type of Admission</label>
          <Select value={form.admissionType || ""} onValueChange={(value) => handleFieldChange("admissionType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select admission type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inpatient">Inpatient</SelectItem>
              <SelectItem value="outpatient">Outpatient</SelectItem>
              <SelectItem value="day_surgery">Day Surgery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Expected Revenue (SAR)</label>
          <Input
            type="number"
            value={form.expectedRevenue || ""}
            onChange={(e) => handleFieldChange("expectedRevenue", e.target.value)}
            placeholder="Enter expected revenue"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Actual Revenue (SAR)</label>
          <Input
            type="number"
            value={form.actualRevenue || ""}
            onChange={(e) => handleFieldChange("actualRevenue", e.target.value)}
            placeholder="Enter actual revenue (if completed)"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">History</label>
          <Textarea
            value={form.history || ""}
            onChange={(e) => handleFieldChange("history", e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Notes (optional)</label>
          <Textarea
            value={form.notes || ""}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            rows={2}
          />
        </div>

        <div>
          <label className="block font-medium text-gray-600 mb-1">Attachments</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload files</span>
              <span className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG</span>
            </label>
          </div>
          
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          Create Request
        </Button>
      </form>
    </div>
  );
};

export default CreateRequest;
