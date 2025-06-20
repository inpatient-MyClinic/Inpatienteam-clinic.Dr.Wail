
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { X, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";

interface MessageFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
  selectedMonths: string[];
  setSelectedMonths: (months: string[]) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

const MessageFilters = ({
  showFilters,
  setShowFilters,
  selectedDates,
  setSelectedDates,
  selectedMonths,
  setSelectedMonths,
  hasActiveFilters,
  clearFilters,
}: MessageFiltersProps) => {
  // Generate months for selection
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return {
      value: format(date, 'MMMM'),
      label: format(date, 'MMMM yyyy')
    };
  });

  const handleMonthSelect = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm" 
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-1">
            {selectedDates.length + selectedMonths.length}
          </Badge>
        )}
      </Button>

      {showFilters && (
        <div className="border rounded-lg p-4 mb-4 space-y-4 bg-gray-50 flex-shrink-0">
          <div className="flex flex-wrap gap-4">
            {/* Date Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Select Days
                  {selectedDates.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedDates.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Month Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Select Months
                  {selectedMonths.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedMonths.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="start">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Months</Label>
                  <div className="grid gap-1 max-h-60 overflow-y-auto">
                    {months.map((month) => {
                      const isSelected = selectedMonths.includes(month.value);
                      return (
                        <Button
                          key={month.value}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleMonthSelect(month.value)}
                          className="justify-start"
                        >
                          {month.label}
                          {isSelected && <span className="ml-2">✓</span>}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedDates.map((date, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {format(date, "MMM dd")}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSelectedDates(selectedDates.filter((_, i) => i !== index))}
                  />
                </Badge>
              ))}
              {selectedMonths.map((month) => (
                <Badge key={month} variant="outline" className="flex items-center gap-1">
                  {month}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSelectedMonths(selectedMonths.filter(m => m !== month))}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MessageFilters;
