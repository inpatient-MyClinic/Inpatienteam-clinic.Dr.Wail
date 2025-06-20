
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Download } from "lucide-react";

interface RequestTabProps {
  request: any;
  onFieldChange: (field: string, value: any) => void;
}

export default function RequestTab({ request, onFieldChange }: RequestTabProps) {
  const [attachments, setAttachments] = useState(request.attachments || []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newAttachments = files.map(file => file.name);
    const updatedAttachments = [...attachments, ...newAttachments];
    setAttachments(updatedAttachments);
    onFieldChange("attachments", updatedAttachments);
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_: any, i: number) => i !== index);
    setAttachments(updatedAttachments);
    onFieldChange("attachments", updatedAttachments);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Patient Information</h3>
          
          <div>
            <Label htmlFor="patientName">Patient Name</Label>
            <Input
              id="patientName"
              defaultValue={request.patientName || ""}
              onChange={(e) => onFieldChange("patientName", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="mrn">MRN</Label>
            <Input
              id="mrn"
              defaultValue={request.mrn || ""}
              onChange={(e) => onFieldChange("mrn", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              defaultValue={request.phone || ""}
              onChange={(e) => onFieldChange("phone", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              defaultValue={request.idNumber || ""}
              onChange={(e) => onFieldChange("idNumber", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                defaultValue={request.age || ""}
                onChange={(e) => onFieldChange("age", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select defaultValue={request.gender || ""} onValueChange={(value) => onFieldChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              defaultValue={request.nationality || ""}
              onChange={(e) => onFieldChange("nationality", e.target.value)}
            />
          </div>
        </div>

        {/* Medical Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Medical Information</h3>
          
          <div>
            <Label htmlFor="serviceDescription">Service Description</Label>
            <Textarea
              id="serviceDescription"
              defaultValue={request.serviceDescription || ""}
              onChange={(e) => onFieldChange("serviceDescription", e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              defaultValue={request.diagnosis || ""}
              onChange={(e) => onFieldChange("diagnosis", e.target.value)}
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="urgency">Urgency</Label>
            <Select defaultValue={request.urgency || "Normal"} onValueChange={(value) => onFieldChange("urgency", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="expectedSurgeryDate">Expected Surgery Date</Label>
            <Input
              id="expectedSurgeryDate"
              type="date"
              defaultValue={request.expectedSurgeryDate || ""}
              onChange={(e) => onFieldChange("expectedSurgeryDate", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="hospital">Hospital</Label>
            <Select defaultValue={request.hospital || ""} onValueChange={(value) => onFieldChange("hospital", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hospital" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="King Khaled Hospital">King Khaled Hospital</SelectItem>
                <SelectItem value="King Abdulaziz Hospital">King Abdulaziz Hospital</SelectItem>
                <SelectItem value="King Faisal Hospital">King Faisal Hospital</SelectItem>
                <SelectItem value="Prince Sultan Hospital">Prince Sultan Hospital</SelectItem>
                <SelectItem value="King Fahd Hospital">King Fahd Hospital</SelectItem>
                <SelectItem value="National Guard Hospital">National Guard Hospital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="doctorName">Doctor Name</Label>
            <Input
              id="doctorName"
              defaultValue={request.doctorName || ""}
              onChange={(e) => onFieldChange("doctorName", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              defaultValue={request.specialty || ""}
              onChange={(e) => onFieldChange("specialty", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Medical History</h3>
        
        <div>
          <Label htmlFor="medicalHistory">Medical History</Label>
          <Textarea
            id="medicalHistory"
            defaultValue={request.medicalHistory || ""}
            onChange={(e) => onFieldChange("medicalHistory", e.target.value)}
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="currentMedications">Current Medications</Label>
          <Textarea
            id="currentMedications"
            defaultValue={request.currentMedications || ""}
            onChange={(e) => onFieldChange("currentMedications", e.target.value)}
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="allergies">Allergies</Label>
          <Textarea
            id="allergies"
            defaultValue={request.allergies || ""}
            onChange={(e) => onFieldChange("allergies", e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Insurance Information</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="insuranceCompany">Insurance Company</Label>
            <Input
              id="insuranceCompany"
              defaultValue={request.insuranceCompany || ""}
              onChange={(e) => onFieldChange("insuranceCompany", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="policyNumber">Policy Number</Label>
            <Input
              id="policyNumber"
              defaultValue={request.policyNumber || ""}
              onChange={(e) => onFieldChange("policyNumber", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              defaultValue={request.contactPerson || ""}
              onChange={(e) => onFieldChange("contactPerson", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              defaultValue={request.contactPhone || ""}
              onChange={(e) => onFieldChange("contactPhone", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              defaultValue={request.contactEmail || ""}
              onChange={(e) => onFieldChange("contactEmail", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          defaultValue={request.notes || ""}
          onChange={(e) => onFieldChange("notes", e.target.value)}
          rows={3}
        />
      </div>

      {/* Attachments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Attachments</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload files or drag and drop
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
        
        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm">{attachment}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeAttachment(index)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
