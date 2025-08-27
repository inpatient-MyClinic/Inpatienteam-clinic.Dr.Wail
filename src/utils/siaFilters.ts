/**
 * Helper function to build WHERE clause for SIA filtering
 */
export function buildFilterWhereClause(filters: any, year: number, month: number): string {
  const conditions: string[] = [];
  
  // Add date range for the specific month
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
  
  conditions.push(`case_date >= '${startDate}'`);
  conditions.push(`case_date <= '${endDate}'`);
  
  // Add additional filters if they exist
  if (filters?.statuses?.length > 0) {
    const statusList = filters.statuses.map((s: string) => `'${s.replace(/'/g, "''")}'`).join(',');
    conditions.push(`status IN (${statusList})`);
  }
  
  if (filters?.hospitals?.length > 0) {
    const hospitalList = filters.hospitals.map((h: string) => `'${h.replace(/'/g, "''")}'`).join(',');
    conditions.push(`hospital IN (${hospitalList})`);
  }
  
  if (filters?.specialties?.length > 0) {
    const specialtyList = filters.specialties.map((s: string) => `'${s.replace(/'/g, "''")}'`).join(',');
    conditions.push(`specialty IN (${specialtyList})`);
  }
  
  if (filters?.branches?.length > 0) {
    const branchList = filters.branches.map((b: string) => `'${b.replace(/'/g, "''")}'`).join(',');
    conditions.push(`branch IN (${branchList})`);
  }
  
  return conditions.join(' AND ');
}