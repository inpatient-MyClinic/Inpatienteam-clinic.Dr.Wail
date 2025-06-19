
import React from "react";
import { Button } from "@/components/ui/button";

const filters = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year to Date", value: "ytd" },
];

interface NurseFiltersProps {
  filter: string | null;
  setFilter: (filter: string | null) => void;
}

export default function NurseFilters({ filter, setFilter }: NurseFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6 justify-end">
      {filters.map((f) => (
        <Button
          key={f.value}
          variant={filter === f.value ? "default" : "outline"}
          onClick={() => setFilter(filter === f.value ? null : f.value)}
          size="sm"
        >
          {f.label}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilter(null)}
        className="ml-2"
        disabled={!filter}
      >
        Clear Filter
      </Button>
    </div>
  );
}
