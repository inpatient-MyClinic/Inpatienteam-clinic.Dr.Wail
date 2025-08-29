/**
 * Helper function to build WHERE clause for SIA filtering
 */
export function buildFilterWhereClause(filters: any, year: number, month: number): string {
  const conditions: string[] = [];
  
  // Add date range for the specific month using proper Excel column
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
  
  conditions.push(`parse_excel_date(raw_data->>'Date of Request:') >= '${startDate}'::date`);
  conditions.push(`parse_excel_date(raw_data->>'Date of Request:') <= '${endDate}'::date`);
  
  // Add additional filters using raw_data fields
  if (filters?.statuses?.length > 0) {
    const statusList = filters.statuses.map((s: string) => `'${s.replace(/'/g, "''")}'`).join(',');
    conditions.push(`raw_data->>'Status of operation' IN (${statusList})`);
  }
  
  if (filters?.hospitals?.length > 0) {
    const hospitalList = filters.hospitals.map((h: string) => `'${h.replace(/'/g, "''")}'`).join(',');
    conditions.push(`raw_data->>'Referred Hospital' IN (${hospitalList})`);
  }
  
  if (filters?.specialties?.length > 0) {
    const specialtyList = filters.specialties.map((s: string) => `'${s.replace(/'/g, "''")}'`).join(',');
    conditions.push(`raw_data->>'Specialty' IN (${specialtyList})`);
  }
  
  if (filters?.branches?.length > 0) {
    const branchList = filters.branches.map((b: string) => `'${b.replace(/'/g, "''")}'`).join(',');
    conditions.push(`raw_data->>'My Clinic Branch' IN (${branchList})`);
  }
  
  return conditions.join(' AND ');
}