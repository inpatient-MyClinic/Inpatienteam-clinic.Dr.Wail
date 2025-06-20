
import React, { useState } from "react";
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Manager Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Case Manager Information</h3>
          
          <div>
            <Label htmlFor="caseManagerName">Case Manager Name</Label>
            <Input
              id="caseManagerName"
              defaultValue={request.caseManagerName || ""}
              onChange={(e) => onFieldChange("caseManagerName", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="assignedDate">Assigned Date</Label>
            <Input
              id="assignedDate"
              type="date"
              defaultValue={request.assignedDate || ""}
              onChange={(e) => onFieldChange("assignedDate", e.target.value)}
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
          
          <div>
            <Label htmlFor="contactNotes">Contact Notes</Label>
            <Textarea
              id="contactNotes"
              defaultValue={request.contactNotes || ""}
              onChange={(e) => onFieldChange("contactNotes", e.target.value)}
              rows={3}
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
          
          <div>
            <Label htmlFor="estimatedCost">Estimated Cost</Label>
            <Input
              id="estimatedCost"
              type="number"
              defaultValue={request.estimatedCost || ""}
              onChange={(e) => onFieldChange("estimatedCost", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="approvedAmount">Approved Amount</Label>
            <Input
              id="approvedAmount"
              type="number"
              defaultValue={request.approvedAmount || ""}
              onChange={(e) => onFieldChange("approvedAmount", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Follow-up Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Follow-up Information</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nextFollowupDate">Next Follow-up Date</Label>
            <Input
              id="nextFollowupDate"
              type="date"
              defaultValue={request.nextFollowupDate || ""}
              onChange={(e) => onFieldChange("nextFollowupDate", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="followupReason">Follow-up Reason</Label>
            <Input
              id="followupReason"
              defaultValue={request.followupReason || ""}
              onChange={(e) => onFieldChange("followupReason", e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="followupNotes">Follow-up Notes</Label>
          <Textarea
            id="followupNotes"
            defaultValue={request.followupNotes || ""}
            onChange={(e) => onFieldChange("followupNotes", e.target.value)}
            rows={3}
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
