import { supabase } from "@/integrations/supabase/client";
import { requestStorage } from "./requestStorage";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'doctor' | 'nurse' | 'finance' | 'hospital' | 'case-coordinator' | 'customer-care';
  hospital_code?: string;
  specialty?: string;
  status: 'active' | 'pending' | 'inactive' | 'suspended';
}

export interface IntegratedRequest {
  id: string;
  patient_name: string;
  patient_id?: string;
  hospital_code: string;
  hospital_name?: string;
  specialty: string;
  status: 'pending' | 'completed' | 'cancelled' | 'in-progress' | 'rejected';
  created_by: string;
  assigned_to?: string;
  request_date: string;
  paid_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FinanceTransaction {
  id: string;
  request_id?: string;
  amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  transaction_date: string;
  created_by: string;
  notes?: string;
}

class DataIntegrationService {
  // User Management
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile;
    } catch (error) {
      console.error('Error getting current user:', error);
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

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // Request Management
  async createMedicalRequest(requestData: Omit<IntegratedRequest, 'id' | 'created_at' | 'updated_at'>): Promise<IntegratedRequest | null> {
    try {
      const { data, error } = await supabase
        .from('medical_requests')
        .insert({
          patient_name: requestData.patient_name,
          patient_id: requestData.patient_id,
          hospital_code: requestData.hospital_code,
          hospital_name: requestData.hospital_name,
          specialty: requestData.specialty,
          status: requestData.status as any,
          created_by: requestData.created_by,
          assigned_to: requestData.assigned_to,
          request_date: requestData.request_date,
          paid_amount: requestData.paid_amount,
          notes: requestData.notes,
          medical_condition: requestData.notes || 'Unknown'
        })
        .select()
        .single();

      if (error) throw error;
      return data as IntegratedRequest;
    } catch (error) {
      console.error('Error creating medical request:', error);
      return null;
    }
  }

  async getAllMedicalRequests(): Promise<IntegratedRequest[]> {
    try {
      const { data, error } = await supabase
        .from('medical_requests')
        .select(`
          id,
          patient_name,
          patient_id,
          hospital_code,
          hospital_name,
          specialty,
          status,
          created_by,
          assigned_to,
          request_date,
          paid_amount,
          notes,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as IntegratedRequest[];
    } catch (error) {
      console.error('Error fetching medical requests:', error);
      return [];
    }
  }

  async updateMedicalRequest(requestId: string, updates: Partial<IntegratedRequest>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('medical_requests')
        .update(updates as any)
        .eq('id', requestId);

      return !error;
    } catch (error) {
      console.error('Error updating medical request:', error);
      return false;
    }
  }

  // Finance Management
  async createFinanceTransaction(transactionData: Omit<FinanceTransaction, 'id'>): Promise<FinanceTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('finance_transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;
      return data as FinanceTransaction;
    } catch (error) {
      console.error('Error creating finance transaction:', error);
      return null;
    }
  }

  async getFinanceTransactions(): Promise<FinanceTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('finance_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return (data || []) as FinanceTransaction[];
    } catch (error) {
      console.error('Error fetching finance transactions:', error);
      return [];
    }
  }

  async updatePaymentStatus(transactionId: string, status: 'pending' | 'paid' | 'failed'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('finance_transactions')
        .update({ payment_status: status })
        .eq('id', transactionId);

      return !error;
    } catch (error) {
      console.error('Error updating payment status:', error);
      return false;
    }
  }

  // Excel Data Integration
  async importExcelData(excelData: any[]): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] };

    for (const row of excelData) {
      try {
        // Get current user for created_by field
        const currentUser = await this.getCurrentUser();
        if (!currentUser) {
          results.errors.push('No authenticated user found');
          continue;
        }

        // Transform Excel row to medical request format
        const requestData: Omit<IntegratedRequest, 'id' | 'created_at' | 'updated_at'> = {
          patient_name: row['Patient Name'] || row["Patient's Name:"] || 'Unknown',
          patient_id: row['Patient ID'] || row["Patient's National ID:"] || '',
          hospital_code: row['Hospital Code'] || 'UNK',
          hospital_name: row['Hospital Name'] || row['Referred Hospital'] || 'Unknown Hospital',
          specialty: row['Specialty'] || 'General',
          status: this.normalizeStatus(row['Status'] || row['Request Status']) as any,
          created_by: currentUser.id,
          request_date: this.parseDate(row['Date'] || row['Request Date']) || new Date().toISOString().split('T')[0],
          paid_amount: this.parseAmount(row['Paid Amount'] || row['Amount']),
          notes: row['Notes'] || ''
        };

        // Create medical request
        const createdRequest = await this.createMedicalRequest(requestData);
        
        if (createdRequest) {
          results.success++;
          
          // If there's payment information, create finance transaction
          if (requestData.paid_amount && requestData.paid_amount > 0) {
            await this.createFinanceTransaction({
              request_id: createdRequest.id,
              amount: requestData.paid_amount,
              payment_status: 'paid',
              transaction_date: new Date().toISOString(),
              created_by: currentUser.id,
              notes: `Imported from Excel for ${requestData.patient_name}`
            });
          }
        } else {
          results.errors.push(`Failed to create request for ${requestData.patient_name}`);
        }
      } catch (error) {
        results.errors.push(`Error processing row: ${error}`);
      }
    }

    return results;
  }

  // Analytics and Reporting
  async getAnalyticsData(filters?: {
    startDate?: string;
    endDate?: string;
    hospital?: string;
    specialty?: string;
    status?: string;
  }): Promise<any> {
    try {
      let query = supabase
        .from('medical_requests')
        .select(`
          id,
          patient_name,
          hospital_code,
          hospital_name,
          specialty,
          status,
          request_date,
          paid_amount,
          created_at
        `);

      // Apply filters
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
        query = query.eq('status', filters.status as any);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;

      // Calculate analytics
      const totalRequests = data?.length || 0;
      const completedRequests = data?.filter(r => r.status === 'completed').length || 0;
      const pendingRequests = data?.filter(r => r.status === 'pending').length || 0;
      const totalRevenue = data?.reduce((sum, r) => sum + (r.paid_amount || 0), 0) || 0;

      // Group by hospital
      const hospitalStats = data?.reduce((acc, request) => {
        const hospital = request.hospital_name || 'Unknown';
        if (!acc[hospital]) {
          acc[hospital] = { total: 0, completed: 0, revenue: 0 };
        }
        acc[hospital].total++;
        if (request.status === 'completed') acc[hospital].completed++;
        acc[hospital].revenue += request.paid_amount || 0;
        return acc;
      }, {} as Record<string, { total: number; completed: number; revenue: number }>);

      // Group by specialty
      const specialtyStats = data?.reduce((acc, request) => {
        const specialty = request.specialty || 'Unknown';
        if (!acc[specialty]) {
          acc[specialty] = { total: 0, completed: 0, revenue: 0 };
        }
        acc[specialty].total++;
        if (request.status === 'completed') acc[specialty].completed++;
        acc[specialty].revenue += request.paid_amount || 0;
        return acc;
      }, {} as Record<string, { total: number; completed: number; revenue: number }>);

      return {
        summary: {
          totalRequests,
          completedRequests,
          pendingRequests,
          completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
          totalRevenue
        },
        hospitalStats,
        specialtyStats,
        rawData: data
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return null;
    }
  }

  // Utility methods
  private normalizeStatus(status: string): 'pending' | 'completed' | 'cancelled' | 'in-progress' | 'rejected' {
    if (!status) return 'pending';
    const lower = status.toLowerCase();
    if (lower.includes('complete') || lower.includes('done')) return 'completed';
    if (lower.includes('progress') || lower.includes('process') || lower.includes('approve')) return 'in-progress';
    if (lower.includes('cancel')) return 'cancelled';
    if (lower.includes('reject')) return 'rejected';
    return 'pending';
  }

  private parseDate(dateValue: any): string | null {
    if (!dateValue) return null;
    
    try {
      // Handle Excel serial numbers
      if (typeof dateValue === 'number' && dateValue > 25000) {
        const date = new Date((dateValue - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
      }
      
      // Handle string dates
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  private parseAmount(amountValue: any): number {
    if (!amountValue) return 0;
    
    try {
      if (typeof amountValue === 'number') return amountValue;
      if (typeof amountValue === 'string') {
        const cleaned = amountValue.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  // Real-time sync between local storage and Supabase
  async syncLocalStorageToSupabase(): Promise<void> {
    try {
      const localRequests = requestStorage.getAllRequests();
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        console.warn('No authenticated user for sync');
        return;
      }

      for (const localRequest of localRequests) {
        // Check if this request already exists in Supabase
        const { data: existing } = await supabase
          .from('medical_requests')
          .select('id')
          .eq('patient_name', localRequest.patientName)
          .eq('request_date', localRequest.dateCreated)
          .single();

        if (!existing) {
          // Create in Supabase
          await this.createMedicalRequest({
            patient_name: localRequest.patientName || 'Unknown',
            patient_id: localRequest.patientNationalId || '',
            hospital_code: localRequest.hospitalMRN || 'UNK',
            hospital_name: localRequest.hospitalName || 'Unknown',
            specialty: localRequest.specialty || 'General',
            status: this.normalizeStatus(localRequest.status || 'pending') as any,
            created_by: currentUser.id,
            request_date: localRequest.dateCreated || new Date().toISOString().split('T')[0],
            paid_amount: 0,
            notes: localRequest.notes || ''
          });
        }
      }
    } catch (error) {
      console.error('Error syncing local storage to Supabase:', error);
    }
  }
}

export const dataIntegrationService = new DataIntegrationService();