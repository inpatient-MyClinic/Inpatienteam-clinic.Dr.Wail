// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, X } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface ServerSIAFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

interface FilterState {
  startDate: string;
  endDate: string;
  statuses: string[];
  hospitals: string[];
  specialties: string[];
  branches: string[];
}

interface FilterOptions {
  statuses: string[];
  hospitals: string[];
  specialties: string[];
  branches: string[];
}

export default function ServerSIAFilters({ onFiltersChange }: ServerSIAFiltersProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    startDate: '1900-01-01',
    endDate: new Date().toISOString().split('T')[0],
    statuses: [],
    hospitals: [],
    specialties: [],
    branches: []
  });
  const [availableOptions, setAvailableOptions] = useState<FilterOptions>({
    statuses: [],
    hospitals: [],
    specialties: [],
    branches: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load available filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        // Since analytics tables are reset, use unified_requests for basic filters
        const { data: statusData } = await supabase
          .from('unified_requests')
          .select('status')
          .not('status', 'is', null);

        const { data: branchData } = await supabase
          .from('unified_requests')
          .select('branch_code')
          .not('branch_code', 'is', null);

        const { data: hospitalData } = await supabase
          .from('unified_requests')
          .select('hospital_name')
          .not('hospital_name', 'is', null);

        const { data: specialtyData } = await supabase
          .from('unified_requests')
          .select('specialty')
          .not('specialty', 'is', null);

        setAvailableOptions({
          statuses: [...new Set(statusData?.map(d => d.status).filter(Boolean))] as string[],
          hospitals: [...new Set(hospitalData?.map(d => d.hospital_name).filter(Boolean))] as string[],
          specialties: [...new Set(specialtyData?.map(d => d.specialty).filter(Boolean))] as string[],
          branches: [...new Set(branchData?.map(d => d.branch_code).filter(Boolean))] as string[]
        });
      } catch (error) {
        console.error('Error loading filter options:', error);
        // Set default options if tables don't exist
        setAvailableOptions({
          statuses: ['pending', 'completed', 'cancelled', 'rejected'],
          hospitals: [],
          specialties: [],
          branches: ['MCJ1', 'MCJ2']
        });
      }
    };

    loadFilterOptions();
  }, []);

  // Update filters when month changes  
  useEffect(() => {
    let startDate: string;
    let endDate: string;

    if (selectedMonth) {
      startDate = format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1), 'yyyy-MM-dd');
      endDate = format(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0), 'yyyy-MM-dd');
    } else {
      startDate = '1900-01-01';
      endDate = new Date().toISOString().split('T')[0];
    }

    const newFilters = { ...filters, startDate, endDate };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [selectedMonth]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    if (key === 'startDate' || key === 'endDate') {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    } else {
      // For array filters, normalize values
      let normalizedValue = value;
      if (key === 'branches' && Array.isArray(value)) {
        normalizedValue = value.map((b: string) => b.trim().toUpperCase());
      }
      
      const newFilters = { ...filters, [key]: normalizedValue };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    }
  };

  const clearFilters = () => {
    setSelectedMonth(null);
    const clearedFilters: FilterState = {
      startDate: '1900-01-01',
      endDate: new Date().toISOString().split('T')[0],
      statuses: [],
      hospitals: [],
      specialties: [],
      branches: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = selectedMonth || 
    filters.statuses.length > 0 || 
    filters.hospitals.length > 0 || 
    filters.specialties.length > 0 || 
    filters.branches.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Month:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {selectedMonth ? format(selectedMonth, 'MMM yyyy') : 'All Time'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedMonth || undefined}
                  onSelect={(date) => setSelectedMonth(date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {selectedMonth && (
              <Badge variant="secondary" className="gap-1">
                {format(selectedMonth, 'MMM yyyy')}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedMonth(null)} />
              </Badge>
            )}
            {filters.statuses.map((status) => (
              <Badge key={status} variant="secondary" className="gap-1">
                Status: {status}
                <X className="h-3 w-3 cursor-pointer" onClick={() => 
                  updateFilter('statuses', filters.statuses.filter(s => s !== status))
                } />
              </Badge>
            ))}
            {filters.hospitals.map((hospital) => (
              <Badge key={hospital} variant="secondary" className="gap-1">
                Hospital: {hospital}
                <X className="h-3 w-3 cursor-pointer" onClick={() => 
                  updateFilter('hospitals', filters.hospitals.filter(h => h !== hospital))
                } />
              </Badge>
            ))}
            {filters.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="gap-1">
                Specialty: {specialty}
                <X className="h-3 w-3 cursor-pointer" onClick={() => 
                  updateFilter('specialties', filters.specialties.filter(s => s !== specialty))
                } />
              </Badge>
            ))}
            {filters.branches.map((branch) => (
              <Badge key={branch} variant="secondary" className="gap-1">
                Branch: {branch}
                <X className="h-3 w-3 cursor-pointer" onClick={() => 
                  updateFilter('branches', filters.branches.filter(b => b !== branch))
                } />
              </Badge>
            ))}
          </div>
        )}

        {/* Detailed Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableOptions.statuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.statuses.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('statuses', [...filters.statuses, status]);
                        } else {
                          updateFilter('statuses', filters.statuses.filter(s => s !== status));
                        }
                      }}
                    />
                    <label htmlFor={`status-${status}`} className="text-sm">{status}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Hospital Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hospital</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableOptions.hospitals.map((hospital) => (
                  <div key={hospital} className="flex items-center space-x-2">
                    <Checkbox
                      id={`hospital-${hospital}`}
                      checked={filters.hospitals.includes(hospital)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('hospitals', [...filters.hospitals, hospital]);
                        } else {
                          updateFilter('hospitals', filters.hospitals.filter(h => h !== hospital));
                        }
                      }}
                    />
                    <label htmlFor={`hospital-${hospital}`} className="text-sm truncate">{hospital}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialty Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialty</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableOptions.specialties.map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`specialty-${specialty}`}
                      checked={filters.specialties.includes(specialty)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('specialties', [...filters.specialties, specialty]);
                        } else {
                          updateFilter('specialties', filters.specialties.filter(s => s !== specialty));
                        }
                      }}
                    />
                    <label htmlFor={`specialty-${specialty}`} className="text-sm truncate">{specialty}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Branch Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableOptions.branches.map((branch) => (
                  <div key={branch} className="flex items-center space-x-2">
                    <Checkbox
                      id={`branch-${branch}`}
                      checked={filters.branches.includes(branch)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('branches', [...filters.branches, branch]);
                        } else {
                          updateFilter('branches', filters.branches.filter(b => b !== branch));
                        }
                      }}
                    />
                    <label htmlFor={`branch-${branch}`} className="text-sm">{branch}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}