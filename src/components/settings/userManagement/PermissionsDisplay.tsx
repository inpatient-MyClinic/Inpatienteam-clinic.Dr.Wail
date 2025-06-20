
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { systemFields } from "./types";

interface PermissionsDisplayProps {
  permissions: Record<string, "none" | "view" | "edit">;
  userEmail: string;
}

const PermissionsDisplay = ({ permissions, userEmail }: PermissionsDisplayProps) => {
  const getPermissionColor = (permission: "none" | "view" | "edit") => {
    switch (permission) {
      case "edit": return "bg-green-100 text-green-800";
      case "view": return "bg-blue-100 text-blue-800";
      case "none": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const permissionEntries = Object.entries(permissions);

  return (
    <div className="flex flex-wrap gap-1">
      {permissionEntries.slice(0, 3).map(([fieldId, permission]) => {
        const field = systemFields.find(f => f.id === fieldId);
        return field ? (
          <Badge key={fieldId} className={`text-xs ${getPermissionColor(permission)}`}>
            {field.name}: {permission}
          </Badge>
        ) : null;
      })}
      {permissionEntries.length > 3 && (
        <Dialog>
          <DialogTrigger asChild>
            <Badge variant="secondary" className="text-xs cursor-pointer">
              +{permissionEntries.length - 3} more
            </Badge>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Field Permissions for {userEmail}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {permissionEntries.map(([fieldId, permission]) => {
                const field = systemFields.find(f => f.id === fieldId);
                return field ? (
                  <div key={fieldId} className="flex justify-between items-center">
                    <span className="text-sm">{field.name}</span>
                    <Badge className={getPermissionColor(permission)}>
                      {permission}
                    </Badge>
                  </div>
                ) : null;
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PermissionsDisplay;
