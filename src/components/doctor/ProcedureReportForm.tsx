import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import AIRewriteButton from "@/components/AIRewriteButton";

interface ProcedureFormData {
  patientName: string;
  patientId: string;
  hospital: string;
  procedureDate: string;
  procedureName: string;
  findings: string;
  postOpDiagnosis: string;
  procedureDescription: string;
  postOpProtocol: string;
  postOpInstructions: string;
  mainHistory: string;
}

interface ProcedureReportFormProps {
  form: ProcedureFormData;
  onUpdateField: (field: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  title?: string;
}

export default function ProcedureReportForm({ form, onUpdateField, onSave, onCancel, title = "New Procedure Day Report" }: ProcedureReportFormProps) {
  const TextFieldWithAI = ({ label, field, rows = 3, context }: { label: string; field: string; rows?: number; context?: string }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label className="text-sm font-medium">{label}</Label>
        <AIRewriteButton
          text={form[field as keyof ProcedureFormData]}
          onAccept={(text) => onUpdateField(field, text)}
          context={context || label}
        />
      </div>
      <Textarea
        value={form[field as keyof ProcedureFormData]}
        onChange={(e) => onUpdateField(field, e.target.value)}
        rows={rows}
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Patient Name *</Label>
          <Input value={form.patientName} onChange={(e) => onUpdateField("patientName", e.target.value)} />
        </div>
        <div>
          <Label className="text-sm font-medium">Patient ID</Label>
          <Input value={form.patientId} onChange={(e) => onUpdateField("patientId", e.target.value)} />
        </div>
        <div>
          <Label className="text-sm font-medium">Hospital</Label>
          <Input value={form.hospital} onChange={(e) => onUpdateField("hospital", e.target.value)} />
        </div>
        <div>
          <Label className="text-sm font-medium">Procedure Date</Label>
          <Input type="date" value={form.procedureDate} onChange={(e) => onUpdateField("procedureDate", e.target.value)} />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Procedure Name *</Label>
        <Input value={form.procedureName} onChange={(e) => onUpdateField("procedureName", e.target.value)} />
      </div>

      <TextFieldWithAI label="Clinical History" field="mainHistory" rows={3} context="clinical history" />
      <TextFieldWithAI label="Procedure Description" field="procedureDescription" rows={3} context="procedure description" />
      <TextFieldWithAI label="Findings *" field="findings" rows={3} context="operative findings" />
      <TextFieldWithAI label="Post-Operative Diagnosis" field="postOpDiagnosis" rows={2} context="post-operative diagnosis" />
      <TextFieldWithAI label="Post-Operative Protocol" field="postOpProtocol" rows={3} context="post-operative protocol" />
      <TextFieldWithAI label="Post-Operative Instructions" field="postOpInstructions" rows={3} context="post-operative patient instructions" />

      <Button onClick={onSave} className="w-full">
        <Save className="w-4 h-4 mr-1" /> Save Procedure Report
      </Button>
    </div>
  );
}
