
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Trash2 } from "lucide-react";

interface UserTableActionsProps {
  userId: string;
  isEditing: boolean;
  onEdit: (userId: string) => void;
  onSave: (userId: string) => void;
  onCancel: () => void;
  onDelete: (userId: string) => void;
}

const UserTableActions = ({
  userId,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete
}: UserTableActionsProps) => {
  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(userId)}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => onEdit(userId)}>
        <Settings className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="destructive" onClick={() => onDelete(userId)}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default UserTableActions;
