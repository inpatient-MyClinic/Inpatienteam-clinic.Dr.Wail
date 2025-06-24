import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Download } from "lucide-react";

interface CaseCoordinatorTabProps {
  request: any;
  onFieldChange: (field: string, value: any) => void;
}

const caseManagers = [
  "Sarah Ahmed",
  "Mohammed Ali",
  "Fatima Hassan",
  "Omar Ibrahim",
  "Nour Abdullah",
  "Hassan Mohammed",
  "Layla Omar",
  "Youssef Ahmed"
];

const insuranceCompanies = [
  "Bupa Arabia",
  "Tawuniya",
  "Malath Insurance",
  "Walaa Insurance",
  "Al Rajhi Takaful",
  "Sanad Insurance",
  "SABB Takaful",
  "AXA Cooperative Insurance"
];

const coordinatorStatuses = [
  "Under Review",
  "Approved by Coordinator",
  "Submitted to Hospital",
  "Need More Information",
  "Pending Patient Response"
];

export default function CaseCoordinatorTab({ request, onFieldChange }: CaseCoordinatorTabProps) {
  const [attachments, setAttachments] = useState(request.coordinatorAttachments || []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newAttachments = files.map(file => file.name);
    const updatedAttachments = [...attachments, ...newAttachments];
    setAttachments(updatedAttachments);
    onFieldChange("coordinatorAttachments", updatedAttachments);
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_: any, i: number) => i !== index);
    setAttachments(updatedAttachments);
    onFieldChange("coordinatorAttachments", updatedAttachments);
  };

  const handleCaseManagerChange = (value: string) => {
    onFieldChange("caseManagerName", value);
    // Auto-capture assigned date when case manager is selected
    const today = new Date().toISOString().split('T')[0];
    onFieldChange("assignedDate", today);
  };

  const handleStatusChange = (value: string) => {
    onFieldChange("coordinatorStatus", value);
    
    // Auto-update to "Submitted to Hospital" when coordinator submits
    if (value === "Submitted to Hospital") {
      onFieldChange("submittedToHospitalDate", new Date().toISOString().split('T')[0]);
      // This will trigger notification in the parent component
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Field */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Case Coordinator Status</h3>
        <div>
          <Label htmlFor="coordinatorStatus">Status</Label>
          <Select defaultValue={request.coordinatorStatus || ""} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {coordinatorStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {request.submittedToHospitalDate && (
          <div className="mt-3 text-sm text-green-700">
            Submitted to Hospital on: {request.submittedToHospitalDate}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Manager Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Case Manager Information</h3>
          
          <div>
            <Label htmlFor="caseManagerName">Case Manager Name</Label>
            <Select 
              defaultValue={request.caseManagerName || ""} 
              onValueChange={handleCaseManagerChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select case manager" />
              </SelectTrigger>
              <SelectContent>
                {caseManagers.map((manager) => (
                  <SelectItem key={manager} value={manager}>
                    {manager}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="assignedDate">Assigned Date</Label>
            <Input
              id="assignedDate"
              type="date"
              defaultValue={request.assignedDate || ""}
              onChange={(e) => onFieldChange("assignedDate", e.target.value)}
              readOnly
              className="bg-gray-100"
            />
          </div>
          
          <div>
            <Label htmlFor="coordinatorNotes">Coordinator Notes</Label>
            <Textarea
              id="coordinatorNotes"
              defaultValue={request.coordinatorNotes || ""}
              onChange={(e) => onFieldChange("coordinatorNotes", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Patient Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Patient Contact</h3>
          
          <div>
            <Label htmlFor="patientContacted">Patient Contacted</Label>
            <Select 
              defaultValue={request.patientContacted || ""} 
              onValueChange={(value) => onFieldChange("patientContacted", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Attempted">Attempted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="contactMethod">Contact Method</Label>
            <Select 
              defaultValue={request.contactMethod || ""} 
              onValueChange={(value) => onFieldChange("contactMethod", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="In Person">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="contactDate">Contact Date</Label>
            <Input
              id="contactDate"
              type="datetime-local"
              defaultValue={request.contactDate || ""}
              onChange={(e) => onFieldChange("contactDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Insurance Information</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="insuranceCompany">Insurance Company</Label>
            <Select 
              defaultValue={request.insuranceCompany || ""} 
              onValueChange={(value) => onFieldChange("insuranceCompany", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select insurance company" />
              </SelectTrigger>
              <SelectContent>
                {insuranceCompanies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="policyNumber">Policy Number</Label>
            <Input
              id="policyNumber"
              defaultValue={request.policyNumber || ""}
              onChange={(e) => onFieldChange("policyNumber", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Coverage Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Coverage Information</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="coverageType">Type of Coverage</Label>
            <Select 
              defaultValue={request.coverageType || ""} 
              onValueChange={(value) => onFieldChange("coverageType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select coverage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
                <SelectItem value="Charity">Charity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="coverageStatus">Coverage Status</Label>
            <Select 
              defaultValue={request.coverageStatus || ""} 
              onValueChange={(value) => onFieldChange("coverageStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Denied">Denied</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Follow-up Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Follow-up Information</h3>
        
        <div>
          <Label htmlFor="nextOPDVisit">Next OPD Visit</Label>
          <Input
            id="nextOPDVisit"
            type="date"
            defaultValue={request.nextOPDVisit || ""}
            onChange={(e) => onFieldChange("nextOPDVisit", e.target.value)}
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Case Coordinator Attachments</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="coordinator-file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload coordinator files
                </span>
                <input
                  id="coordinator-file-upload"
                  name="coordinator-file-upload"
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
