import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";
import { ChevronDown, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Column {
  key: string;
  label: string;
  filterable?: boolean;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableWithPaginationProps {
  data: any[];
  columns: Column[];
  title?: string;
  className?: string;
  initialRowsPerPage?: number;
}

export default function TableWithPagination({
  data,
  columns,
  title,
  className = "",
  initialRowsPerPage = 10
}: TableWithPaginationProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = String(item[key] || '').toLowerCase();
        return itemValue.includes(value.toLowerCase());
      });
    });

    if (sort) {
      filtered.sort((a, b) => {
        const aValue = String(a[sort.key] || '').toLowerCase();
        const bValue = String(b[sort.key] || '').toLowerCase();
        
        if (sort.direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    return filtered;
  }, [data, filters, sort]);

  const {
    currentPage,
    rowsPerPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    setCurrentPage,
    handleRowsPerPageChange
  } = usePagination({
    data: filteredAndSortedData,
    initialRowsPerPage
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSort(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const getUniqueValues = (key: string): string[] => {
    const values = data.map(item => String(item[key] || '')).filter(Boolean);
    return [...new Set(values)].sort();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">
            {filteredAndSortedData.length} of {data.length} entries
          </span>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="relative">
                  <div className="flex items-center gap-2">
                    <span 
                      className={column.sortable ? "cursor-pointer hover:text-foreground" : ""}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      {column.label}
                    </span>
                    
                    {column.sortable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => handleSort(column.key)}
                      >
                        <ChevronDown 
                          className={`h-3 w-3 transition-transform ${
                            sort?.key === column.key 
                              ? sort.direction === 'asc' ? 'rotate-180' : 'rotate-0'
                              : 'opacity-50'
                          }`} 
                        />
                      </Button>
                    )}

                    {column.filterable && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                          >
                            <Filter className={`h-3 w-3 ${filters[column.key] ? 'text-primary' : 'opacity-50'}`} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56" align="start">
                          <div className="space-y-2">
                            <Input
                              placeholder={`Filter ${column.label}...`}
                              value={filters[column.key] || ''}
                              onChange={(e) => handleFilterChange(column.key, e.target.value)}
                            />
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs h-6"
                                onClick={() => handleFilterChange(column.key, '')}
                              >
                                All {column.label}
                              </Button>
                              {getUniqueValues(column.key).slice(0, 10).map((value) => (
                                <Button
                                  key={value}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-xs h-6"
                                  onClick={() => handleFilterChange(column.key, value)}
                                >
                                  {value}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        totalItems={filteredAndSortedData.length}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
}