import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SIAFiltersBarProps {
  filters: any;
  onUpdateFilter: (key: string, value: any) => void;
  onClearFilters: () => void;
}

export default function SIAFiltersBar({ filters, onUpdateFilter, onClearFilters }: SIAFiltersBarProps) {
  const hasActiveFilters = filters.month || 
    filters.statuses.length > 0 || 
    filters.hospitals.length > 0 || 
    filters.specialties.length > 0 || 
    filters.branches.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium">Filters:</span>
      
      {filters.month && (
        <Badge variant="secondary" className="gap-1">
          Month: {filters.month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          <X className="h-3 w-3 cursor-pointer" onClick={() => onUpdateFilter('month', null)} />
        </Badge>
      )}
      
      {filters.statuses.map((status: string) => (
        <Badge key={status} variant="secondary" className="gap-1">
          {status}
          <X className="h-3 w-3 cursor-pointer" onClick={() => 
            onUpdateFilter('statuses', filters.statuses.filter((s: string) => s !== status))
          } />
        </Badge>
      ))}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear All
        </Button>
      )}
    </div>
  );
}