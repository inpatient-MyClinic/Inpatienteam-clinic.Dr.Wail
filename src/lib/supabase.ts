import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  category: string
  specialty?: string
  status: 'Active' | 'Inactive'
  field_permissions: Record<string, 'none' | 'view' | 'edit'>
  hospital_privileges: string[]
  created_at: string
  updated_at: string
}

export interface MedicalRequest {
  id: number
  date_created: string
  time_created: string
  patient_name: string
  patient_national_id?: string
  patient_mobile_no?: string
  specialty: string
  doctor_name?: string
  referred_from?: string
  referred_to_hospital?: string
  hospital_mrn?: string
  hospital_name?: string
  service_description: string
  expected_surgery_date?: string
  admission_type?: string
  history?: string
  notes?: string
  status: string
  created_by?: string
  is_delayed: boolean
  notifications: string[]
  payment_status: 'Paid' | 'Not Paid'
  assigned_coordinator?: string
  coordinator_action_time?: string
  delay_cause?: 'doctor' | 'hospital' | 'insurance' | 'patient'
  agreed_surgery_date?: string
  assigned_doctor?: string
  attachments: string[]
  created_at: string
  updated_at: string
}

export interface FinanceTransaction {
  id: string
  patient_name: string
  service_description: string
  hospital: string
  doctor: string
  specialty: string
  amount: string
  status: 'Paid' | 'Pending' | 'Delay Payment'
  transaction_date: string
  created_at: string
  updated_at: string
}

export interface AdminTask {
  id: string
  type: string
  description: string
  user_email?: string
  status: 'Pending' | 'Completed' | 'In Progress' | 'Rejected' | 'Cancelled'
  task_date: string
  priority: 'High' | 'Medium' | 'Low' | 'Emergency'
  specialty?: string
  hospital?: string
  case_coordinator?: string
  request_date?: string
  completion_date?: string
  service_description?: string
  created_at: string
  updated_at: string
}

// Database service functions
export class DatabaseService {
  // Users
  static async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as User[]
  }

  static async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    console.error('DatabaseService.createUser is deprecated. User management now uses local storage via UserManagement component.');
    throw new Error('Database user creation is no longer supported. Use the user management interface instead.');
  }

  static async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as User
  }

  static async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Medical Requests
  static async getMedicalRequests() {
    const { data, error } = await supabase
      .from('medical_requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as MedicalRequest[]
  }

  static async createMedicalRequest(request: Omit<MedicalRequest, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('medical_requests')
      .insert(request)
      .select()
      .single()
    
    if (error) throw error
    return data as MedicalRequest
  }

  static async updateMedicalRequest(id: number, updates: Partial<MedicalRequest>) {
    const { data, error } = await supabase
      .from('medical_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as MedicalRequest
  }

  // Finance Transactions
  static async getFinanceTransactions() {
    const { data, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as FinanceTransaction[]
  }

  static async createFinanceTransaction(transaction: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('finance_transactions')
      .insert(transaction)
      .select()
      .single()
    
    if (error) throw error
    return data as FinanceTransaction
  }

  // Admin Tasks
  static async getAdminTasks() {
    const { data, error } = await supabase
      .from('admin_tasks')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as AdminTask[]
  }

  static async createAdminTask(task: Omit<AdminTask, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('admin_tasks')
      .insert(task)
      .select()
      .single()
    
    if (error) throw error
    return data as AdminTask
  }

  static async updateAdminTask(id: string, updates: Partial<AdminTask>) {
    const { data, error } = await supabase
      .from('admin_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as AdminTask
  }
}