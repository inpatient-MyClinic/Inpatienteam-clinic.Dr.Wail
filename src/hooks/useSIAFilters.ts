import { useState, useMemo } from 'react';

export interface SIAFilters {
  month: Date | null;
  statuses: string[];
  hospitals: string[];
  specialties: string[];
  branches: string[];
}

export interface FilterOptions {
  statuses: string[];
  hospitals: string[];
  specialties: string[];
  branches: string[];
}

export function useSIAFilters() {
  const [filters, setFilters] = useState<SIAFilters>({
    month: null,
    statuses: [],
    hospitals: [],
    specialties: [],
    branches: []
  });

  const dateRange = useMemo(() => {
    if (filters.month) {
      const startDate = new Date(filters.month.getFullYear(), filters.month.getMonth(), 1);
      const endDate = new Date(filters.month.getFullYear(), filters.month.getMonth() + 1, 0);
      return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      };
    } else {
      // If no month selected, show data up to today
      return {
        start: '1900-01-01',
        end: new Date().toISOString().split('T')[0]
      };
    }
  }, [filters.month]);

  const buildWhereClause = useMemo(() => {
    const conditions: string[] = [
      `parse_excel_date("Date") >= '${dateRange.start}'::date`,
      `parse_excel_date("Date") <= '${dateRange.end}'::date`
    ];

    if (filters.statuses.length > 0) {
      const statusList = filters.statuses.map(s => `'${s.replace(/'/g, "''")}'`).join(',');
      conditions.push(`"Status" IN (${statusList})`);
    }

    if (filters.hospitals.length > 0) {
      const hospitalList = filters.hospitals.map(h => `'${h.replace(/'/g, "''")}'`).join(',');
      conditions.push(`"Hospital Name" IN (${hospitalList})`);
    }

    if (filters.specialties.length > 0) {
      const specialtyList = filters.specialties.map(s => `'${s.replace(/'/g, "''")}'`).join(',');
      conditions.push(`"Specialty" IN (${specialtyList})`);
    }

    if (filters.branches.length > 0) {
      const branchList = filters.branches.map(b => `'${b.replace(/'/g, "''")}'`).join(',');
      conditions.push(`"Branch" IN (${branchList})`);
    }

    return conditions.join(' AND ');
  }, [filters, dateRange]);

  const updateFilter = (key: keyof SIAFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      month: null,
      statuses: [],
      hospitals: [],
      specialties: [],
      branches: []
    });
  };

  return {
    filters,
    dateRange,
    buildWhereClause,
    updateFilter,
    clearFilters
  };
}