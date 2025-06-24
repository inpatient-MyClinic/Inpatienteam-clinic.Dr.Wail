import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Printer, Download, FileText, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logAuditTrail } from "@/utils/userUtils";
import { getCurrentUserRole } from "@/utils/auth";
import { NotificationService } from "@/services/notificationService";
import RequestTab from "./RequestTab";
import CaseCoordinatorTab from "./CaseCoordinatorTab";
import HospitalTab from "./HospitalTab";

interface ViewRequestDialogProps {
  request: any;
  onStatusUpdate?: (requestId: number, newStatus: string, notes?: string) => void;
  currentUserRole?: string;
}

export default function ViewRequestDialog({ 
  request, 
  onStatusUpdate,
  currentUserRole = "case-coordinator"
}: ViewRequestDialogProps) {
  const [activeTab, setActiveTab] = useState("request");
  const [modifications, setModifications] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [previousStatuses, setPreviousStatuses] = useState({
    requestStatus: request.requestStatus || '',
    coordinatorStatus: request.coordinatorStatus || '',
    hospitalStatus: request.hospitalStatus || ''
  });
  const { toast } = useToast();

  // Log audit trail when dialog opens (view action)
  useEffect(() => {
    if (isOpen) {
      const currentUserEmail = Object.keys(localStorage)
        .find(key => key.startsWith('user_'))
        ?.replace('user_', '') || 'unknown@user.com';
      
      logAuditTrail(
        request.id?.toString() || request.mrn || 'unknown',
        'View',
        {
          action: 'Request viewed',
          tabOpened: activeTab,
          patientName: request.patientName,
          requestType: request.serviceDescription
        },
        currentUserEmail
      );
    }
  }, [isOpen, request]);

  const handleFieldChange = (section: string, field: string, value: any) => {
    const key = `${section}.${field}`;
    const oldValue = request[field] || "";
    
    setModifications(prev => ({
      ...prev,
      [key]: {
        field: field,
        section: section,
        oldValue: oldValue,
        newValue: value,
        modifiedBy: currentUserRole,
        modifiedAt: new Date().toISOString()
      }
    }));

    // Check for status changes and trigger notifications
    if (field.includes('Status')) {
      const oldStatus = previousStatuses[field as keyof typeof previousStatuses] || oldValue;
      if (oldStatus !== value && value) {
        NotificationService.sendRequestStatusChangeNotification(
          request.id || 0,
          request.patientName || 'Unknown Patient',
          oldStatus,
          value,
          currentUserRole
        );
        
        setPreviousStatuses(prev => ({
          ...prev,
          [field]: value
        }));

        toast({
          title: "Status Updated",
          description: `Status changed from "${oldStatus}" to "${value}". Notifications sent to relevant users.`,
        });
      }
    }

    // Handle special logic for "Submitted to Hospital"
    if (field === 'coordinatorStatus' && value === 'Submitted to Hospital') {
      // Auto-set hospital status to "Received"
      setModifications(prev => ({
        ...prev,
        [`hospital.hospitalStatus`]: {
          field: 'hospitalStatus',
          section: 'hospital',
          oldValue: request.hospitalStatus || '',
          newValue: 'Received',
          modifiedBy: currentUserRole,
          modifiedAt: new Date().toISOString()
        }
      }));

      NotificationService.sendHospitalSubmissionNotification(
        request.id || 0,
        request.patientName || 'Unknown Patient',
        request.hospital || 'Unknown Hospital'
      );
    }
  };

  const handlePrint = (sections: string[] = ["request", "coordinator", "hospital"]) => {
    const printContent = document.createElement('div');
    printContent.innerHTML = generatePrintContent(sections);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Request Report - ${request.patientName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .section { margin-bottom: 30px; page-break-inside: avoid; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #333; }
              .field-group { display: flex; margin-bottom: 10px; }
              .field-label { font-weight: bold; width: 150px; }
              .field-value { flex: 1; }
              .attachments { margin-top: 10px; }
              @media print { .no-print { display: none; } }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintContent = (sections: string[]) => {
    let content = `<h1>Request Report - ${request.patientName}</h1>`;
    
    if (sections.includes("request")) {
      content += `
        <div class="section">
          <div class="section-title">Request Information</div>
          <div class="field-group"><span class="field-label">Status:</span><span class="field-value">${request.requestStatus || ""}</span></div>
          <div class="field-group"><span class="field-label">Patient Name:</span><span class="field-value">${request.patientName || ""}</span></div>
          <div class="field-group"><span class="field-label">MRN:</span><span class="field-value">${request.mrn || ""}</span></div>
          <div class="field-group"><span class="field-label">Service:</span><span class="field-value">${request.serviceDescription || ""}</span></div>
          <div class="field-group"><span class="field-label">Hospital:</span><span class="field-value">${request.hospital || ""}</span></div>
          <div class="field-group"><span class="field-label">Doctor:</span><span class="field-value">${request.doctorName || ""}</span></div>
          <div class="field-group"><span class="field-label">Expected Surgery Date:</span><span class="field-value">${request.expectedSurgeryDate || ""}</span></div>
          <div class="field-group"><span class="field-label">Specialty:</span><span class="field-value">${request.specialty || ""}</span></div>
          ${request.visitBookingDate ? `<div class="field-group"><span class="field-label">Visit Booking Date:</span><span class="field-value">${request.visitBookingDate}</span></div>` : ''}
          ${request.requiredImplant ? `<div class="field-group"><span class="field-label">Required Implant:</span><span class="field-value">${request.requiredImplant}</span></div>` : ''}
          ${request.lastMenstrualPeriod ? `<div class="field-group"><span class="field-label">LMP:</span><span class="field-value">${request.lastMenstrualPeriod}</span></div>` : ''}
          ${request.estimatedDueDate ? `<div class="field-group"><span class="field-label">EDD:</span><span class="field-value">${request.estimatedDueDate}</span></div>` : ''}
        </div>
      `;
    }
    
    if (sections.includes("coordinator")) {
      content += `
        <div class="section">
          <div class="section-title">Case Coordinator Information</div>
          <div class="field-group"><span class="field-label">Status:</span><span class="field-value">${request.coordinatorStatus || ""}</span></div>
          <div class="field-group"><span class="field-label">Case Manager:</span><span class="field-value">${request.caseManagerName || ""}</span></div>
          <div class="field-group"><span class="field-label">Assigned Date:</span><span class="field-value">${request.assignedDate || ""}</span></div>
          <div class="field-group"><span class="field-label">Patient Contacted:</span><span class="field-value">${request.patientContacted || ""}</span></div>
          <div class="field-group"><span class="field-label">Contact Method:</span><span class="field-value">${request.contactMethod || ""}</span></div>
          <div class="field-group"><span class="field-label">Contact Date:</span><span class="field-value">${request.contactDate || ""}</span></div>
          <div class="field-group"><span class="field-label">Insurance Company:</span><span class="field-value">${request.insuranceCompany || ""}</span></div>
          <div class="field-group"><span class="field-label">Policy Number:</span><span class="field-value">${request.policyNumber || ""}</span></div>
          <div class="field-group"><span class="field-label">Coverage Type:</span><span class="field-value">${request.coverageType || ""}</span></div>
          <div class="field-group"><span class="field-label">Coverage Status:</span><span class="field-value">${request.coverageStatus || ""}</span></div>
          <div class="field-group"><span class="field-label">Next OPD Visit:</span><span class="field-value">${request.nextOPDVisit || ""}</span></div>
          ${request.submittedToHospitalDate ? `<div class="field-group"><span class="field-label">Submitted to Hospital:</span><span class="field-value">${request.submittedToHospitalDate}</span></div>` : ''}
        </div>
      `;
    }
    
    if (sections.includes("hospital")) {
      content += `
        <div class="section">
          <div class="section-title">Hospital Information</div>
          <div class="field-group"><span class="field-label">Status:</span><span class="field-value">${request.hospitalStatus || ""}</span></div>
          <div class="field-group"><span class="field-label">Insurance Number:</span><span class="field-value">${request.insuranceNumber || ""}</span></div>
          <div class="field-group"><span class="field-label">Hospital File Number:</span><span class="field-value">${request.hospitalFileNumber || ""}</span></div>
          <div class="field-group"><span class="field-label">Approval Date:</span><span class="field-value">${request.approvalDate || ""}</span></div>
          <div class="field-group"><span class="field-label">Approval Number:</span><span class="field-value">${request.approvalNumber || ""}</span></div>
          <div class="field-group"><span class="field-label">Approval Status:</span><span class="field-value">${request.approvalStatus || ""}</span></div>
          <div class="field-group"><span class="field-label">Anesthesia Date:</span><span class="field-value">${request.anesthesiaDate || ""}</span></div>
          <div class="field-group"><span class="field-label">Agreed Surgery Date:</span><span class="field-value">${request.agreedSurgeryDate || ""}</span></div>
          <div class="field-group"><span class="field-label">Operation Status:</span><span class="field-value">${request.operationStatus || ""}</span></div>
          <div class="field-group"><span class="field-label">Operation Duration:</span><span class="field-value">${request.operationDuration || ""} hours</span></div>
          <div class="field-group"><span class="field-label">Reason:</span><span class="field-value">${request.reason || ""}</span></div>
          <div class="field-group"><span class="field-label">Category of Failure:</span><span class="field-value">${request.categoryOfFailure || ""}</span></div>
          <div class="field-group"><span class="field-label">Room Number:</span><span class="field-value">${request.roomNumber || ""}</span></div>
          <div class="field-group"><span class="field-label">Bed Number:</span><span class="field-value">${request.bedNumber || ""}</span></div>
          <div class="field-group"><span class="field-label">Admission Date:</span><span class="field-value">${request.admissionDate || ""}</span></div>
          <div class="field-group"><span class="field-label">Discharge Date:</span><span class="field-value">${request.dischargeDate || ""}</span></div>
        </div>
      `;
    }
    
    return content;
  };

  const handleExportPDF = (sections: string[] = ["request", "coordinator", "hospital"]) => {
    // In a real implementation, you would use a PDF library like jsPDF
    toast({
      title: "Export Started",
      description: "PDF export functionality would be implemented here",
    });
  };

  const handleSaveModifications = () => {
    if (Object.keys(modifications).length === 0) {
      toast({
        title: "No Changes",
        description: "No modifications to save",
        variant: "destructive"
      });
      return;
    }

    const currentUserEmail = Object.keys(localStorage)
      .find(key => key.startsWith('user_'))
      ?.replace('user_', '') || 'unknown@user.com';

    // Log audit trail for modifications
    logAuditTrail(
      request.id?.toString() || request.mrn || 'unknown',
      'Modify',
      {
        action: 'Request modified',
        modificationsCount: Object.keys(modifications).length,
        modifications: modifications,
        patientName: request.patientName,
        requestType: request.serviceDescription
      },
      currentUserEmail
    );

    // Save modifications for audit trail
    console.log("Modifications to save:", modifications);
    
    toast({
      title: "Changes Saved",
      description: "All modifications have been saved and logged in audit trail",
    });
    
    setModifications({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Request Details - {request.patientName}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePrint(["request"])}
              >
                <Printer className="w-4 h-4 mr-1" />
                Print Request
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePrint()}
              >
                <Printer className="w-4 h-4 mr-1" />
                Print All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportPDF()}
              >
                <Download className="w-4 h-4 mr-1" />
                Export PDF
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="coordinator">Case Coordinator</TabsTrigger>
            <TabsTrigger value="hospital">Hospital</TabsTrigger>
          </TabsList>
          
          <TabsContent value="request" className="space-y-4">
            <RequestTab 
              request={request} 
              onFieldChange={(field, value) => handleFieldChange("request", field, value)}
            />
          </TabsContent>
          
          <TabsContent value="coordinator" className="space-y-4">
            <CaseCoordinatorTab 
              request={request} 
              onFieldChange={(field, value) => handleFieldChange("coordinator", field, value)}
            />
          </TabsContent>
          
          <TabsContent value="hospital" className="space-y-4">
            <HospitalTab 
              request={request} 
              onFieldChange={(field, value) => handleFieldChange("hospital", field, value)}
            />
          </TabsContent>
        </Tabs>
        
        {Object.keys(modifications).length > 0 && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setModifications({})}>
              Discard Changes
            </Button>
            <Button onClick={handleSaveModifications}>
              Save Changes ({Object.keys(modifications).length})
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
