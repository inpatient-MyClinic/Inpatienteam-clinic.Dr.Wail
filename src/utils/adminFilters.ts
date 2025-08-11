
export function filterAdminData(
  adminData: any[],
  activeFilter: string | null,
  selectedDates: Date[],
  selectedWeeks: string[],
  selectedMonths: string[]
) {
  // Helper: convert various date representations (including Excel serials) to a valid Date
  const toDate = (value: any): Date | null => {
    if (value === undefined || value === null || value === '') return null;
    let d: Date | null = null;
    if (typeof value === 'number') {
      // Excel serial date (rough check)
      d = value > 25000 ? new Date((value - 25569) * 86400 * 1000) : new Date(value);
    } else if (typeof value === 'string') {
      const trimmed = value.trim();
      const n = Number(trimmed);
      if (!isNaN(n) && n > 25000) {
        d = new Date((n - 25569) * 86400 * 1000);
      } else if (trimmed.length === 10 && trimmed[4] === '-' && trimmed[7] === '-') {
        const [y, m, day] = trimmed.split('-').map(Number);
        d = new Date(y, (m || 1) - 1, day || 1); // Parse as local date to avoid TZ shifts
      } else if (/[\/.\-]/.test(trimmed)) {
        const parts = trimmed.split(/[\/.\-]/).map(p => p.trim());
        let y: number, m: number, day: number;
        const [a, b, c] = parts.map(p => Number(p));
        if (a > 31) {
          // Assume YYYY-MM-DD or YYYY/MM/DD
          y = a; m = b; day = c;
        } else if (a > 12) {
          // DD/MM/YYYY
          day = a; m = b; y = c;
        } else if (b > 12) {
          // MM/DD/YYYY
          m = a; day = b; y = c;
        } else {
          // Default to DD/MM/YYYY for ambiguous cases
          day = a; m = b; y = c;
        }
        d = new Date(y, (m || 1) - 1, day || 1);
      } else {
        d = new Date(trimmed);
      }
    } else if (value instanceof Date) {
      d = value;
    } else {
      try { d = new Date(value as any); } catch { d = null; }
    }
    return d && !isNaN(d.getTime()) ? d : null;
  };

  // Helper: extract the most likely date from an item
  const getItemDate = (item: any): Date | null => {
    const candidates = [
      item?.date,
      item?.requestDate,
      item?.created_at,
      item?.createdAt,
      item?.dateCreated,
      item?.completionDate,
      item?.['Date'],
      item?.['Request Date'],
      item?.['Created At']
    ];
    for (const c of candidates) {
      const d = toDate(c);
      if (d) return d;
    }
    return null;
  };

  // Helper: get week-of-month label like "Week 1".."Week 5"
  const getWeekOfMonthLabel = (d: Date): string => {
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const dayOfWeekOffset = firstDay.getDay(); // 0..6, Sunday=0
    const week = Math.ceil((d.getDate() + dayOfWeekOffset) / 7);
    return `Week ${Math.min(Math.max(week, 1), 5)}`; // clamp to 1..5
  };

  return adminData.filter(item => {
    const matchesStatus = !activeFilter || item.status === activeFilter || item.priority === activeFilter;

    const itemDate = getItemDate(item);

    // Date precedence: Month > Week > Specific Dates (locale-agnostic month match)
    let matchesDateFilter = true;
    if (selectedMonths.length > 0) {
      matchesDateFilter = (
        itemDate !== null && (() => {
          const monthIndex = itemDate.getMonth();
          const monthName = [
            'January','February','March','April','May','June','July','August','September','October','November','December'
          ][monthIndex].toLowerCase();
          return selectedMonths.some(m => (m || '').toLowerCase() === monthName);
        })()
      );
    } else if (selectedWeeks.length > 0) {
      matchesDateFilter = (
        itemDate !== null && selectedWeeks.includes(getWeekOfMonthLabel(itemDate))
      );
    } else if (selectedDates.length > 0) {
      matchesDateFilter = (
        itemDate !== null && selectedDates.some(date => itemDate.toDateString() === date.toDateString())
      );
    }

    return matchesStatus && matchesDateFilter;
  });
}

