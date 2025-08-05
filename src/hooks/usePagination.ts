import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
  data: T[];
  initialRowsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  rowsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  paginatedData: T[];
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  handleRowsPerPageChange: (rows: number) => void;
}

export function usePagination<T>({ 
  data, 
  initialRowsPerPage = 10 
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      paginatedData
    };
  }, [data, currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  return {
    currentPage,
    rowsPerPage,
    totalPages: paginationData.totalPages,
    startIndex: paginationData.startIndex,
    endIndex: paginationData.endIndex,
    paginatedData: paginationData.paginatedData,
    setCurrentPage,
    setRowsPerPage,
    handleRowsPerPageChange
  };
}