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
    validationResults?: {
      totalProcessed: number;
      withValidDates: number;
      julyRecords: number;
      sampleDates: string[];
    };
  }> {
    try {
      // Get all Excel data from localStorage
      const allRequests = this.getAllLocalStorageRequests();
      
      if (allRequests.length === 0) {
        return { success: true, migratedCount: 0 };
      }

      console.log(`🔄 Migration: Found ${allRequests.length} records to migrate`);

      // Validation: Count July records and parse dates
      let withValidDates = 0;
      let julyRecords = 0;
      const sampleDates: string[] = [];
      
      // Enhanced row processing with better date parsing
      const rawRows = allRequests.map((record, index) => {
        const dateStr = this.extractDateString(record);
        const parsedDate = this.parseDate(dateStr);
        
        if (parsedDate) {
          withValidDates++;
          if (sampleDates.length < 10) {
            sampleDates.push(`${dateStr} -> ${parsedDate}`);
          }
          
          // Count July records for validation
          const date = new Date(parsedDate);
          if (date.getMonth() === 6) { // July is month 6 (0-based)
            julyRecords++;
          }
        }
        
        return {
          __row: index + 1,
          Date: dateStr,
          Branch: this.extractBranchString(record),
          "Hospital Code": this.extractHospitalCode(record),
          "Hospital Name": record.hospitalName || 'Unknown',
          Specialty: record.specialty || 'Unknown',
          Status: this.normalizeStatus(record.operationStatus || 'Pending'),
          "Loss Reason": record.reasonPendingCancellation || '',
          "Paid Amount": this.extractPaidAmountString(record)
        };
      });

      console.log(`📊 Migration validation: ${withValidDates}/${allRequests.length} records with valid dates, ${julyRecords} July records found`);
      console.log('📋 Sample date parsing:', sampleDates);

      // Use the import function to process the data
      const { data, error } = await supabase.rpc('import_excel_rows', {
        p_source_file: `LocalStorage_Migration_${new Date().toISOString()}`,
        p_rows: rawRows
      });

      if (error) {
        console.error('Error importing rows:', error);
        throw error;
      }

      console.log(`✅ Successfully migrated ${data} records to Excel tables`);

      // Validate migration by checking the database
      await this.validateMigration(julyRecords);

      return { 
        success: true, 
        migratedCount: data,
        validationResults: {
          totalProcessed: allRequests.length,
          withValidDates,
          julyRecords,
          sampleDates
        }
      };

    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        migratedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async validateMigration(expectedJulyRecords: number): Promise<void> {
    try {
      console.log('🔍 Validating migration...');
      
      // Check current year July records in database
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase.rpc('analyze_excel_cases_monthly', {
        p_year: currentYear,
        p_month: 7
      });
      
      if (error) {
        console.warn('Validation query failed:', error);
        return;
      }
      
      const dbJulyCount = data?.[0]?.total_cases || 0;
      console.log(`📊 Validation: Expected ${expectedJulyRecords} July records, database shows ${dbJulyCount}`);
      
      if (dbJulyCount !== expectedJulyRecords && expectedJulyRecords > 0) {
        console.warn(`⚠️ Validation mismatch: Expected ${expectedJulyRecords} July records but database shows ${dbJulyCount}`);
      } else if (dbJulyCount === expectedJulyRecords && expectedJulyRecords > 0) {
        console.log('✅ Validation passed: July record counts match');
      }
    } catch (error) {
      console.warn('Migration validation failed:', error);
    }
  }

  static async uploadExcelToSupabase(excelData: any[], filename: string): Promise<{
    success: boolean;
    migratedCount: number;
    error?: string;
  }> {
    try {
      console.log(`Uploading ${excelData.length} rows from ${filename}`);

      // Map Excel data to the expected raw format
      const rawRows = excelData.map((row, index) => ({
        __row: index + 1,
        Date: this.extractExcelDate(row),
        Branch: this.extractExcelBranch(row),
        "Hospital Code": this.extractExcelHospitalCode(row),
        "Hospital Name": this.extractExcelHospitalName(row),
        Specialty: this.extractExcelSpecialty(row),
        Status: this.extractExcelStatus(row),
        "Loss Reason": this.extractExcelLossReason(row),
        "Paid Amount": this.extractExcelPaidAmount(row)
      }));

      // Use the import function to process the data
      const { data, error } = await supabase.rpc('import_excel_rows', {
        p_source_file: filename,
        p_rows: rawRows
      });

      if (error) {
        console.error('Error importing Excel rows:', error);
        throw error;
      }

      console.log(`Successfully uploaded ${data} records to Excel tables`);

      return { success: true, migratedCount: data };

    } catch (error) {
      console.error('Excel upload failed:', error);
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
      // Handle Excel serial numbers first (common range 40000-50000 for 2009-2037)
      if (/^\d+$/.test(dateStr)) {
        const serialNumber = Number(dateStr);
        if (serialNumber > 25000 && serialNumber < 60000) {
          const date = new Date((serialNumber - 25569) * 86400 * 1000);
          return date.toISOString().split('T')[0];
        }
      }
      
      // Try multiple date formats
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr; // Already in correct format
      }

      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        const parts = dateStr.split('/');
        const [month, day, year] = parts.map(Number);
        
        // Validate ranges
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
        
        // Try DD/MM/YYYY if MM/DD/YYYY doesn't make sense
        if (Number(parts[0]) > 12 && Number(parts[1]) <= 12) {
          const [day, month, year] = parts.map(Number);
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      }

      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
        const [month, day, year] = dateStr.split('-').map(Number);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      }

      // Try short year formats
      if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dateStr)) {
        const [month, day, shortYear] = dateStr.split('/').map(Number);
        const year = shortYear < 50 ? 2000 + shortYear : 1900 + shortYear; // Y2K-like logic
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
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

  // Extraction methods for localStorage records
  private static extractDateString(record: ExcelRecord): string {
    const date = record.dateCreated || record.date || record['Date'] || record['Request Creation Date'];
    if (!date) return new Date().toISOString().split('T')[0];
    
    // Return the raw date string for processing by parseDate
    return String(date);
  }

  private static extractBranchString(record: ExcelRecord): string {
    const branch = record.clinicBranch || record.referredFrom || record.branch || record['My Clinic Branch'] || record['Branch'];
    return this.normalizeBranchCode(String(branch)) || 'Unknown';
  }

  private static extractHospitalCode(record: ExcelRecord): string {
    return record.hospitalCode || record['Hospital Code'] || 'UNK';
  }

  private static extractPaidAmountString(record: ExcelRecord): string {
    const amount = this.calculatePaidAmount(record.paymentStatus);
    return String(amount);
  }

  // Extraction methods for Excel rows
  private static extractExcelDate(row: any): string {
    const dateFields = ['Date', 'Month', 'AP', 'Request Creation Date', 'Created Date'];
    for (const field of dateFields) {
      if (row[field]) {
        // Handle Excel serial numbers
        if (typeof row[field] === 'number' && row[field] > 25000) {
          return new Date((row[field] - 25569) * 86400 * 1000).toISOString().split('T')[0];
        }
        const parsed = this.parseDate(String(row[field]));
        if (parsed) return parsed;
      }
    }
    return new Date().toISOString().split('T')[0];
  }

  private static extractExcelBranch(row: any): string {
    const branchFields = ['Branch', 'My Clinic Branch', 'Clinic Branch', 'Referred From'];
    for (const field of branchFields) {
      if (row[field]) {
        const normalized = this.normalizeBranchCode(String(row[field]));
        if (normalized) return normalized;
      }
    }
    return 'Unknown';
  }

  private static extractExcelHospitalCode(row: any): string {
    return row['Hospital Code'] || row['Code'] || 'UNK';
  }

  private static extractExcelHospitalName(row: any): string {
    return row['Hospital Name'] || row['Hospital'] || 'Unknown Hospital';
  }

  private static extractExcelSpecialty(row: any): string {
    return row['Specialty'] || row['Service Specialty'] || 'General';
  }

  private static extractExcelStatus(row: any): string {
    const statusFields = ['Status', 'AI', 'Operation Status', 'Request Status'];
    for (const field of statusFields) {
      if (row[field]) {
        return this.normalizeStatus(String(row[field]));
      }
    }
    return 'Pending';
  }

  private static extractExcelLossReason(row: any): string {
    return row['Loss Reason'] || row['Reason Pending Cancellation'] || '';
  }

  private static extractExcelPaidAmount(row: any): string {
    const amountFields = ['Paid Amount', 'Amount', 'Revenue', 'Actual Revenue'];
    for (const field of amountFields) {
      if (row[field]) {
        const amount = String(row[field]).replace(/[^\d.]/g, ''); // Remove non-numeric characters
        return amount || '0';
      }
    }
    return '0';
  }

  static async checkMigrationStatus(): Promise<{
    hasLocalData: boolean;
    hasSupabaseData: boolean;
    localCount: number;
    supabaseCount: number;
  }> {
    const localRequests = this.getAllLocalStorageRequests();
    
    const { count } = await supabase
      .from('excel_rows_raw')
      .select('*', { count: 'exact', head: true });

    return {
      hasLocalData: localRequests.length > 0,
      hasSupabaseData: (count || 0) > 0,
      localCount: localRequests.length,
      supabaseCount: count || 0
    };
  }
}