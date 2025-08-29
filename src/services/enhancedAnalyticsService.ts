import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  totalCases: number;
  byStatus: Record<string, number>;
  byBranch: Record<string, number>;
  byHospital: Record<string, number>;
  bySpecialty: Record<string, number>;
  rawData?: any[];
}

export class EnhancedAnalyticsService {
  
  /**
   * Get analytics data for a specific month/year, checking database first, then localStorage
   */
  static async getMonthlyAnalytics(year: number, month: number): Promise<AnalyticsData> {
    console.log(`📊 Getting analytics for ${year}-${month.toString().padStart(2, '0')}`);
    
    try {
      // First try database
      const dbResult = await this.getDatabaseAnalytics(year, month);
      if (dbResult.totalCases > 0) {
        console.log(`✅ Database found ${dbResult.totalCases} cases`);
        return dbResult;
      }
    } catch (error) {
      console.warn('Database analytics failed, falling back to localStorage:', error);
    }
    
    // Fallback to localStorage
    const localResult = await this.getLocalStorageAnalytics(year, month);
    console.log(`📂 localStorage found ${localResult.totalCases} cases`);
    return localResult;
  }
  
  /**
   * Get analytics from Supabase database
   */
  private static async getDatabaseAnalytics(year: number, month: number): Promise<AnalyticsData> {
    const { data, error } = await supabase.rpc("analyze_excel_cases_monthly", {
      p_year: year,
      p_month: month,
    });
    
    if (error) {
      throw new Error(`Database analytics error: ${error.message}`);
    }
    
    const row = (data ?? [])[0] ?? {} as any;
    
    return {
      totalCases: Number(row.total_cases ?? 0),
      byStatus: row.status_breakdown ?? {},
      byBranch: row.branch_breakdown ?? {},
      byHospital: row.hospital_breakdown ?? {},
      bySpecialty: row.specialty_breakdown ?? {},
    };
  }
  
  /**
   * Get analytics from localStorage with robust date parsing
   */
  private static async getLocalStorageAnalytics(year: number, month: number): Promise<AnalyticsData> {
    const allRequests = this.getAllLocalStorageRequests();
    
    // Filter by month/year with enhanced date parsing
    const filteredRequests = allRequests.filter(request => {
      const requestDate = this.parseRequestDate(request);
      if (!requestDate) return false;
      
      return requestDate.getFullYear() === year && (requestDate.getMonth() + 1) === month;
    });
    
    console.log(`📅 Filtered ${filteredRequests.length} requests for ${year}-${month.toString().padStart(2, '0')}`);
    
    // Aggregate data
    const analytics: AnalyticsData = {
      totalCases: filteredRequests.length,
      byStatus: {},
      byBranch: {},
      byHospital: {},
      bySpecialty: {},
      rawData: filteredRequests
    };
    
    filteredRequests.forEach(request => {
      // Status breakdown - prioritize Excel column names
      const status = this.normalizeStatus(
        request['Status of operation'] || request.status || request.operationStatus || 'Unknown'
      );
      analytics.byStatus[status] = (analytics.byStatus[status] || 0) + 1;
      
      // Branch breakdown - use exact Excel column name
      const branch = this.normalizeBranch(
        request['My Clinic Branch'] || request.clinicBranch || request.referredFrom || request.branchCode || 'Unknown'
      );
      analytics.byBranch[branch] = (analytics.byBranch[branch] || 0) + 1;
      
      // Hospital breakdown - use exact Excel column name
      const hospital = request['Referred Hospital'] || request.hospitalName || request.hospital || 'Unknown Hospital';
      analytics.byHospital[hospital] = (analytics.byHospital[hospital] || 0) + 1;
      
      // Specialty breakdown - use exact Excel column name
      const specialty = request['Specialty'] || request.specialty || 'General';
      analytics.bySpecialty[specialty] = (analytics.bySpecialty[specialty] || 0) + 1;
    });
    
    return analytics;
  }
  
  /**
   * Get all requests from localStorage with comprehensive key checking
   */
  private static getAllLocalStorageRequests(): any[] {
    const allRequests: any[] = [];
    
    const storageKeys = [
      'medical_requests',
      'excel_data_imported', 
      'admin_uploaded_requests',
      'uploaded_requests',
      'adminData',
      'allData',
      'requests'
    ];
    
    storageKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            allRequests.push(...parsed);
          } else if (parsed && typeof parsed === 'object') {
            if (parsed.id || parsed.patientName || parsed.patientMRN) {
              allRequests.push(parsed);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not parse localStorage key ${key}:`, error);
      }
    });
    
    // Remove duplicates based on ID or patient info
    const uniqueRequests = allRequests.filter((request, index, arr) => {
      const id = request.id || request.patientMRN || request.patientName;
      return arr.findIndex(r => (r.id || r.patientMRN || r.patientName) === id) === index;
    });
    
    console.log(`📦 Found ${uniqueRequests.length} unique requests in localStorage`);
    return uniqueRequests;
  }
  
  /**
   * Enhanced date parsing to handle various formats
   */
  private static parseRequestDate(request: any): Date | null {
    const dateFields = [
      'Date of Request:', 'Date of File Opening', 'Agreed - Booked - OR date(mm/dd/yyyy)',
      'date', 'Date', 'requestDate', 'request_date', 'created_at', 
      'dateCreated', 'Request Date'
    ];
    
    for (const field of dateFields) {
      const dateValue = request[field];
      if (dateValue) {
        const parsedDate = this.parseDate(dateValue);
        if (parsedDate) return parsedDate;
      }
    }
    
    return null;
  }
  
  /**
   * Parse various date formats including Excel serial dates
   */
  private static parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    // Handle Excel serial date numbers (like 45677)
    if (typeof dateValue === 'number' && dateValue > 25000 && dateValue < 100000) {
      const excelEpoch = new Date(1900, 0, 1);
      return new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
    }
    
    // Handle date strings
    if (typeof dateValue === 'string') {
      // Try parsing as ISO date first
      const isoDate = new Date(dateValue);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
      
      // Handle MM/DD/YYYY format
      if (dateValue.includes('/')) {
        const parts = dateValue.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[0]) - 1; // JS months are 0-based
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          const fullYear = year < 100 ? 2000 + year : year;
          return new Date(fullYear, month, day);
        }
      }
      
      // Handle DD-MM-YYYY format
      if (dateValue.includes('-') && !dateValue.includes('T')) {
        const parts = dateValue.split('-');
        if (parts.length === 3 && parts[0].length <= 2) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);
          return new Date(year, month, day);
        }
      }
    }
    
    return null;
  }
  
  /**
   * Normalize status values to standard categories
   */
  private static normalizeStatus(status: string): string {
    const s = status.toString().toLowerCase().trim();
    
    if (s === 'done' || s === 'completed') return 'Done';
    if (s === 'scheduled') return 'Scheduled';
    if (s === 'planned nvd' || s === 'nvd planned') return 'Planned NVD';
    if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
    if (s === 'case canceled' || s === 'case cancelled') return 'Case Canceled';
    if (s === 'rejected' || s === 'policy rejection') return 'Policy Rejection';
    if (s === 'pending') return 'Pending';
    if (s === 'reschedule' || s === 'rescheduled') return 'Reschedule';
    if (s === 'postponed') return 'Postponed';
    if (s === 'privilege') return 'Privilege';
    
    // Return original with proper casing if no match
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
  
  /**
   * Normalize branch codes to standard format
   */
  private static normalizeBranch(branch: string): string {
    const b = branch.toString().toUpperCase().trim();
    
    // Map common variations
    if (b.includes('MCJ1') || b.includes('MC AL MUHAMMADIYAH') || b.includes('MUHAMMADIYAH')) return 'MCJ1';
    if (b.includes('MCJ2') || b.includes('MC AL SAFA') || b.includes('SAFA')) return 'MCJ2';
    if (b.includes('JEDDAH 1')) return 'MCJ1';
    if (b.includes('JEDDAH 2')) return 'MCJ2';
    
    return branch;
  }
  
  /**
   * Check if migration is needed
   */
  static async checkMigrationStatus(): Promise<{
    hasLocalData: boolean;
    hasSupabaseData: boolean;
    localCount: number;
    supabaseCount: number;
    migrationNeeded: boolean;
  }> {
    const localRequests = this.getAllLocalStorageRequests();
    
    try {
      const { count } = await supabase
        .from('excel_rows_raw')
        .select('*', { count: 'exact', head: true });
        
      return {
        hasLocalData: localRequests.length > 0,
        hasSupabaseData: (count || 0) > 0,
        localCount: localRequests.length,
        supabaseCount: count || 0,
        migrationNeeded: localRequests.length > 0 && (count || 0) === 0
      };
    } catch (error) {
      console.error('Error checking Supabase data:', error);
      return {
        hasLocalData: localRequests.length > 0,
        hasSupabaseData: false,
        localCount: localRequests.length,
        supabaseCount: 0,
        migrationNeeded: localRequests.length > 0
      };
    }
  }
}