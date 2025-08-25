import { useState, useEffect } from 'react';

type Breakdown = Record<string, number>;

export interface LocalStorageMetrics {
  totalCases: number;
  byStatus: Breakdown;
  byBranch: Breakdown;
  byHospital: Breakdown;
  bySpecialty: Breakdown;
}

export function useLocalStorageAnalytics(year: number, month: number) {
  const [metrics, setMetrics] = useState<LocalStorageMetrics>({
    totalCases: 0,
    byStatus: {},
    byBranch: {},
    byHospital: {},
    bySpecialty: {}
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    try {
      // Get all localStorage data
      const allRequests = getAllLocalStorageRequests();
      
      console.log(`📊 LocalStorage Analytics: Found ${allRequests.length} total records`);
      
      // Filter by year and month
      const filteredRequests = allRequests.filter(record => {
        const date = parseDate(record.dateCreated || record.date || record['Date']);
        if (!date) return false;
        
        return date.getFullYear() === year && (date.getMonth() + 1) === month;
      });
      
      console.log(`📊 LocalStorage Analytics: Filtered to ${filteredRequests.length} records for ${year}-${month.toString().padStart(2, '0')}`);
      
      // Aggregate the data
      const byStatus: Breakdown = {};
      const byBranch: Breakdown = {};
      const byHospital: Breakdown = {};
      const bySpecialty: Breakdown = {};
      
      filteredRequests.forEach(record => {
        // Status
        const status = normalizeStatus(record.operationStatus || record.status || 'Pending');
        byStatus[status] = (byStatus[status] || 0) + 1;
        
        // Branch
        const branch = normalizeBranch(record.clinicBranch || record.referredFrom || record.branch || 'Unknown');
        byBranch[branch] = (byBranch[branch] || 0) + 1;
        
        // Hospital
        const hospital = record.hospitalName || 'Unknown Hospital';
        byHospital[hospital] = (byHospital[hospital] || 0) + 1;
        
        // Specialty
        const specialty = record.specialty || 'General';
        bySpecialty[specialty] = (bySpecialty[specialty] || 0) + 1;
      });
      
      setMetrics({
        totalCases: filteredRequests.length,
        byStatus,
        byBranch,
        byHospital,
        bySpecialty
      });
      
    } catch (error) {
      console.error('Error analyzing localStorage data:', error);
      setMetrics({
        totalCases: 0,
        byStatus: {},
        byBranch: {},
        byHospital: {},
        bySpecialty: {}
      });
    }
    
    setLoading(false);
  }, [year, month]);

  return { metrics, loading };
}

function getAllLocalStorageRequests(): any[] {
  const allRequests: any[] = [];
  
  const storageKeys = [
    'medical_requests',
    'excel_data_imported', 
    'admin_uploaded_requests',
    'uploaded_requests'
  ];

  storageKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          allRequests.push(...parsed);
        } else if (parsed && typeof parsed === 'object') {
          if (parsed.id || parsed.patientName) {
            allRequests.push(parsed);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not parse ${key}:`, error);
    }
  });

  return allRequests;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Handle Excel serial numbers
    if (typeof dateStr === 'number' || (/^\d+$/.test(dateStr) && Number(dateStr) > 25000)) {
      const serialNumber = Number(dateStr);
      return new Date((serialNumber - 25569) * 86400 * 1000);
    }
    
    // Try ISO format first
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return new Date(dateStr);
    }
    
    // Try MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split('/');
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    
    // Try DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('/');
      if (Number(day) > 12) { // Likely DD/MM/YYYY
        return new Date(Number(year), Number(month) - 1, Number(day));
      }
    }
    
    // Fallback to Date constructor
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function normalizeStatus(status: string): string {
  if (!status) return 'Pending';
  
  const normalized = status.toLowerCase().trim();
  
  const statusMap: Record<string, string> = {
    'completed': 'Completed',
    'done': 'Completed',
    'scheduled': 'Scheduled',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'canceled': 'Cancelled',
    'rejected': 'Policy Rejection',
    'insurance rejection': 'Insurance Rejection',
    'postponed': 'Postponed',
    'reschedule': 'Reschedule',
    'privilege': 'Privilege',
    'planned nvd': 'Planned NVD',
    'cancelled decision': 'Cancelled decision',
  };

  return statusMap[normalized] || status;
}

function normalizeBranch(branch: string): string {
  if (!branch) return 'Unknown';
  
  const normalized = branch.toUpperCase().trim();
  
  const branchMap: Record<string, string> = {
    'MCJ1': 'MCJ1',
    'MCJ2': 'MCJ2',
    'MY CLINIC JEDDAH 1': 'MCJ1',
    'MY CLINIC JEDDAH 2': 'MCJ2',
    'MYCLINIC JEDDAH 1': 'MCJ1',
    'MYCLINIC JEDDAH 2': 'MCJ2',
    'JEDDAH 1': 'MCJ1',
    'JEDDAH 2': 'MCJ2',
  };

  return branchMap[normalized] || normalized;
}