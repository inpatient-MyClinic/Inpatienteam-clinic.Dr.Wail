
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
  const [localSurgeryDate, setLocalSurgeryDate] = useState(request.expectedSurgeryDate);
  const [localStatus, setLocalStatus] = useState("");
  const [localJustification, setLocalJustification] = useState("");
  const [localAttachment, setLocalAttachment] = useState<File | null>(null);

  const handlePrintRequest = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Request - ${request.patientName}</title>
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
                <div class="field"><span class="label">Name:</span><span class="value">${request.patientName}</span></div>
                <div class="field"><span class="label">MRN:</span><span class="value">${request.mrn}</span></div>
                <div class="field"><span class="label">Phone:</span><span class="value">${request.phone || 'N/A'}</span></div>
                <div class="field"><span class="label">National ID:</span><span class="value">${request.nationalId || 'N/A'}</span></div>
                <div class="field"><span class="label">Age:</span><span class="value">${request.age || 'N/A'}</span></div>
                <div class="field"><span class="label">Gender:</span><span class="value">${request.gender || 'N/A'}</span></div>
              </div>
              
              <div class="section">
                <h2>Medical Information</h2>
                <div class="field"><span class="label">Service:</span><span class="value">${request.serviceDescription}</span></div>
                <div class="field"><span class="label">Specialty:</span><span class="value">${request.specialty}</span></div>
                <div class="field"><span class="label">Doctor:</span><span class="value">${request.doctor}</span></div>
                <div class="field"><span class="label">Priority:</span><span class="value">${request.priority || 'N/A'}</span></div>
                <div class="field"><span class="label">Surgery Date:</span><span class="value">${new Date(request.expectedSurgeryDate).toLocaleDateString()}</span></div>
              </div>
            </div>
            
            <div class="section">
              <h2>Medical History & Medications</h2>
              <div class="field"><span class="label">Medical History:</span><span class="value">${request.medicalHistory || 'No medical history provided'}</span></div>
              <div class="field"><span class="label">Current Medications:</span><span class="value">${request.currentMedications || 'No current medications listed'}</span></div>
              <div class="field"><span class="label">Allergies:</span><span class="value">${request.allergies || 'No known allergies'}</span></div>
            </div>
            
            <div class="section">
              <h2>Insurance & Contact Information</h2>
              <div class="field"><span class="label">Insurance Provider:</span><span class="value">${request.insuranceProvider || 'N/A'}</span></div>
              <div class="field"><span class="label">Insurance Number:</span><span class="value">${request.insuranceNumber || 'N/A'}</span></div>
              <div class="field"><span class="label">Emergency Contact:</span><span class="value">${request.emergencyContact || 'N/A'}</span></div>
              <div class="field"><span class="label">Referring Doctor:</span><span class="value">${request.referringDoctor || 'N/A'}</span></div>
            </div>
            
            <div class="section">
              <h2>Additional Information</h2>
              <div class="field"><span class="label">Diagnosis Code:</span><span class="value">${request.diagnosisCode || 'N/A'}</span></div>
              <div class="field"><span class="label">Procedure Code:</span><span class="value">${request.procedureCode || 'N/A'}</span></div>
              <div class="field"><span class="label">Status:</span><span class="value">${request.status}</span></div>
              <div class="field"><span class="label">Submission Date:</span><span class="value">${new Date(request.submissionDate).toLocaleDateString()}</span></div>
              <div class="field"><span class="label">Additional Notes:</span><span class="value">${request.additionalNotes || 'No additional notes provided'}</span></div>
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
- Name: ${request.patientName}
- MRN: ${request.mrn}
- Phone: ${request.phone || 'N/A'}
- National ID: ${request.nationalId || 'N/A'}
- Age: ${request.age || 'N/A'}
- Gender: ${request.gender || 'N/A'}

Medical Information:
- Service: ${request.serviceDescription}
- Specialty: ${request.specialty}
- Doctor: ${request.doctor}
- Priority: ${request.priority || 'N/A'}
- Surgery Date: ${new Date(request.expectedSurgeryDate).toLocaleDateString()}

Medical History & Medications:
- Medical History: ${request.medicalHistory || 'N/A'}
- Current Medications: ${request.currentMedications || 'N/A'}
- Allergies: ${request.allergies || 'None known'}

Insurance & Contact Information:
- Insurance Provider: ${request.insuranceProvider || 'N/A'}
- Insurance Number: ${request.insuranceNumber || 'N/A'}
- Emergency Contact: ${request.emergencyContact || 'N/A'}
- Referring Doctor: ${request.referringDoctor || 'N/A'}

Additional Information:
- Diagnosis Code: ${request.diagnosisCode || 'N/A'}
- Procedure Code: ${request.procedureCode || 'N/A'}
- Status: ${request.status}
- Submission Date: ${new Date(request.submissionDate).toLocaleDateString()}
- Additional Notes: ${request.additionalNotes || 'None'}
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
        name: request.patientName,
        mrn: request.mrn,
        phone: request.phone,
        nationalId: request.nationalId,
        age: request.age,
        gender: request.gender
      },
      medicalInfo: {
        service: request.serviceDescription,
        specialty: request.specialty,
        doctor: request.doctor,
        priority: request.priority,
        surgeryDate: request.expectedSurgeryDate
      },
      medicalHistory: {
        history: request.medicalHistory,
        medications: request.currentMedications,
        allergies: request.allergies
      },
      insurance: {
        provider: request.insuranceProvider,
        number: request.insuranceNumber,
        emergencyContact: request.emergencyContact,
        referringDoctor: request.referringDoctor
      },
      additional: {
        diagnosisCode: request.diagnosisCode,
        procedureCode: request.procedureCode,
        status: request.status,
        submissionDate: request.submissionDate,
        notes: request.additionalNotes
      }
    };

    const dataStr = JSON.stringify(requestData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical-request-${request.id}-${request.patientName.replace(/\s+/g, '-')}.json`;
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
    if (localStatus === "Need Justification" && !localJustification.trim()) {
      toast({
        title: "Error",
        description: "Please provide justification text.",
        variant: "destructive"
      });
      return;
    }

    if (localStatus === "Rejected" && !localJustification.trim()) {
      toast({
        title: "Error",
        description: "Please provide rejection reason.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Request Updated",
      description: "Request has been modified and notifications sent to doctor and case coordinator.",
    });

    // Reset form
    setLocalSurgeryDate(request.expectedSurgeryDate);
    setLocalStatus("");
    setLocalJustification("");
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
            <span>Request Details - {request.patientName}</span>
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
                <div><span className="font-medium">Name:</span> {request.patientName}</div>
                <div><span className="font-medium">MRN:</span> {request.mrn}</div>
                <div><span className="font-medium">Phone:</span> {request.phone || 'N/A'}</div>
                <div><span className="font-medium">National ID:</span> {request.nationalId || 'N/A'}</div>
                <div><span className="font-medium">Age:</span> {request.age || 'N/A'}</div>
                <div><span className="font-medium">Gender:</span> {request.gender || 'N/A'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><span className="font-medium">Service:</span> {request.serviceDescription}</div>
                <div><span className="font-medium">Specialty:</span> {request.specialty}</div>
                <div><span className="font-medium">Doctor:</span> {request.doctor}</div>
                <div><span className="font-medium">Priority:</span> {request.priority || 'N/A'}</div>
                <div><span className="font-medium">Surgery Date:</span> {new Date(request.expectedSurgeryDate).toLocaleDateString()}</div>
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
                <Label className="font-medium">Medical History</Label>
                <div className="mt-1 p-3 bg-blue-50 rounded-md text-sm">
                  {request.medicalHistory || 'No medical history provided'}
                </div>
              </div>
              <div>
                <Label className="font-medium">Current Medications</Label>
                <div className="mt-1 p-3 bg-green-50 rounded-md text-sm">
                  {request.currentMedications || 'No current medications listed'}
                </div>
              </div>
              <div>
                <Label className="font-medium">Allergies</Label>
                <div className="mt-1 p-3 bg-red-50 rounded-md text-sm">
                  {request.allergies || 'No known allergies'}
                </div>
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
                <div><span className="font-medium">Provider:</span> {request.insuranceProvider || 'N/A'}</div>
                <div><span className="font-medium">Insurance Number:</span> {request.insuranceNumber || 'N/A'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><span className="font-medium">Emergency Contact:</span> {request.emergencyContact || 'N/A'}</div>
                <div><span className="font-medium">Referring Doctor:</span> {request.referringDoctor || 'N/A'}</div>
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
                <div><span className="font-medium">Diagnosis Code:</span> {request.diagnosisCode || 'N/A'}</div>
                <div><span className="font-medium">Procedure Code:</span> {request.procedureCode || 'N/A'}</div>
              </div>
              <div><span className="font-medium">Submission Date:</span> {new Date(request.submissionDate).toLocaleDateString()}</div>
              <div>
                <Label className="font-medium">Additional Notes</Label>
                <div className="mt-1 p-3 bg-yellow-50 rounded-md text-sm">
                  {request.additionalNotes || 'No additional notes provided'}
                </div>
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

          {/* Modification Section */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">Modify Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Surgery Date Modification */}
                <div>
                  <Label>Agreed Date of Surgery</Label>
                  <Input
                    type="date"
                    value={localSurgeryDate}
                    onChange={(e) => setLocalSurgeryDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Status Change */}
                <div>
                  <Label>Status Change</Label>
                  <Select value={localStatus} onValueChange={setLocalStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Need Justification">Need More Justification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Justification Section */}
                {(localStatus === "Need Justification" || localStatus === "Rejected") && (
                  <div className={`space-y-4 p-4 rounded-lg ${localStatus === "Need Justification" ? "bg-yellow-50" : "bg-red-50"}`}>
                    <div>
                      <Label>
                        {localStatus === "Need Justification" ? "Reason for Justification" : "Reason for Rejection"}
                      </Label>
                      <Textarea
                        placeholder={localStatus === "Need Justification" 
                          ? "Please provide the reason for requesting additional justification..." 
                          : "Please provide the reason for rejection..."
                        }
                        value={localJustification}
                        onChange={(e) => setLocalJustification(e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label>Upload Attachment (Optional)</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setLocalAttachment(file);
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
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  onClick={handleLocalSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!localStatus}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
