
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DialogActionsProps {
  localData: any;
  request: any;
}

export default function DialogActions({ localData, request }: DialogActionsProps) {
  const { toast } = useToast();

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

  return (
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
  );
}
