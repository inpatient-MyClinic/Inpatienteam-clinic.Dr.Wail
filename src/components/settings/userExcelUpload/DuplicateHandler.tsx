
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Check, X } from "lucide-react";

interface DuplicateHandlerProps {
  isOpen: boolean;
  duplicates: any[];
  onResolve: (action: 'replace' | 'skip', selectedDuplicates: any[]) => void;
  onClose: () => void;
}

export default function DuplicateHandler({ isOpen, duplicates, onResolve, onClose }: DuplicateHandlerProps) {
  const [selectedDuplicates, setSelectedDuplicates] = useState<any[]>(duplicates);

  const toggleSelection = (duplicate: any) => {
    setSelectedDuplicates(prev => {
      const isSelected = prev.some(item => item.Email === duplicate.Email);
      if (isSelected) {
        return prev.filter(item => item.Email !== duplicate.Email);
      } else {
        return [...prev, duplicate];
      }
    });
  };

  const selectAll = () => {
    setSelectedDuplicates(duplicates);
  };

  const selectNone = () => {
    setSelectedDuplicates([]);
  };

  const handleReplace = () => {
    onResolve('replace', selectedDuplicates);
  };

  const handleSkip = () => {
    onResolve('skip', selectedDuplicates);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Duplicate Users Detected
          </DialogTitle>
          <DialogDescription>
            {duplicates.length} duplicate users found. Choose how to handle them.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh] pr-4">
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Select None
              </Button>
            </div>

            {duplicates.map((duplicate, index) => {
              const isSelected = selectedDuplicates.some(item => item.Email === duplicate.Email);
              return (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleSelection(duplicate)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium">{duplicate["Doctor Name"] || duplicate.Email}</div>
                        <div className="text-sm text-gray-600">{duplicate.Email}</div>
                        {duplicate.Specialty && (
                          <Badge variant="outline" className="mt-1">
                            {duplicate.Specialty}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedDuplicates.length} of {duplicates.length} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleSkip}
              disabled={selectedDuplicates.length === 0}
            >
              Skip Selected ({selectedDuplicates.length})
            </Button>
            <Button 
              onClick={handleReplace}
              disabled={selectedDuplicates.length === 0}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Replace Selected ({selectedDuplicates.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
