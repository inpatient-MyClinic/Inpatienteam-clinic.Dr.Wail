
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { RequestFormData } from "@/types/request";

interface NotesSectionProps {
  form: Partial<RequestFormData>;
  onFieldChange: (key: string, value: string) => void;
}

const NotesSection = ({ form, onFieldChange }: NotesSectionProps) => {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Additional Information</h3>
      
      <div>
        <label className="block font-medium text-gray-600 mb-1">History</label>
        <Textarea
          value={form.history || ""}
          onChange={(e) => onFieldChange("history", e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="block font-medium text-gray-600 mb-1">Notes (optional)</label>
        <Textarea
          value={form.notes || ""}
          onChange={(e) => onFieldChange("notes", e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
};

export default NotesSection;
