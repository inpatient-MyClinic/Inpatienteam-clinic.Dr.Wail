
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { systemFields } from "./types";

interface PermissionsEditorProps {
  permissions: Record<string, "none" | "view" | "edit">;
  onUpdatePermission: (fieldId: string, permission: "none" | "view" | "edit") => void;
}

const PermissionsEditor = ({ permissions, onUpdatePermission }: PermissionsEditorProps) => {
  return (
    <div className="space-y-3 max-w-md">
      {systemFields.map(field => (
        <div key={field.id} className="flex items-center justify-between">
          <Label className="text-sm">{field.name}</Label>
          <Select 
            value={permissions[field.id] || "none"} 
            onValueChange={(value: "none" | "view" | "edit") => 
              onUpdatePermission(field.id, value)
            }
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="edit">Edit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
};

export default PermissionsEditor;
