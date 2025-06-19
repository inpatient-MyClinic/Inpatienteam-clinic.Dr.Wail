
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Printer, Copy, Download, Upload, Send, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ViewRequestDialogProps {
  request: any;
}

export default function ViewRequestDialog({ request }: ViewRequestDialogProps) {
  const { toast } = useToast();
  
  // Local state for all editable fields
  const [localData, setLocalData] = useState({
    patientName: request.patientName || "",
    mrn: request.mrn || "",
    phone: request.phone || "",
    nationalId: request.nationalId || "",
    age: request.age || "",
    gender: request.gender || "",
    serviceDescription: request.serviceDescription || "",
    specialty: request.specialty || "",
    doctor: request.doctor || "",
    priority: request.priority || "",
    expectedSurgeryDate: request.expectedSurgeryDate || "",
    medicalHistory: request.medicalHistory || "",
    currentMedications: request.currentMedications || "",
    allergies: request.allergies || "",
    insuranceProvider: request.insuranceProvider || "",
    insuranceNumber: request.insuranceNumber || "",
    emergencyContact: request.emergencyContact || "",
    referringDoctor: request.referringDoctor || "",
    diagnosisCode: request.diagnosisCode || "",
    procedureCode: request.procedureCode || "",
    additionalNotes: request.additionalNotes || "",
    status: request.status || ""
  });

  const [localAttachment, setLocalAttachment] = useState<File | null>(null);
  const [hasModifications, setHasModifications] = useState(false);

  // Check if any field has been modified
  const checkForModifications = (newData: typeof localData) => {
    const isModified = Object.keys(newData).some(key => {
      return newData[key as keyof typeof newData] !== (request[key] || "");
    });
    setHasModifications(isModified);
  };

  const handleFieldChange = (field: keyof typeof localData, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    checkForModifications(newData);
  };

  const handlePrintRequest = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Request - ${localData.patientName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .field { margin-bottom: 10px; }
              .label { font-weight: bold; }
              .value { margin-left: 10px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Medical Request Details</h1>
              <p>Request ID: ${request.id} | Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="grid">
              <div class="section">
                <h2>Patient Information</h2>
                <div class="field"><span class="label">Name:</span><span class="value">${localData.patientName}</span></div>
                <div class="field"><span class="label">MRN:</span><span class="value">${localData.mrn}</span></div>
                <div class="field"><span class="label">Phone:</span><span class="value">${localData.phone}</span></div>
                <div class="field"><span class="label">National ID:</span><span class="value">${localData.nationalId}</span></div>
                <div class="field"><span class="label">Age:</span><span class="value">${localData.age}</span></div>
                <div class="field"><span class="label">Gender:</span><span class="value">${localData.gender}</span></div>
              </div>
              
              <div class="section">
                <h2>Medical Information</h2>
                <div class="field"><span class="label">Service:</span><span class="value">${localData.serviceDescription}</span></div>
                <div class="field"><span class="label">Specialty:</span><span class="value">${localData.specialty}</span></div>
                <div class="field"><span class="label">Doctor:</span><span class="value">${localData.doctor}</span></div>
                <div class="field"><span class="label">Priority:</span><span class="value">${localData.priority}</span></div>
                <div class="field"><span class="label">Surgery Date:</span><span class="value">${new Date(localData.expectedSurgeryDate).toLocaleDateString()}</span></div>
              </div>
            </div>
            
            <div class="section">
              <h2>Medical History & Medications</h2>
              <div class="field"><span class="label">Medical History:</span><span class="value">${localData.medicalHistory}</span></div>
              <div class="field"><span class="label">Current Medications:</span><span class="value">${localData.currentMedications}</span></div>
              <div class="field"><span class="label">Allergies:</span><span class="value">${localData.allergies}</span></div>
            </div>
            
            <div class="section">
              <h2>Insurance & Contact Information</h2>
              <div class="field"><span class="label">Insurance Provider:</span><span class="value">${localData.insuranceProvider}</span></div>
              <div class="field"><span class="label">Insurance Number:</span><span class="value">${localData.insuranceNumber}</span></div>
              <div class="field"><span class="label">Emergency Contact:</span><span class="value">${localData.emergencyContact}</span></div>
              <div class="field"><span class="label">Referring Doctor:</span><span class="value">${localData.referringDoctor}</span></div>
            </div>
            
            <div class="section">
              <h2>Additional Information</h2>
              <div class="field"><span class="label">Diagnosis Code:</span><span class="value">${localData.diagnosisCode}</span></div>
              <div class="field"><span class="label">Procedure Code:</span><span class="value">${localData.procedureCode}</span></div>
              <div class="field"><span class="label">Status:</span><span class="value">${localData.status}</span></div>
              <div class="field"><span class="label">Submission Date:</span><span class="value">${new Date(request.submissionDate).toLocaleDateString()}</span></div>
              <div class="field"><span class="label">Additional Notes:</span><span class="value">${localData.additionalNotes}</span></div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyRequest = () => {
    const requestData = `
Medical Request Details
========================
Request ID: ${request.id}
Date: ${new Date().toLocaleDateString()}

Patient Information:
- Name: ${localData.patientName}
- MRN: ${localData.mrn}
- Phone: ${localData.phone}
- National ID: ${localData.nationalId}
- Age: ${localData.age}
- Gender: ${localData.gender}

Medical Information:
- Service: ${localData.serviceDescription}
- Specialty: ${localData.specialty}
- Doctor: ${localData.doctor}
- Priority: ${localData.priority}
- Surgery Date: ${new Date(localData.expectedSurgeryDate).toLocaleDateString()}

Medical History & Medications:
- Medical History: ${localData.medicalHistory}
- Current Medications: ${localData.currentMedications}
- Allergies: ${localData.allergies}

Insurance & Contact Information:
- Insurance Provider: ${localData.insuranceProvider}
- Insurance Number: ${localData.insuranceNumber}
- Emergency Contact: ${localData.emergencyContact}
- Referring Doctor: ${localData.referringDoctor}

Additional Information:
- Diagnosis Code: ${localData.diagnosisCode}
- Procedure Code: ${localData.procedureCode}
- Status: ${localData.status}
- Submission Date: ${new Date(request.submissionDate).toLocaleDateString()}
- Additional Notes: ${localData.additionalNotes}
    `.trim();

    navigator.clipboard.writeText(requestData).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Request details have been copied to clipboard.",
      });
    });
  };

  const handleDownloadRequest = () => {
    const requestData = {
      requestId: request.id,
      patientInfo: {
        name: localData.patientName,
        mrn: localData.mrn,
        phone: localData.phone,
        nationalId: localData.nationalId,
        age: localData.age,
        gender: localData.gender
      },
      medicalInfo: {
        service: localData.serviceDescription,
        specialty: localData.specialty,
        doctor: localData.doctor,
        priority: localData.priority,
        surgeryDate: localData.expectedSurgeryDate
      },
      medicalHistory: {
        history: localData.medicalHistory,
        medications: localData.currentMedications,
        allergies: localData.allergies
      },
      insurance: {
        provider: localData.insuranceProvider,
        number: localData.insuranceNumber,
        emergencyContact: localData.emergencyContact,
        referringDoctor: localData.referringDoctor
      },
      additional: {
        diagnosisCode: localData.diagnosisCode,
        procedureCode: localData.procedureCode,
        status: localData.status,
        submissionDate: request.submissionDate,
        notes: localData.additionalNotes
      }
    };

    const dataStr = JSON.stringify(requestData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical-request-${request.id}-${localData.patientName.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Request data is being downloaded as JSON file.",
    });
  };

  const handleLocalSubmit = () => {
    toast({
      title: "Request Updated",
      description: "Request has been modified and notifications sent to doctor and case coordinator.",
    });

    // Reset modifications flag
    setHasModifications(false);
    setLocalAttachment(null);
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
          <DialogTitle className="flex items-center justify-between">
            <span>Request Details - {localData.patientName}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePrintRequest}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyRequest}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownloadRequest}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete request information with all medical and administrative details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Patient Information */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Patient Name</Label>
                  <Input
                    value={localData.patientName}
                    onChange={(e) => handleFieldChange('patientName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>MRN</Label>
                  <Input
                    value={localData.mrn}
                    onChange={(e) => handleFieldChange('mrn', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={localData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>National ID</Label>
                  <Input
                    value={localData.nationalId}
                    onChange={(e) => handleFieldChange('nationalId', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    value={localData.age}
                    onChange={(e) => handleFieldChange('age', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={localData.gender} onValueChange={(value) => handleFieldChange('gender', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Service Description</Label>
                  <Textarea
                    value={localData.serviceDescription}
                    onChange={(e) => handleFieldChange('serviceDescription', e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Specialty</Label>
                  <Input
                    value={localData.specialty}
                    onChange={(e) => handleFieldChange('specialty', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Doctor</Label>
                  <Input
                    value={localData.doctor}
                    onChange={(e) => handleFieldChange('doctor', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={localData.priority} onValueChange={(value) => handleFieldChange('priority', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expected Surgery Date</Label>
                  <Input
                    type="date"
                    value={localData.expectedSurgeryDate}
                    onChange={(e) => handleFieldChange('expectedSurgeryDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Medical History & Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical History & Medications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Medical History</Label>
                <Textarea
                  value={localData.medicalHistory}
                  onChange={(e) => handleFieldChange('medicalHistory', e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Enter medical history..."
                />
              </div>
              <div>
                <Label>Current Medications</Label>
                <Textarea
                  value={localData.currentMedications}
                  onChange={(e) => handleFieldChange('currentMedications', e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Enter current medications..."
                />
              </div>
              <div>
                <Label>Allergies</Label>
                <Textarea
                  value={localData.allergies}
                  onChange={(e) => handleFieldChange('allergies', e.target.value)}
                  className="mt-1"
                  rows={2}
                  placeholder="Enter known allergies..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance & Contact Information */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insurance Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Insurance Provider</Label>
                  <Input
                    value={localData.insuranceProvider}
                    onChange={(e) => handleFieldChange('insuranceProvider', e.target.value)}
                    className="mt-1"
                    placeholder="Enter insurance provider..."
                  />
                </div>
                <div>
                  <Label>Insurance Number</Label>
                  <Input
                    value={localData.insuranceNumber}
                    onChange={(e) => handleFieldChange('insuranceNumber', e.target.value)}
                    className="mt-1"
                    placeholder="Enter insurance number..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Emergency Contact</Label>
                  <Input
                    value={localData.emergencyContact}
                    onChange={(e) => handleFieldChange('emergencyContact', e.target.value)}
                    className="mt-1"
                    placeholder="Enter emergency contact..."
                  />
                </div>
                <div>
                  <Label>Referring Doctor</Label>
                  <Input
                    value={localData.referringDoctor}
                    onChange={(e) => handleFieldChange('referringDoctor', e.target.value)}
                    className="mt-1"
                    placeholder="Enter referring doctor..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Medical Codes & Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical Codes & Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Diagnosis Code</Label>
                  <Input
                    value={localData.diagnosisCode}
                    onChange={(e) => handleFieldChange('diagnosisCode', e.target.value)}
                    className="mt-1"
                    placeholder="Enter diagnosis code..."
                  />
                </div>
                <div>
                  <Label>Procedure Code</Label>
                  <Input
                    value={localData.procedureCode}
                    onChange={(e) => handleFieldChange('procedureCode', e.target.value)}
                    className="mt-1"
                    placeholder="Enter procedure code..."
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={localData.status} onValueChange={(value) => handleFieldChange('status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Need Justification">Need More Justification</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Under Process">Under Process</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><span className="font-medium text-sm text-gray-600">Submission Date:</span> {new Date(request.submissionDate).toLocaleDateString()}</div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={localData.additionalNotes}
                  onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Enter additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {request.attachments.map((attachment: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add New Attachment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Attachment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLocalAttachment(file);
                      setHasModifications(true);
                    }
                  }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="flex-1"
                />
                <Button size="sm" variant="outline">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              {localAttachment && (
                <p className="text-sm text-green-600 mt-1">
                  File selected: {localAttachment.name}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submit Button - Only show when modifications exist */}
          {hasModifications && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleLocalSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Modifications
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
