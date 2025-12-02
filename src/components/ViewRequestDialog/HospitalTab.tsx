import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Download } from "lucide-react";

interface HospitalTabProps {
  request: any;
  onFieldChange: (field: string, value: any) => void;
}

const hospitalStatuses = [
  "Received",
  "Under Review by Hospital",
  "Approved by Hospital",
  "Submitted to Insurance",
  "Rejected by Hospital",
  "Need More Information",
  "Surgery Scheduled",
  "Surgery Completed",
  "Discharged"
];

export default function HospitalTab({ request, onFieldChange }: HospitalTabProps) {
  const [attachments, setAttachments] = useState(request.hospitalAttachments || []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newAttachments = files.map(file => file.name);
    const updatedAttachments = [...attachments, ...newAttachments];
    setAttachments(updatedAttachments);
    onFieldChange("hospitalAttachments", updatedAttachments);
  };

  const removeAttachment = (index: number) => {
    const updatedAttachments = attachments.filter((_: any, i: number) => i !== index);
    setAttachments(updatedAttachments);
    onFieldChange("hospitalAttachments", updatedAttachments);
  };

  const handleStatusChange = (value: string) => {
    onFieldChange("hospitalStatus", value);
    
    // Auto-set relevant dates based on status
    const today = new Date().toISOString().split('T')[0];
    
    switch (value) {
      case "Received":
        onFieldChange("hospitalReceivedDate", today);
        break;
      case "Approved by Hospital":
        onFieldChange("hospitalApprovalDate", today);
        break;
      case "Submitted to Insurance":
        onFieldChange("submittedToInsuranceDate", today);
        break;
      case "Surgery Scheduled":
        onFieldChange("surgeryScheduledDate", today);
        break;
      case "Surgery Completed":
        onFieldChange("surgeryCompletedDate", today);
        break;
      case "Discharged":
        onFieldChange("patientDischargedDate", today);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Field */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Hospital Status</h3>
        <div>
          <Label htmlFor="hospitalStatus">Status</Label>
          <Select defaultValue={request.hospitalStatus || ""} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {hospitalStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Status Timeline Display */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {request.hospitalReceivedDate && (
            <div className="text-purple-700">Received: {request.hospitalReceivedDate}</div>
          )}
          {request.hospitalApprovalDate && (
            <div className="text-purple-700">Approved: {request.hospitalApprovalDate}</div>
          )}
          {request.submittedToInsuranceDate && (
            <div className="text-purple-700">Submitted to Insurance: {request.submittedToInsuranceDate}</div>
          )}
          {request.surgeryScheduledDate && (
            <div className="text-purple-700">Surgery Scheduled: {request.surgeryScheduledDate}</div>
          )}
          {request.surgeryCompletedDate && (
            <div className="text-purple-700">Surgery Completed: {request.surgeryCompletedDate}</div>
          )}
          {request.patientDischargedDate && (
            <div className="text-purple-700">Discharged: {request.patientDischargedDate}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insurance & Approval Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Insurance & Approval</h3>
          
          <div>
            <Label htmlFor="insuranceNumber">Insurance Number</Label>
            <Input
              id="insuranceNumber"
              defaultValue={request.insuranceNumber || ""}
              onChange={(e) => onFieldChange("insuranceNumber", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="hospitalFileNumber">Hospital File Number</Label>
            <Input
              id="hospitalFileNumber"
              defaultValue={request.hospitalFileNumber || ""}
              onChange={(e) => onFieldChange("hospitalFileNumber", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="approvalDate">Approval Date</Label>
            <Input
              id="approvalDate"
              type="date"
              defaultValue={request.approvalDate || ""}
              onChange={(e) => onFieldChange("approvalDate", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="approvalNumber">Approval Number</Label>
            <Input
              id="approvalNumber"
              defaultValue={request.approvalNumber || ""}
              onChange={(e) => onFieldChange("approvalNumber", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="approvalStatus">Approval Status</Label>
            <Select 
              defaultValue={request.approvalStatus || ""} 
              onValueChange={(value) => onFieldChange("approvalStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="coverageType">Coverage Type</Label>
            <Select 
              defaultValue={request.coverageType || ""} 
              onValueChange={(value) => onFieldChange("coverageType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select coverage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Coverage</SelectItem>
                <SelectItem value="partial">Partial Coverage</SelectItem>
                <SelectItem value="self_pay">Self Pay</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Surgery & Operation Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Surgery & Operation</h3>
          
          <div>
            <Label htmlFor="anesthesiaDate">Anesthesia Date</Label>
            <Input
              id="anesthesiaDate"
              type="date"
              defaultValue={request.anesthesiaDate || ""}
              onChange={(e) => onFieldChange("anesthesiaDate", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="agreedSurgeryDate">Agreed Surgery Date</Label>
            <Input
              id="agreedSurgeryDate"
              type="date"
              defaultValue={request.agreedSurgeryDate || ""}
              onChange={(e) => onFieldChange("agreedSurgeryDate", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="operationStatus">Status of Operation</Label>
            <Select 
              defaultValue={request.operationStatus || ""} 
              onValueChange={(value) => onFieldChange("operationStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="operationDuration">Operation Duration (hours)</Label>
            <Input
              id="operationDuration"
              type="number"
              step="0.5"
              defaultValue={request.operationDuration || ""}
              onChange={(e) => onFieldChange("operationDuration", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Reason & Category Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Reason & Category</h3>
        
        <div>
          <Label htmlFor="reason">Reason of Pending or Cancellation</Label>
          <Textarea
            id="reason"
            defaultValue={request.reason || ""}
            onChange={(e) => onFieldChange("reason", e.target.value)}
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="categoryOfFailure">Category of Failure (as in Loss Tree)</Label>
          <Select 
            defaultValue={request.categoryOfFailure || ""} 
            onValueChange={(value) => onFieldChange("categoryOfFailure", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Doctor Related">Doctor Related</SelectItem>
              <SelectItem value="Hospital Related">Hospital Related</SelectItem>
              <SelectItem value="Insurance Related">Insurance Related</SelectItem>
              <SelectItem value="Patient Related">Patient Related</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Hospital Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Additional Information</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              defaultValue={request.roomNumber || ""}
              onChange={(e) => onFieldChange("roomNumber", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="bedNumber">Bed Number</Label>
            <Input
              id="bedNumber"
              defaultValue={request.bedNumber || ""}
              onChange={(e) => onFieldChange("bedNumber", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="admissionDate">Admission Date</Label>
            <Input
              id="admissionDate"
              type="date"
              defaultValue={request.admissionDate || ""}
              onChange={(e) => onFieldChange("admissionDate", e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="dischargeDate">Discharge Date</Label>
            <Input
              id="dischargeDate"
              type="date"
              defaultValue={request.dischargeDate || ""}
              onChange={(e) => onFieldChange("dischargeDate", e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="hospitalNotes">Hospital Notes</Label>
          <Textarea
            id="hospitalNotes"
            defaultValue={request.hospitalNotes || ""}
            onChange={(e) => onFieldChange("hospitalNotes", e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hospital Attachments</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="hospital-file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Upload hospital files
                </span>
                <input
                  id="hospital-file-upload"
                  name="hospital-file-upload"
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
