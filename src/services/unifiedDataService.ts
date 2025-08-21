import { supabase } from "@/integrations/supabase/client";

export interface UnifiedRequest {
  id: string;
  source_type: string;
  excel_upload_id?: string;
  excel_row_number?: number;
  request_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  patient_name: string;
  patient_id?: string;
  patient_phone?: string;
  patient_email?: string;
  medical_condition: string;
  specialty: string;
  urgency: string;
  hospital_code: string;
  hospital_name?: string;
  branch_code?: string;
  status: string;
  loss_reason?: string;
  paid_amount: number;
  currency: string;
  notes?: string;
  attachments: any;
  custom_fields: any;
}

export interface ExcelUploadBatch {
  id: string;
  filename: string;
  uploaded_by: string;
  uploaded_at: string;
  total_rows: number;
  processed_rows: number;
  success_count: number;
  error_count: number;
  warnings_count: number;
  status: string;
  processing_log: any;
  column_mappings: any;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  status: string;
  hospital_code?: string;
  specialty?: string;
  department?: string;
  permissions: any;
  last_login?: string;
  preferences: any;
}

export interface AnalyticsData {
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  totalRevenue: number;
  conversionRate: number;
  hospitalStats: Array<{
    hospital_code: string;
    hospital_name: string;
    total_cases: number;
    completed_cases: number;
    revenue: number;
  }>;
  specialtyStats: Array<{
    specialty: string;
    case_count: number;
    success_rate: number;
  }>;
  branchStats: Array<{
    branch_code: string;
    total_cases: number;
    completed_cases: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    requests: number;
    completed: number;
    revenue: number;
  }>;
}

class UnifiedDataService {
  // User Management
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async updateUserProfile(userId: string, updates: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Request Management
  async getAllRequests(filters?: {
    startDate?: string;
    endDate?: string;
    hospital?: string;
    specialty?: string;
    status?: string;
    assignedTo?: string;
  }): Promise<UnifiedRequest[]> {
    try {
      let query = supabase
        .from('unified_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('request_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('request_date', filters.endDate);
      }
      if (filters?.hospital) {
        query = query.eq('hospital_code', filters.hospital);
      }
      if (filters?.specialty) {
        query = query.eq('specialty', filters.specialty);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
  }

  async createRequest(requestData: Omit<UnifiedRequest, 'id' | 'created_at' | 'updated_at'>): Promise<UnifiedRequest | null> {
    try {
      const { data, error } = await supabase
        .from('unified_requests')
        .insert([requestData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating request:', error);
      return null;
    }
  }

  async updateRequest(requestId: string, updates: Partial<UnifiedRequest>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('unified_requests')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating request:', error);
      return false;
    }
  }

  // Excel Import Management
  async createExcelUploadBatch(filename: string, uploadedBy: string): Promise<ExcelUploadBatch | null> {
    try {
      const { data, error } = await supabase
        .from('excel_upload_batches')
        .insert([{
          filename,
          uploaded_by: uploadedBy,
          status: 'processing'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating excel upload batch:', error);
      return null;
    }
  }

  async processExcelData(
    uploadId: string, 
    excelData: any[], 
    columnMappings: Record<string, string>
  ): Promise<{ success: number; errors: number; warnings: number; details: string[] }> {
    const results = { success: 0, errors: 0, warnings: 0, details: [] as string[] };
    const processedRequests = [];

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      try {
        // Map columns based on mapping
        const mappedData = this.mapExcelRow(row, columnMappings);
        
        // Validate required fields
        const validation = this.validateExcelRow(mappedData, i + 1);
        if (!validation.isValid) {
          results.errors++;
          results.details.push(`Row ${i + 1}: ${validation.errors.join(', ')}`);
          continue;
        }

        // Create request data
        const requestData: any = {
          source_type: 'excel',
          excel_upload_id: uploadId,
          excel_row_number: i + 1,
          request_date: mappedData.request_date || new Date().toISOString().split('T')[0],
          created_by: mappedData.created_by,
          patient_name: mappedData.patient_name,
          patient_id: mappedData.patient_id,
          patient_phone: mappedData.patient_phone,
          patient_email: mappedData.patient_email,
          medical_condition: mappedData.medical_condition,
          specialty: mappedData.specialty,
          urgency: mappedData.urgency || 'normal',
          hospital_code: mappedData.hospital_code,
          hospital_name: mappedData.hospital_name,
          branch_code: mappedData.branch_code,
          status: this.normalizeStatus(mappedData.status) || 'pending',
          loss_reason: mappedData.loss_reason,
          paid_amount: parseFloat(mappedData.paid_amount) || 0,
          currency: 'SAR',
          notes: mappedData.notes,
          attachments: [],
          custom_fields: {}
        };

        processedRequests.push(requestData);
        results.success++;
        results.details.push(`Row ${i + 1}: Successfully processed ${mappedData.patient_name}`);
      } catch (error) {
        results.errors++;
        results.details.push(`Row ${i + 1}: Error - ${error.message}`);
      }
    }

    // Batch insert all valid requests
    if (processedRequests.length > 0) {
      try {
        const { error } = await supabase
          .from('unified_requests')
          .insert(processedRequests);

        if (error) throw error;
      } catch (error) {
        console.error('Error batch inserting requests:', error);
        results.errors += processedRequests.length;
        results.success = 0;
        results.details = [`Failed to save ${processedRequests.length} requests to database`];
      }
    }

    // Update upload batch status
    await this.updateExcelUploadBatch(uploadId, {
      total_rows: excelData.length,
      processed_rows: excelData.length,
      success_count: results.success,
      error_count: results.errors,
      warnings_count: results.warnings,
      status: results.errors === 0 ? 'completed' : 'failed',
      processing_log: results.details
    });

    return results;
  }

  private mapExcelRow(row: any, mappings: Record<string, string>): any {
    const mapped: any = {};
    for (const [excelColumn, dbField] of Object.entries(mappings)) {
      mapped[dbField] = row[excelColumn];
    }
    return mapped;
  }

  private validateExcelRow(data: any, rowNumber: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.patient_name) errors.push('Patient name is required');
    if (!data.medical_condition) errors.push('Medical condition is required');
    if (!data.specialty) errors.push('Specialty is required');
    if (!data.hospital_code) errors.push('Hospital code is required');

    return { isValid: errors.length === 0, errors };
  }

  private normalizeStatus(status: string): string {
    if (!status) return 'pending';
    
    const normalized = status.toLowerCase().trim();
    const statusMap: Record<string, string> = {
      'done': 'completed',
      'complete': 'completed',
      'finished': 'completed',
      'cancelled': 'cancelled',
      'canceled': 'cancelled',
      'reject': 'rejected',
      'rejected': 'rejected',
      'pending': 'pending',
      'in-progress': 'in-progress',
      'processing': 'in-progress',
      'scheduled': 'scheduled',
      'postponed': 'postponed'
    };

    return statusMap[normalized] || 'pending';
  }

  async updateExcelUploadBatch(uploadId: string, updates: Partial<ExcelUploadBatch>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('excel_upload_batches')
        .update(updates)
        .eq('id', uploadId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating excel upload batch:', error);
      return false;
    }
  }

  // Analytics
  async getAnalytics(filters?: {
    startDate?: string;
    endDate?: string;
    hospital?: string;
    specialty?: string;
  }): Promise<AnalyticsData> {
    try {
      const requests = await this.getAllRequests(filters);
      
      const totalRequests = requests.length;
      const completedRequests = requests.filter(r => r.status === 'completed').length;
      const pendingRequests = requests.filter(r => ['pending', 'in-progress', 'scheduled'].includes(r.status)).length;
      const rejectedRequests = requests.filter(r => ['cancelled', 'rejected'].includes(r.status)).length;
      const totalRevenue = requests.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
      const conversionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

      // Hospital stats
      const hospitalMap = new Map();
      requests.forEach(r => {
        const key = r.hospital_code;
        if (!hospitalMap.has(key)) {
          hospitalMap.set(key, {
            hospital_code: r.hospital_code,
            hospital_name: r.hospital_name || r.hospital_code,
            total_cases: 0,
            completed_cases: 0,
            revenue: 0
          });
        }
        const stats = hospitalMap.get(key);
        stats.total_cases++;
        if (r.status === 'completed') stats.completed_cases++;
        stats.revenue += r.paid_amount || 0;
      });

      // Specialty stats
      const specialtyMap = new Map();
      requests.forEach(r => {
        if (!specialtyMap.has(r.specialty)) {
          specialtyMap.set(r.specialty, {
            specialty: r.specialty,
            case_count: 0,
            completed_count: 0
          });
        }
        const stats = specialtyMap.get(r.specialty);
        stats.case_count++;
        if (r.status === 'completed') stats.completed_count++;
      });

      const specialtyStats = Array.from(specialtyMap.values()).map(s => ({
        ...s,
        success_rate: s.case_count > 0 ? (s.completed_count / s.case_count) * 100 : 0
      }));

      // Branch stats
      const branchMap = new Map();
      requests.forEach(r => {
        if (r.branch_code) {
          if (!branchMap.has(r.branch_code)) {
            branchMap.set(r.branch_code, {
              branch_code: r.branch_code,
              total_cases: 0,
              completed_cases: 0
            });
          }
          const stats = branchMap.get(r.branch_code);
          stats.total_cases++;
          if (r.status === 'completed') stats.completed_cases++;
        }
      });

      // Monthly trends
      const monthlyMap = new Map();
      requests.forEach(r => {
        const month = r.request_date.substring(0, 7); // YYYY-MM
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, {
            month,
            requests: 0,
            completed: 0,
            revenue: 0
          });
        }
        const stats = monthlyMap.get(month);
        stats.requests++;
        if (r.status === 'completed') stats.completed++;
        stats.revenue += r.paid_amount || 0;
      });

      return {
        totalRequests,
        completedRequests,
        pendingRequests,
        rejectedRequests,
        totalRevenue,
        conversionRate,
        hospitalStats: Array.from(hospitalMap.values()),
        specialtyStats,
        branchStats: Array.from(branchMap.values()),
        monthlyTrends: Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month))
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalRequests: 0,
        completedRequests: 0,
        pendingRequests: 0,
        rejectedRequests: 0,
        totalRevenue: 0,
        conversionRate: 0,
        hospitalStats: [],
        specialtyStats: [],
        branchStats: [],
        monthlyTrends: []
      };
    }
  }

  // Finance Integration
  async getFinanceTransactions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('finance_transactions')
        .select(`
          *,
          unified_requests!inner(
            patient_name,
            hospital_name,
            medical_condition
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching finance transactions:', error);
      return [];
    }
  }

  async updatePaymentStatus(transactionId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('finance_transactions')
        .update({ payment_status: status })
        .eq('id', transactionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  }

  // Sync local storage data to Supabase
  async syncLocalStorageToSupabase(): Promise<void> {
    try {
      // Get current user
      const currentUser = await this.getCurrentUser();
      if (!currentUser) return;

      // Check for local storage data
      const localRequests = localStorage.getItem('medical_requests');
      if (localRequests) {
        const requests = JSON.parse(localRequests);
        
        for (const request of requests) {
          // Check if request already exists in Supabase
          const { data: existing } = await supabase
            .from('unified_requests')
            .select('id')
            .eq('patient_name', request.patientName)
            .eq('medical_condition', request.medicalCondition)
            .eq('created_by', currentUser.id)
            .single();

          if (!existing) {
            // Convert local storage format to unified format
            const unifiedRequest: any = {
              source_type: 'manual',
              request_date: request.requestDate || new Date().toISOString().split('T')[0],
              created_by: currentUser.id,
              patient_name: request.patientName,
              patient_id: request.patientId,
              patient_phone: request.patientPhone,
              patient_email: request.patientEmail,
              medical_condition: request.medicalCondition,
              specialty: request.specialty,
              urgency: request.urgency || 'normal',
              hospital_code: request.hospitalCode || currentUser.hospital_code || 'UNKNOWN',
              hospital_name: request.hospitalName,
              branch_code: request.branchCode,
              status: request.status || 'pending',
              loss_reason: request.lossReason,
              paid_amount: parseFloat(request.paidAmount) || 0,
              currency: 'SAR',
              notes: request.notes,
              attachments: request.attachments || [],
              custom_fields: {}
            };

            await this.createRequest(unifiedRequest);
          }
        }
      }
    } catch (error) {
      console.error('Error syncing local storage to Supabase:', error);
    }
  }
}

export const unifiedDataService = new UnifiedDataService();