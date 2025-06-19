
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Printer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

interface HospitalFiltersProps {
  selectedDates: Date[];
  setSelectedDates: (dates: Date[]) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedMonths: string[];
  setSelectedMonths: (months: string[]) => void;
  onExportToExcel: () => void;
  onPrint: () => void;
}

export default function HospitalFilters({
  selectedDates,
  setSelectedDates,
  selectedMonth,
  setSelectedMonth,
  selectedMonths,
  setSelectedMonths,
  onExportToExcel,
  onPrint
}: HospitalFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Calendar Filter */}
          <div>
            <Label>Filter by Day</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDates.length > 0 ? `${selectedDates.length} days selected` : "Select Days"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <CalendarComponent
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Week Filter */}
          <div>
            <Label>Filter by Week</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select month for weeks" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="01">January 2024</SelectItem>
                <SelectItem value="02">February 2024</SelectItem>
                <SelectItem value="03">March 2024</SelectItem>
                <SelectItem value="04">April 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Month Filter with Export/Print buttons */}
          <div>
            <Label>Filter by Month</Label>
            <div className="flex gap-2">
              <Select value={selectedMonths.join(',')} onValueChange={(value) => setSelectedMonths(value ? value.split(',') : [])}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select months" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="01">January</SelectItem>
                  <SelectItem value="02">February</SelectItem>
                  <SelectItem value="03">March</SelectItem>
                  <SelectItem value="04">April</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={onExportToExcel}>
                <Download className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onPrint}>
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
