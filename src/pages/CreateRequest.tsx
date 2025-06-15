
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DOCTOR_NURSE_FIELDS = [
  { key: "dateOfRequest", label: "Date of Request", type: "date" },
  { key: "patientName", label: "Patients Name", type: "text" },
  { key: "patientNationalId", label: "Patients National ID", type: "text" },
  { key: "patientMobileNo", label: "Patients Mobile No.", type: "text" },
  { key: "specialty", label: "Specialty", type: "text" },
  { key: "admissionType", label: "Type of Admission", type: "text" },
  { key: "serviceDescription", label: "Service Description of referred service", type: "textarea" },
  { key: "doctorName", label: "Treating Doctors Name", type: "text" },
  { key: "expectedSurgeryDate", label: "Expected date of Surgery", type: "date" },
  { key: "laterality", label: "Laterality", type: "text" },
  { key: "notes", label: "Notes (optional)", type: "textarea" },
  { key: "history", label: "History", type: "textarea" },
  { key: "attachments", label: "Attachments", type: "file" },
];

const COORDINATOR_FIELDS = [
  { key: "caseManager", label: "Case Manager", type: "text" },
  { key: "patientContacted", label: "Patient Contacted", type: "text" },
  { key: "insuranceCash", label: "Insurance/Cash", type: "text" },
  { key: "insuranceNumber", label: "Insurance Number", type: "text" },
];

const HOSPITAL_FIELDS = [
  { key: "hospitalFileNumber", label: "Hospital File Number", type: "text" },
  { key: "approvalDate", label: "Approval Date", type: "date" },
  { key: "approvalNumber", label: "Approval Number", type: "text" },
  { key: "approvalStatus", label: "Approval Status", type: "text" },
  { key: "orDate", label: "Agreed/Booked/OR date (mm/dd/yyyy)", type: "date" },
  { key: "operationStatus", label: "Status of Operation", type: "text" },
  { key: "reasonPendingCancel", label: "Reason of Pending or Cancellation", type: "textarea" },
  { key: "failureCategory", label: "Category of Failure", type: "text" },
];

const roles = [
  { label: "Doctor/Nurse", value: "doctor_nurse" },
  { label: "Case Coordinator", value: "coordinator" },
  { label: "Hospital", value: "hospital" },
];

function getFieldsForRole(role: string) {
  if (role === "doctor_nurse") return DOCTOR_NURSE_FIELDS;
  if (role === "coordinator") return COORDINATOR_FIELDS;
  if (role === "hospital") return HOSPITAL_FIELDS;
  return [];
}

/**
 * Get a display name for a request entry.
 */
function getRequestSummary(req: any): string {
  if (req.patientName) return `${req.patientName} (${req.patientNationalId || ""})`;
  if (req.patientNationalId) return req.patientNationalId;
  if (req.hospitalFileNumber) return `Hospital File ${req.hospitalFileNumber}`;
  return "Request";
}

const initialRequests: any[] = [];

const CreateRequest = () => {
  // Simulate roles by session state (for demo).
  const [role, setRole] = useState("doctor_nurse");
  // This is in-memory only (lost on refresh); in real app this would be stored backend.
  const [requests, setRequests] = useState(initialRequests);
  // Track new or editing
  const [form, setForm] = useState<any>({});
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [editingRequestIndex, setEditingRequestIndex] = useState<number | null>(null);
  const fields = getFieldsForRole(role);

  // When user picks a request, load it for editing/updating by other roles.
  function loadRequestForEdit(idx: number) {
    setEditingRequestIndex(idx);
    setForm(requests[idx]);
  }

  function handleFieldChange(key: string, value: any) {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  }

  function handleAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAttachments(e.target.files);
    setForm((prev: any) => ({ ...prev, attachments: "Attached" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Which patient this edit is for: match by patientNationalId if present.
    let reqs = [...requests];
    if (editingRequestIndex !== null) {
      reqs[editingRequestIndex] = { ...reqs[editingRequestIndex], ...form };
    } else {
      reqs.push({ ...form });
    }
    setRequests(reqs);
    setForm({});
    setAttachments(null);
    setEditingRequestIndex(null);
  }

  // Find all created patients (by NationalID)
  const knownPatients = requests
    .map((r, idx) => ({
      id: idx,
      summary: getRequestSummary(r),
      patientNationalId: r.patientNationalId || r.insuranceNumber || r.hospitalFileNumber
    }))
    .filter((r) => r.patientNationalId);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">Create Request</h2>
      <div className="mb-4 flex gap-2 justify-center">
        {roles.map((r) => (
          <Button
            key={r.value}
            variant={r.value === role ? "default" : "outline"}
            onClick={() => {
              setRole(r.value);
              setForm({});
              setEditingRequestIndex(null);
            }}
          >
            {r.label}
          </Button>
        ))}
      </div>
      {knownPatients.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-bold mb-2">Known Requests/Patients:</div>
          <div className="flex flex-wrap gap-2">
            {knownPatients.map((p, i) => (
              <Button
                key={p.id}
                variant="secondary"
                size="sm"
                onClick={() => loadRequestForEdit(p.id)}
              >
                {p.summary}
              </Button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">Selecting will load their details so you can update with your role’s fields.</div>
        </div>
      )}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block font-medium text-gray-600 mb-1">{f.label}</label>
            {f.type === "textarea" ? (
              <Textarea
                value={form[f.key] || ""}
                onChange={(e) => handleFieldChange(f.key, e.target.value)}
                className="w-full"
                rows={3}
              />
            ) : f.type === "file" ? (
              <Input type="file" onChange={handleAttachmentChange} multiple />
            ) : (
              <Input
                type={f.type}
                value={form[f.key] || ""}
                onChange={(e) => handleFieldChange(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
        <Button type="submit" className="w-full">
          {editingRequestIndex !== null ? "Update Request" : "Create Request"}
        </Button>
      </form>
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-2 text-blue-900">All Requests (in session only)</h3>
        {requests.length === 0 ? (
          <div className="text-gray-400 italic">No requests yet.</div>
        ) : (
          <ul className="space-y-3">
            {requests.map((req, idx) => (
              <li key={idx} className="p-2 border rounded text-sm flex gap-2">
                <div className="flex-1">
                  <div className="font-semibold">{getRequestSummary(req)}</div>
                  <div className="text-gray-500">
                    {Object.entries(req)
                      .filter(([k, v]) => typeof v === "string" && v && k !== "patientName" && k !== "patientNationalId")
                      .map(([k, v]) => (
                        <span key={k}>
                          {k.replace(/([A-Z])/g, " $1")}: {v};{" "}
                        </span>
                      ))}
                  </div>
                </div>
                <Button size="sm" type="button" variant="ghost" onClick={() => loadRequestForEdit(idx)}>
                  Act / Edit
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="text-xs text-gray-400 mt-2">Data is kept only until you refresh the page. Attachments are not stored.</div>
      </div>
    </div>
  );
};

export default CreateRequest;
