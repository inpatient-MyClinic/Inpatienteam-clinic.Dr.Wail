import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";

interface SearchableComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  allowCustom?: boolean;
}

const SearchableCombobox = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  emptyMessage = "No results found",
  allowCustom = false,
}: SearchableComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // If custom not allowed and typed value doesn't match, revert
        if (!allowCustom && search && !options.includes(search)) {
          setSearch(value || "");
        }
        // If allowCustom and there's text, commit it
        if (allowCustom && search && search !== value) {
          onChange(search);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search, value, options, allowCustom, onChange]);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (selected: string) => {
    setSearch(selected);
    onChange(selected);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            if (!e.target.value) {
              onChange("");
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pr-8"
        />
        <ChevronsUpDown
          className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
          onClick={() => {
            setOpen(!open);
            inputRef.current?.focus();
          }}
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-white dark:bg-gray-800 shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <div
                key={opt}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-accent",
                  opt === value && "bg-accent"
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
              >
                <Check
                  className={cn("h-4 w-4", opt === value ? "opacity-100" : "opacity-0")}
                />
                {opt}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableCombobox;
