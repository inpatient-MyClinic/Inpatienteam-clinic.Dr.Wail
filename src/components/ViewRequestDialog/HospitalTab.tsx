
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

  return (
    <div className="space-y-6">
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
