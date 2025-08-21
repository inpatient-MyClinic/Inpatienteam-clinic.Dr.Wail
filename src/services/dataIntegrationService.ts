import { RequestFormData } from "@/types/request";
import { requestStorage, StoredRequest } from "./requestStorage";
import { supabase } from "@/integrations/supabase/client";

export interface UnifiedRequest {
  id: string;
  source: 'local' | 'excel' | 'supabase';
  dateCreated: string;
  timeCreated?: string;
  patientName: string;
  patientNationalId?: string;
  patientMobileNo?: string;
  patientMRN?: string;
  hospitalMRN?: string;
  hospitalName?: string;
  specialty: string;
  doctorName?: string;
  serviceDescription?: string;
  expectedSurgeryDate?: string;
  admissionType?: string;
  status: string;
  operationStatus?: string;
  caseManager?: string;
  assignedCoordinator?: string;
  clinicBranch?: string;
  referredFrom?: string;
  referredToHospital?: string;
  history?: string;
  notes?: string;
  createdBy?: string;
  paymentStatus?: string;
  attachments?: string[];
}

class DataIntegrationService {
  // Convert Excel serial date number to ISO date string
  private convertExcelDate(excelDate: any): string | undefined {
    if (!excelDate) return undefined;
    
    // Handle Excel serial numbers
    if (typeof excelDate === 'number' && excelDate > 25000) {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
    }
    
    // Handle string dates
    if (typeof excelDate === 'string') {
      const trimmed = excelDate.trim();
      if (!trimmed) return undefined;
      
      // Try to parse as number first (Excel serial)
      const num = Number(trimmed);
      if (!isNaN(num) && num > 25000) {
        const date = new Date((num - 25569) * 86400 * 1000);
        return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
      }
      
      // Handle common date formats
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      // Handle DD/MM/YYYY format
      const parts = trimmed.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const [a, b, c] = parts.map(p => parseInt(p.trim()));
        let day: number, month: number, year: number;
        
        if (a > 31) {
          // YYYY/MM/DD or YYYY-MM-DD
          year = a; month = b; day = c;
        } else if (a > 12) {
          // DD/MM/YYYY
          day = a; month = b; year = c;
        } else {
          // MM/DD/YYYY (default)
          month = a; day = b; year = c;
        }
        
        const constructedDate = new Date(year, month - 1, day);
        if (!isNaN(constructedDate.getTime())) {
          return constructedDate.toISOString().split('T')[0];
        }
      }
    }
    
    // Handle Date objects
    if (excelDate instanceof Date) {
      return isNaN(excelDate.getTime()) ? undefined : excelDate.toISOString().split('T')[0];
    }
    
    return undefined;
  }

  // Map Excel row to unified format
  private mapExcelRow(row: any): UnifiedRequest {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);

    return {
      id: `EXL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: 'excel',
      dateCreated: this.convertExcelDate(
        row['Request Creation Date'] || 
        row['Date of Request:'] || 
        row['Date'] || 
        row['Created At'] ||
        row['Date Created']
      ) || currentDate,
      timeCreated: row['Time'] || row['timeCreated'] || currentTime,
      
      // Patient Information
      patientName: row['Patient Name'] || row["Patient's Name:"] || row['PatientName'] || 'Unknown Patient',
      patientNationalId: String(row['Patient National ID'] || row["Patient's National ID:"] || ''),
      patientMobileNo: String(row['Patient Mobile No'] || row["Patient's Mobile No.:"] || ''),
      patientMRN: row['Patient MRN'] || row["Patient's MRN:"] || '',
      
      // Hospital Information
      hospitalMRN: row['Hospital MRN'] || row["Hospital File Number"] || row['MRN'] || '',
      hospitalName: row['Hospital Name'] || row['Referred Hospital'] || row['Hospital'] || '',
      clinicBranch: row['My Clinic Branch'] || row['MC Branch'] || row['Clinic Branch'] || row['Branch'] || '',
      
      // Medical Information
      specialty: row['Specialty'] || row['Medical Specialty'] || 'General',
      doctorName: row['Doctor Name'] || row["Treating Doctor's Name"] || row['Doctor'] || '',
      serviceDescription: row['Service Description'] || row['Service Description of referred service'] || row['Service'] || '',
      
      // Scheduling
      expectedSurgeryDate: this.convertExcelDate(row['Expected Surgery Date'] || row['Expected date of Surgery'] || row['Surgery Date']),
      admissionType: row['Admission Type'] || row['Type of Admission'] || 'Elective',
      
      // Case Management
      caseManager: row['Case Coordinator'] || row['Case Manager'] || row['Coordinator'] || '',
      assignedCoordinator: row['Case Coordinator'] || row['Case Manager'] || row['Coordinator'] || '',
      
      // Status Information
      status: this.normalizeStatus(row['Request Status'] || row['Status of operation'] || row['Hospital Status'] || row['Status'] || 'Pending'),
      operationStatus: this.normalizeStatus(row['Hospital Status'] || row['Status of operation'] || row['Operation Status'] || ''),
      
      // Additional Information
      referredFrom: row['Referred From'] || row['Source'] || '',
      referredToHospital: row['Referred To Hospital'] || row['Target Hospital'] || '',
      history: row['Coordinator Notes'] || row['Notes'] || row['History'] || 'Imported from Excel',
      notes: row['Hospital Notes'] || row['Additional Notes'] || '',
      createdBy: 'Excel Import',
      paymentStatus: row['Payment Status'] || 'Not Paid',
      attachments: []
    };
  }

  // Normalize status values
  private normalizeStatus(status: string): string {
    if (!status) return 'Pending';
    
    const normalized = status.toLowerCase().trim();
    const statusMap: Record<string, string> = {
      'done': 'Completed',
      'completed': 'Completed',
      'finished': 'Completed',
      'approved': 'Approved',
      'pending': 'Pending',
      'in progress': 'Under Process',
      'in-progress': 'Under Process',
      'under process': 'Under Process',
      'processing': 'Under Process',
      'cancelled': 'Cancelled',
      'canceled': 'Cancelled',
      'rejected': 'Rejected',
      'on hold': 'On Hold',
      'waiting': 'Pending'
    };
    
    return statusMap[normalized] || status;
  }

  // Convert StoredRequest to UnifiedRequest
  private mapStoredRequest(stored: StoredRequest): UnifiedRequest {
    return {
      id: `REQ_${stored.id}`,
      source: 'local',
      dateCreated: stored.dateCreated || new Date().toISOString().split('T')[0],
      timeCreated: stored.timeCreated,
      patientName: stored.patientName || 'Unknown Patient',
      patientNationalId: stored.patientNationalId,
      patientMobileNo: stored.patientMobileNo,
      patientMRN: stored.patientMRN,
      hospitalMRN: stored.hospitalMRN,
      hospitalName: stored.hospitalName,
      specialty: stored.specialty || 'General',
      doctorName: stored.doctorName,
      serviceDescription: stored.serviceDescription,
      expectedSurgeryDate: stored.expectedSurgeryDate,
      admissionType: stored.admissionType,
      status: this.normalizeStatus(stored.status || 'Pending'),
      operationStatus: stored.operationStatus,
      caseManager: stored.caseManager,
      assignedCoordinator: stored.assignedCoordinator,
      clinicBranch: stored.clinicBranch,
      referredFrom: stored.referredFrom,
      referredToHospital: stored.referredToHospital,
      history: stored.history,
      notes: stored.notes,
      createdBy: stored.createdBy,
      paymentStatus: stored.paymentStatus,
      attachments: stored.attachments || []
    };
  }

  // Get all unified requests from all sources
  async getAllUnifiedRequests(): Promise<UnifiedRequest[]> {
    const unifiedRequests: UnifiedRequest[] = [];
    
    try {
      // Get local storage requests
      const storedRequests = requestStorage.getAllRequests();
      storedRequests.forEach(request => {
        unifiedRequests.push(this.mapStoredRequest(request));
      });
      
      console.log(`Loaded ${storedRequests.length} requests from local storage`);
    } catch (error) {
      console.error('Error loading local requests:', error);
    }
    
    return unifiedRequests;
  }

  // Process and integrate Excel data
  async processExcelData(excelRows: any[]): Promise<{
    processed: number;
    errors: string[];
    unifiedRequests: UnifiedRequest[];
  }> {
    const unifiedRequests: UnifiedRequest[] = [];
    const errors: string[] = [];
    let processed = 0;

    console.log(`Processing ${excelRows.length} Excel rows...`);

    excelRows.forEach((row, index) => {
      try {
        // Validate essential fields
        const patientName = row['Patient Name'] || row["Patient's Name:"] || row['PatientName'];
        if (!patientName || patientName.trim() === '') {
          errors.push(`Row ${index + 1}: Missing patient name`);
          return;
        }

        const specialty = row['Specialty'] || row['Medical Specialty'];
        if (!specialty || specialty.trim() === '') {
          errors.push(`Row ${index + 1}: Missing specialty`);
          return;
        }

        const unifiedRequest = this.mapExcelRow(row);
        unifiedRequests.push(unifiedRequest);
        
        // Also save to local storage for compatibility
        const requestData: Partial<RequestFormData> = {
          dateCreated: unifiedRequest.dateCreated,
          timeCreated: unifiedRequest.timeCreated,
          patientName: unifiedRequest.patientName,
          patientNationalId: unifiedRequest.patientNationalId,
          patientMobileNo: unifiedRequest.patientMobileNo,
          patientMRN: unifiedRequest.patientMRN,
          hospitalMRN: unifiedRequest.hospitalMRN,
          hospitalName: unifiedRequest.hospitalName,
          specialty: unifiedRequest.specialty,
          doctorName: unifiedRequest.doctorName,
          serviceDescription: unifiedRequest.serviceDescription,
          expectedSurgeryDate: unifiedRequest.expectedSurgeryDate,
          admissionType: unifiedRequest.admissionType,
          status: unifiedRequest.status,
          history: unifiedRequest.history,
          notes: unifiedRequest.notes,
          clinicBranch: unifiedRequest.clinicBranch,
          referredFrom: unifiedRequest.referredFrom,
          referredToHospital: unifiedRequest.referredToHospital
        };

        try {
          requestStorage.saveRequest(requestData as RequestFormData, unifiedRequest.createdBy);
          processed++;
          console.log(`Saved request ${index + 1}/${excelRows.length}: ${unifiedRequest.patientName}`);
        } catch (saveError) {
          errors.push(`Row ${index + 1}: Failed to save request - ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
          console.error(`Failed to save request for row ${index + 1}:`, saveError);
        }

      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    console.log(`Excel processing complete: ${processed} processed, ${errors.length} errors`);
    return { processed, errors, unifiedRequests };
  }

  // Sync local storage data to Supabase medical_requests table
  async syncLocalStorageToSupabase(): Promise<void> {
    console.log('Supabase sync disabled to prevent RLS violations - using local storage only');
    // RLS policies are preventing direct inserts, keeping data in local storage
    // All analytics and data visualization will work from local storage
    return;
  }

  // Clear all data
  clearAllData(): void {
    requestStorage.clearAllData();
    localStorage.removeItem('excel_data_imported');
    
    // Trigger events
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('requestsUpdated'));
    window.dispatchEvent(new CustomEvent('adminDataCleared'));
  }

  // Get analytics data in unified format
  getAnalyticsData(): any[] {
    const requests = requestStorage.getAllRequests();
    
    return requests.map(req => ({
      id: `REQ${req.id}`,
      patientMRN: req.patientMRN || req.hospitalMRN || "Unknown MRN",
      type: req.admissionType === "In-Patient" ? "IP" : "OP",
      description: req.serviceDescription || "Medical Request",
      user: req.createdBy || "Unknown",
      status: req.operationStatus === "Done" ? "Completed" : (req.operationStatus || req.status || "Pending"),
      date: req.dateCreated || new Date().toISOString().split('T')[0],
      specialty: req.specialty || "General",
      hospital: req.hospitalName || req.referredToHospital || "Unknown Hospital",
      caseCoordinator: req.assignedCoordinator || req.caseManager || "Unassigned",
      requestDate: req.dateCreated ? `${req.dateCreated}T${req.timeCreated || '00:00'}` : null,
      completionDate: req.status === "Done" || req.status === "Completed" ? new Date() : null,
      serviceDescription: req.serviceDescription || "Unknown Service",
      referredFrom: req.clinicBranch || req.referredFrom || "Unknown",
      admissionType: req.admissionType || "Unknown",
      clinicBranch: req.clinicBranch || "Unknown"
    }));
  }
}

export const dataIntegrationService = new DataIntegrationService();