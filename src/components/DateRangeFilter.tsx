
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  selectedDates: Date[];
  selectedWeeks: string[];
  selectedMonths: string[];
  onDateSelect: (dates: Date[]) => void;
  onWeekSelect: (weeks: string[]) => void;
  onMonthSelect: (months: string[]) => void;
  onClearAll: () => void;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weeks = [
  "Week 1", "Week 2", "Week 3", "Week 4", "Week 5"
];

export default function DateRangeFilter({
  selectedDates,
  selectedWeeks,
  selectedMonths,
  onDateSelect,
  onWeekSelect,
  onMonthSelect,
  onClearAll
}: DateRangeFilterProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      onDateSelect(dates);
    }
  };

  const handleWeekSelect = (week: string) => {
    if (selectedWeeks.includes(week)) {
      onWeekSelect(selectedWeeks.filter(w => w !== week));
    } else {
      onWeekSelect([...selectedWeeks, week]);
    }
  };

  const handleMonthSelect = (month: string) => {
    if (selectedMonths.includes(month)) {
      onMonthSelect(selectedMonths.filter(m => m !== month));
    } else {
      onMonthSelect([...selectedMonths, month]);
    }
  };

  const removeDateFilter = (date: Date) => {
    onDateSelect(selectedDates.filter(d => 
      d.toDateString() !== date.toDateString()
    ));
  };

  const removeWeekFilter = (week: string) => {
    onWeekSelect(selectedWeeks.filter(w => w !== week));
  };

  const removeMonthFilter = (month: string) => {
    onMonthSelect(selectedMonths.filter(m => m !== month));
  };

  const hasFilters = selectedDates.length > 0 || selectedWeeks.length > 0 || selectedMonths.length > 0;

  return (
    <div className="space-y-4">
      {/* Date Filter Controls */}
      <div className="flex flex-wrap gap-3">
        {/* Calendar Date Picker */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Select Dates
              {selectedDates.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedDates.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={handleDateSelect}
              className={cn("p-3")}
            />
          </PopoverContent>
        </Popover>

        {/* Week Selector */}
        <Select onValueChange={handleWeekSelect}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Weeks" />
            {selectedWeeks.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedWeeks.length}
              </Badge>
            )}
          </SelectTrigger>
          <SelectContent>
            {weeks.map((week) => (
              <SelectItem key={week} value={week}>
                <div className="flex items-center justify-between w-full">
                  {week}
                  {selectedWeeks.includes(week) && (
                    <span className="ml-2 text-blue-600">✓</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month Selector */}
        <Select onValueChange={handleMonthSelect}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Months" />
            {selectedMonths.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedMonths.length}
              </Badge>
            )}
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                <div className="flex items-center justify-between w-full">
                  {month}
                  {selectedMonths.includes(month) && (
                    <span className="ml-2 text-blue-600">✓</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear All Filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Selected Filters Display */}
      <div className="flex flex-wrap gap-2">
        {selectedDates.map((date, index) => (
          <Badge key={index} variant="outline" className="flex items-center gap-1">
            {format(date, "MMM dd")}
            <X 
              className="w-3 h-3 cursor-pointer" 
              onClick={() => removeDateFilter(date)}
            />
          </Badge>
        ))}
        
        {selectedWeeks.map((week) => (
          <Badge key={week} variant="outline" className="flex items-center gap-1">
            {week}
            <X 
              className="w-3 h-3 cursor-pointer" 
              onClick={() => removeWeekFilter(week)}
            />
          </Badge>
        ))}
        
        {selectedMonths.map((month) => (
          <Badge key={month} variant="outline" className="flex items-center gap-1">
            {month}
            <X 
              className="w-3 h-3 cursor-pointer" 
              onClick={() => removeMonthFilter(month)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}
