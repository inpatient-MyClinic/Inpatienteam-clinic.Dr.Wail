
import React from "react";
import { Button } from "@/components/ui/button";

interface DialogActionsProps {
  onSubmit: () => void;
}

export default function DialogActions({ onSubmit }: DialogActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4 border-t">
      <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
        Save Changes
      </Button>
    </div>
  );
}
