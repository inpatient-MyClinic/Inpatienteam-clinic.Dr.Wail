import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ClearAllDataButton() {
  const { toast } = useToast();

  const clearAllData = () => {
    // Clear ALL localStorage data
    localStorage.clear();
    
    // Trigger events to notify all components
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('requestsUpdated'));
    window.dispatchEvent(new CustomEvent('adminDataCleared'));
    
    toast({
      title: "All Data Cleared",
      description: "All requests and stored data have been completely removed."
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
          <Trash2 className="w-4 h-4" />
          Clear All Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all requests, user data, and settings. This action cannot be undone.
            You can then re-upload your Excel file to have only your 211 requests.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={clearAllData} className="bg-red-600 hover:bg-red-700">
            Clear All Data
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}