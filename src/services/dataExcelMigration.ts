import { supabase } from "@/integrations/supabase/client";

export interface ExcelRecord {
  id: string;
  dateCreated: string;
  patientName: string;
  patientMRN?: string;
  patientNationalId?: string;
  patientMobileNo?: string;
  specialty: string;
  hospitalName: string;
  clinicBranch?: string;
  admissionType?: string;
  caseCoordinator?: string;
  doctorName?: string;
  referredFrom?: string;
  expectedSurgeryDate?: string;
  operationStatus: string;
  reasonPendingCancellation?: string;
  paymentStatus?: string;
  history?: string;
  notes?: string;
  [key: string]: any;
}

export class DataExcelMigrationService {
  static async migrateLocalStorageToSupabase(): Promise<{
    success: boolean;
    migratedCount: number;
    error?: string;
  }> {
    try {
      // Get all Excel data from localStorage
      const allRequests = this.getAllLocalStorageRequests();
      
      if (allRequests.length === 0) {
        return { success: true, migratedCount: 0 };
      }

      console.log(`Found ${allRequests.length} records to migrate`);

      // Batch insert to excel_requests table
      const mappedRecords = allRequests.map(record => ({
        request_date: this.parseDate(record.dateCreated),
        branch_code: this.normalizeBranchCode(record.clinicBranch),
        hospital_name: record.hospitalName || 'Unknown',
        specialty: record.specialty || 'Unknown',
        status: this.normalizeStatus(record.operationStatus),
        loss_reason: record.reasonPendingCancellation,
        paid_amount: this.calculatePaidAmount(record.paymentStatus),
        patient_name: record.patientName,
        patient_id: record.patientMRN || record.patientNationalId,
        raw_data: record
      }));

      // Insert in batches of 50 to avoid limits
      const batchSize = 50;
      let totalInserted = 0;

      for (let i = 0; i < mappedRecords.length; i += batchSize) {
        const batch = mappedRecords.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('excel_requests')
          .insert(batch);

        if (error) {
          console.error('Error inserting batch:', error);
          throw error;
        }

        totalInserted += batch.length;
        console.log(`Migrated ${totalInserted}/${mappedRecords.length} records`);
      }

      return { success: true, migratedCount: totalInserted };

    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        migratedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static getAllLocalStorageRequests(): ExcelRecord[] {
    const allRequests: ExcelRecord[] = [];
    
    // Check all possible localStorage keys
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
            // Handle single record or object structure
            if (parsed.id || parsed.patientName) {
              allRequests.push(parsed);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not parse ${key}:`, error);
      }
    });

    // Remove duplicates based on unique combinations
    const uniqueRequests = allRequests.filter((record, index, self) => 
      index === self.findIndex(r => 
        r.id === record.id || 
        (r.patientName === record.patientName && 
         r.dateCreated === record.dateCreated && 
         r.hospitalName === record.hospitalName)
      )
    );

    return uniqueRequests;
  }

  private static parseDate(dateStr: string): string | null {
    if (!dateStr) return null;
    
    try {
      // Try multiple date formats
      const formats = [
        /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/,  // MM-DD-YYYY
      ];

      if (formats[0].test(dateStr)) {
        return dateStr; // Already in correct format
      }

      if (formats[1].test(dateStr)) {
        const [month, day, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      if (formats[2].test(dateStr)) {
        const [month, day, year] = dateStr.split('-');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Try to parse as Date object
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }

      return null;
    } catch {
      return null;
    }
  }

  private static normalizeBranchCode(branch?: string): string | null {
    if (!branch) return null;
    
    const normalized = branch.toUpperCase().trim();
    
    // Map common variations
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

  private static normalizeStatus(status: string): string {
    if (!status) return 'pending';
    
    const normalized = status.toLowerCase().trim();
    
    // Map common status variations to standard values
    const statusMap: Record<string, string> = {
      'completed': 'Completed',
      'scheduled': 'Scheduled',
      'pending': 'Pending',
      'cancelled': 'Cancelled',
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

  private static calculatePaidAmount(paymentStatus?: string): number {
    if (!paymentStatus) return 0;
    
    const status = paymentStatus.toLowerCase();
    
    if (status.includes('paid') || status.includes('complete')) {
      return 1000; // Default amount for paid status
    }
    
    return 0;
  }

  static async checkMigrationStatus(): Promise<{
    hasLocalData: boolean;
    hasSupabaseData: boolean;
    localCount: number;
    supabaseCount: number;
  }> {
    const localRequests = this.getAllLocalStorageRequests();
    
    const { count } = await supabase
      .from('excel_requests')
      .select('*', { count: 'exact', head: true });

    return {
      hasLocalData: localRequests.length > 0,
      hasSupabaseData: (count || 0) > 0,
      localCount: localRequests.length,
      supabaseCount: count || 0
    };
  }
}