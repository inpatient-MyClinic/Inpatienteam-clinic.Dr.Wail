
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getWeeksInMonth, addDays } from "date-fns";

interface NurseDateFiltersProps {
  onDateFilterChange: (filters: {
    selectedDays: Date[];
    selectedWeeks: { month: Date; weekNumbers: number[] }[];
    selectedMonths: Date[];
  }) => void;
}

export default function NurseDateFilters({ onDateFilterChange }: NurseDateFiltersProps) {
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<{ month: Date; weekNumbers: number[] }[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<Date[]>([]);
  const [weekFilterMonth, setWeekFilterMonth] = useState<Date>(new Date());

  // Generate months for dropdown
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(i);
    return date;
  });

  // Generate weeks for selected month
  const getWeeksForMonth = (month: Date) => {
    const weeksInMonth = getWeeksInMonth(month);
    const weeks = [];
    
    for (let weekNum = 1; weekNum <= weeksInMonth; weekNum++) {
      const firstDayOfMonth = startOfMonth(month);
      const weekStart = addDays(firstDayOfMonth, (weekNum - 1) * 7);
      const weekEnd = addDays(weekStart, 6);
      
      weeks.push({
        number: weekNum,
        range: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`
      });
    }
    
    return weeks;
  };

  const handleDaySelect = (days: Date[] | undefined) => {
    const newSelectedDays = days || [];
    setSelectedDays(newSelectedDays);
    updateFilters(newSelectedDays, selectedWeeks, selectedMonths);
  };

  const handleWeekSelect = (weekNumber: number) => {
    const monthKey = weekFilterMonth.getTime();
    const existingMonthIndex = selectedWeeks.findIndex(w => w.month.getTime() === monthKey);
    
    let newSelectedWeeks = [...selectedWeeks];
    
    if (existingMonthIndex >= 0) {
      const existingWeeks = newSelectedWeeks[existingMonthIndex].weekNumbers;
      if (existingWeeks.includes(weekNumber)) {
        // Remove week
        newSelectedWeeks[existingMonthIndex].weekNumbers = existingWeeks.filter(w => w !== weekNumber);
        if (newSelectedWeeks[existingMonthIndex].weekNumbers.length === 0) {
          newSelectedWeeks = newSelectedWeeks.filter((_, i) => i !== existingMonthIndex);
        }
      } else {
        // Add week
        newSelectedWeeks[existingMonthIndex].weekNumbers.push(weekNumber);
      }
    } else {
      // Add new month with week
      newSelectedWeeks.push({
        month: new Date(weekFilterMonth),
        weekNumbers: [weekNumber]
      });
    }
    
    setSelectedWeeks(newSelectedWeeks);
    updateFilters(selectedDays, newSelectedWeeks, selectedMonths);
  };

  const handleMonthSelect = (monthIndex: string) => {
    const month = new Date();
    month.setMonth(parseInt(monthIndex));
    month.setDate(1);
    
    const isSelected = selectedMonths.some(m => m.getMonth() === month.getMonth());
    let newSelectedMonths;
    
    if (isSelected) {
      newSelectedMonths = selectedMonths.filter(m => m.getMonth() !== month.getMonth());
    } else {
      newSelectedMonths = [...selectedMonths, month];
    }
    
    setSelectedMonths(newSelectedMonths);
    updateFilters(selectedDays, selectedWeeks, newSelectedMonths);
  };

  const updateFilters = (days: Date[], weeks: { month: Date; weekNumbers: number[] }[], months: Date[]) => {
    onDateFilterChange({
      selectedDays: days,
      selectedWeeks: weeks,
      selectedMonths: months
    });
  };

  const clearAllFilters = () => {
    setSelectedDays([]);
    setSelectedWeeks([]);
    setSelectedMonths([]);
    updateFilters([], [], []);
  };

  const hasActiveFilters = selectedDays.length > 0 || selectedWeeks.length > 0 || selectedMonths.length > 0;

  const isWeekSelected = (weekNumber: number) => {
    const monthKey = weekFilterMonth.getTime();
    const monthWeeks = selectedWeeks.find(w => w.month.getTime() === monthKey);
    return monthWeeks?.weekNumbers.includes(weekNumber) || false;
  };

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      {/* Days Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Filter by Days
            {selectedDays.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedDays.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="multiple"
            selected={selectedDays}
            onSelect={handleDaySelect}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Weeks Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Filter by Weeks
            {selectedWeeks.reduce((total, month) => total + month.weekNumbers.length, 0) > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedWeeks.reduce((total, month) => total + month.weekNumbers.length, 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Month</label>
              <Select 
                value={weekFilterMonth.getMonth().toString()} 
                onValueChange={(value) => setWeekFilterMonth(new Date(2024, parseInt(value), 1))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {format(month, 'MMMM yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Select Weeks</label>
              <div className="grid grid-cols-1 gap-2">
                {getWeeksForMonth(weekFilterMonth).map((week) => (
                  <Button
                    key={week.number}
                    variant={isWeekSelected(week.number) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleWeekSelect(week.number)}
                    className="justify-start"
                  >
                    Week {week.number}: {week.range}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Months Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Filter by Months
            {selectedMonths.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedMonths.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Months</label>
            <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
              {months.map((month, index) => {
                const isSelected = selectedMonths.some(m => m.getMonth() === month.getMonth());
                return (
                  <Button
                    key={index}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMonthSelect(index.toString())}
                    className="justify-start"
                  >
                    {format(month, 'MMMM yyyy')}
                  </Button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Clear Date Filters
        </Button>
      )}

      {/* Selected Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1 ml-2">
          {selectedDays.map((day, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {format(day, 'MMM d')}
            </Badge>
          ))}
          {selectedWeeks.map((monthWeeks, index) => 
            monthWeeks.weekNumbers.map((week) => (
              <Badge key={`${index}-${week}`} variant="outline" className="text-xs">
                {format(monthWeeks.month, 'MMM')} W{week}
              </Badge>
            ))
          )}
          {selectedMonths.map((month, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {format(month, 'MMM yyyy')}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
