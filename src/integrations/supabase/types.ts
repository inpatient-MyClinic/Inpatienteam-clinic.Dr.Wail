export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          accessed_columns: string[] | null
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          record_id: string
          table_name: string
          timestamp: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          accessed_columns?: string[] | null
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          record_id: string
          table_name: string
          timestamp?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_columns?: string[] | null
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          record_id?: string
          table_name?: string
          timestamp?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      excel_upload_batches: {
        Row: {
          column_mappings: Json | null
          error_count: number
          filename: string
          id: string
          processed_rows: number
          processing_log: Json | null
          status: string
          success_count: number
          total_rows: number
          uploaded_at: string
          uploaded_by: string
          warnings_count: number
        }
        Insert: {
          column_mappings?: Json | null
          error_count?: number
          filename: string
          id?: string
          processed_rows?: number
          processing_log?: Json | null
          status?: string
          success_count?: number
          total_rows?: number
          uploaded_at?: string
          uploaded_by: string
          warnings_count?: number
        }
        Update: {
          column_mappings?: Json | null
          error_count?: number
          filename?: string
          id?: string
          processed_rows?: number
          processing_log?: Json | null
          status?: string
          success_count?: number
          total_rows?: number
          uploaded_at?: string
          uploaded_by?: string
          warnings_count?: number
        }
        Relationships: []
      }
      finance_analytics_data: {
        Row: {
          category: string
          created_at: string
          created_by: string
          data: Json
          id: string
          row_id: string
          type: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string
          data?: Json
          id?: string
          row_id: string
          type: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          data?: Json
          id?: string
          row_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          amount: number | null
          created_at: string | null
          created_by: string
          currency: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          request_id: string | null
          transaction_date: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          created_by: string
          currency?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          request_id?: string | null
          transaction_date?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          created_by?: string
          currency?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          request_id?: string | null
          transaction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "unified_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      medical_requests: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          branch_code: string | null
          created_at: string | null
          created_by: string
          hospital_code: string
          hospital_name: string | null
          id: string
          loss_reason: string | null
          medical_condition: string
          notes: string | null
          paid_amount: number | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          request_date: string | null
          specialty: string
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          branch_code?: string | null
          created_at?: string | null
          created_by: string
          hospital_code: string
          hospital_name?: string | null
          id?: string
          loss_reason?: string | null
          medical_condition: string
          notes?: string | null
          paid_amount?: number | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          request_date?: string | null
          specialty: string
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          branch_code?: string | null
          created_at?: string | null
          created_by?: string
          hospital_code?: string
          hospital_name?: string | null
          id?: string
          loss_reason?: string | null
          medical_condition?: string
          notes?: string | null
          paid_amount?: number | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          request_date?: string | null
          specialty?: string
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          priority: string | null
          recipient_id: string | null
          recipient_role: Database["public"]["Enums"]["user_role"] | null
          request_id: string | null
          sender_id: string
          subject: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          priority?: string | null
          recipient_id?: string | null
          recipient_role?: Database["public"]["Enums"]["user_role"] | null
          request_id?: string | null
          sender_id: string
          subject: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          priority?: string | null
          recipient_id?: string | null
          recipient_role?: Database["public"]["Enums"]["user_role"] | null
          request_id?: string | null
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "medical_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          code_hash: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code_hash: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code_hash?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      password_history: {
        Row: {
          created_at: string | null
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      pre_approved_emails: {
        Row: {
          added_at: string
          added_by: string | null
          email: string
          id: string
          notes: string | null
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          email: string
          id?: string
          notes?: string | null
        }
        Update: {
          added_at?: string
          added_by?: string | null
          email?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          department: string | null
          email: string
          force_password_change: boolean | null
          full_name: string | null
          hospital_code: string | null
          id: string
          last_login: string | null
          last_password_change: string | null
          must_change_password: boolean | null
          password_change_required_at: string | null
          password_changed_at: string | null
          password_expires_at: string | null
          permissions: Json | null
          phone: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
          specialty: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          force_password_change?: boolean | null
          full_name?: string | null
          hospital_code?: string | null
          id: string
          last_login?: string | null
          last_password_change?: string | null
          must_change_password?: boolean | null
          password_change_required_at?: string | null
          password_changed_at?: string | null
          password_expires_at?: string | null
          permissions?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          specialty?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          force_password_change?: boolean | null
          full_name?: string | null
          hospital_code?: string | null
          id?: string
          last_login?: string | null
          last_password_change?: string | null
          must_change_password?: boolean | null
          password_change_required_at?: string | null
          password_changed_at?: string | null
          password_expires_at?: string | null
          permissions?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          specialty?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      request_history: {
        Row: {
          action: string
          changed_by: string
          created_at: string | null
          id: string
          new_status: Database["public"]["Enums"]["request_status"] | null
          notes: string | null
          old_status: Database["public"]["Enums"]["request_status"] | null
          request_id: string
        }
        Insert: {
          action: string
          changed_by: string
          created_at?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["request_status"] | null
          notes?: string | null
          old_status?: Database["public"]["Enums"]["request_status"] | null
          request_id: string
        }
        Update: {
          action?: string
          changed_by?: string
          created_at?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["request_status"] | null
          notes?: string | null
          old_status?: Database["public"]["Enums"]["request_status"] | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "medical_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_requests: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          branch_code: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          excel_row_number: number | null
          excel_upload_id: string | null
          hospital_code: string
          hospital_name: string | null
          id: string
          loss_reason: string | null
          medical_condition: string
          notes: string | null
          paid_amount: number | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          request_date: string
          source_type: string
          specialty: string
          status: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          branch_code?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          excel_row_number?: number | null
          excel_upload_id?: string | null
          hospital_code: string
          hospital_name?: string | null
          id?: string
          loss_reason?: string | null
          medical_condition: string
          notes?: string | null
          paid_amount?: number | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          request_date?: string
          source_type?: string
          specialty: string
          status?: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          branch_code?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          excel_row_number?: number | null
          excel_upload_id?: string | null
          hospital_code?: string
          hospital_name?: string | null
          id?: string
          loss_reason?: string | null
          medical_condition?: string
          notes?: string | null
          paid_amount?: number | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          request_date?: string
          source_type?: string
          specialty?: string
          status?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_reset_password: {
        Args: { admin_email: string; new_password: string }
        Returns: string
      }
      analyze_excel_cases_monthly: {
        Args: { p_month: number; p_year: number }
        Returns: {
          branch_breakdown: Json
          hospital_breakdown: Json
          specialty_breakdown: Json
          status_breakdown: Json
          total_cases: number
        }[]
      }
      analyze_excel_data_by_month: {
        Args: { target_month: number; target_year: number }
        Returns: {
          branch_breakdown: Json
          raw_data: Json
          status_breakdown: Json
          total_cases: number
        }[]
      }
      approve_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      can_access_patient_data: {
        Args: { patient_request_id: string; required_access_level?: string }
        Returns: boolean
      }
      check_password_similarity: {
        Args: { new_password_hash: string; user_id_param: string }
        Returns: boolean
      }
      cleanup_old_passwords: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_otp: {
        Args: { user_email: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_monthly_branch_stats: {
        Args: { target_month: number; target_year: number }
        Returns: {
          branch_code: string
          conversion_rate: number
          done_cases: number
          pending_cases: number
          total_cases: number
        }[]
      }
      get_monthly_conversion_trends: {
        Args: { target_year: number }
        Returns: {
          completed_cases: number
          conversion_rate: number
          month_name: string
          month_num: number
          revenue_amount: number
          total_cases: number
        }[]
      }
      get_monthly_dashboard_data: {
        Args: { target_month: number; target_year: number }
        Returns: Json
      }
      get_monthly_hospital_stats: {
        Args: { target_month: number; target_year: number }
        Returns: {
          done_cases: number
          hospital_code: string
          hospital_name: string
          pending_cases: number
          specialty_breakdown: Json
          total_cases: number
        }[]
      }
      get_monthly_top_specialties: {
        Args: { target_month: number; target_year: number }
        Returns: {
          case_count: number
          done_count: number
          specialty: string
          success_rate: number
        }[]
      }
      get_sia_setting: {
        Args: { setting_key: string; setting_scope?: string }
        Returns: Json
      }
      get_users_by_role: {
        Args: { target_role?: Database["public"]["Enums"]["user_role"] }
        Returns: {
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      health_ping: {
        Args: Record<PropertyKey, never>
        Returns: {
          db: string
          now_utc: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_email: {
        Args: { email_address: string }
        Returns: boolean
      }
      is_email_allowed_to_register: {
        Args: { check_email: string }
        Returns: boolean
      }
      is_password_change_required: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      is_password_expired: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      log_sensitive_data_access: {
        Args: {
          accessed_columns?: string[]
          action: string
          record_id: string
          table_name: string
        }
        Returns: undefined
      }
      mask_patient_data: {
        Args: {
          patient_email: string
          patient_name: string
          patient_phone: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Json
      }
      norm_status: {
        Args: { s: string }
        Returns: string
      }
      norm_text: {
        Args: { t: string }
        Returns: string
      }
      norm_upper: {
        Args: { t: string }
        Returns: string
      }
      parse_excel_date: {
        Args: { raw: string }
        Returns: string
      }
      search_users: {
        Args: { search_term: string }
        Returns: {
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      update_sia_setting: {
        Args: {
          setting_key: string
          setting_scope?: string
          setting_value: Json
        }
        Returns: undefined
      }
      verify_otp: {
        Args: { submitted_code: string; user_email: string }
        Returns: boolean
      }
    }
    Enums: {
      request_status:
        | "pending"
        | "in-progress"
        | "completed"
        | "cancelled"
        | "rejected"
      user_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "hospital"
        | "case-coordinator"
        | "finance"
        | "customer-care"
      user_status: "pending" | "active" | "inactive" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      request_status: [
        "pending",
        "in-progress",
        "completed",
        "cancelled",
        "rejected",
      ],
      user_role: [
        "admin",
        "doctor",
        "nurse",
        "hospital",
        "case-coordinator",
        "finance",
        "customer-care",
      ],
      user_status: ["pending", "active", "inactive", "suspended"],
    },
  },
} as const
