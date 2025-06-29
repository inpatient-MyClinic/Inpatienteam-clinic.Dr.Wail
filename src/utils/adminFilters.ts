
export function filterAdminData(
  adminData: any[], 
  activeFilter: string | null, 
  selectedDates: Date[], 
  selectedWeeks: string[], 
  selectedMonths: string[]
) {
  return adminData.filter(item => {
    const matchesStatus = !activeFilter || item.status === activeFilter || item.priority === activeFilter;
    
    const matchesDate = selectedDates.length === 0 || 
      selectedDates.some(date => 
        new Date(item.date).toDateString() === date.toDateString()
      );
    
    const matchesWeek = selectedWeeks.length === 0;
    const matchesMonth = selectedMonths.length === 0 || 
      selectedMonths.some(month => {
        const itemMonth = new Date(item.date).toLocaleString('default', { month: 'long' });
        return itemMonth === month;
      });
    
    return matchesStatus && matchesDate && matchesWeek && matchesMonth;
  });
}
