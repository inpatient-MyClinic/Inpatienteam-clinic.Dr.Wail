
import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface FilterableTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    filterable?: boolean;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  title?: string;
}

export default function FilterableTable({ data, columns, title }: FilterableTableProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Get unique values for each filterable column
  const getUniqueValues = (key: string) => {
    const values = [...new Set(data.map(item => item[key]).filter(Boolean))];
    return values.sort();
  };

  // Apply filters and sorting
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || value === 'all') return true;
        return String(item[key]).toLowerCase().includes(value.toLowerCase());
      });
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, filters, sortConfig]);

  // Apply pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        {columns.filter(col => col.filterable).map(column => {
          const uniqueValues = getUniqueValues(column.key);
          
          return (
            <div key={column.key} className="flex-1 min-w-48">
              <label className="block text-sm font-medium mb-2">
                Filter by {column.label}
              </label>
              {uniqueValues.length > 10 ? (
                <Input
                  placeholder={`Filter ${column.label}...`}
                  value={filters[column.key] || ''}
                  onChange={(e) => handleFilterChange(column.key, e.target.value)}
                />
              ) : (
                <Select 
                  value={filters[column.key] || 'all'} 
                  onValueChange={(value) => handleFilterChange(column.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`All ${column.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {column.label}</SelectItem>
                    {uniqueValues.map(value => (
                      <SelectItem key={value} value={String(value)}>
                        {String(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <Select value={String(rowsPerPage)} onValueChange={(value) => {
            setRowsPerPage(Number(value));
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead 
                key={column.key}
                className={column.sortable ? "cursor-pointer hover:bg-gray-100" : ""}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortConfig?.key === column.key && (
                    <span className="text-xs">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, index) => (
            <TableRow key={index}>
              {columns.map(column => (
                <TableCell key={column.key}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
