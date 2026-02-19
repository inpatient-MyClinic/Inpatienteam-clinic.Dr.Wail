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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      billing_items: {
        Row: {
          agreed_split_amount: number
          created_at: string
          discount: number
          doctor_name: string
          doctor_payment_amount: number | null
          doctor_split_percentage: number | null
          finance_notes: string | null
          flag_reason: string | null
          gross_amount: number
          hospital_price: number | null
          id: string
          insurance_share: number
          justification: string | null
          net_amount: number
          patient_id: string | null
          patient_name: string
          patient_share: number
          procedure_date: string
          procedure_name: string
          specialty: string | null
          statement_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agreed_split_amount?: number
          created_at?: string
          discount?: number
          doctor_name: string
          doctor_payment_amount?: number | null
          doctor_split_percentage?: number | null
          finance_notes?: string | null
          flag_reason?: string | null
          gross_amount?: number
          hospital_price?: number | null
          id?: string
          insurance_share?: number
          justification?: string | null
          net_amount?: number
          patient_id?: string | null
          patient_name: string
          patient_share?: number
          procedure_date: string
          procedure_name: string
          specialty?: string | null
          statement_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agreed_split_amount?: number
          created_at?: string
          discount?: number
          doctor_name?: string
          doctor_payment_amount?: number | null
          doctor_split_percentage?: number | null
          finance_notes?: string | null
          flag_reason?: string | null
          gross_amount?: number
          hospital_price?: number | null
          id?: string
          insurance_share?: number
          justification?: string | null
          net_amount?: number
          patient_id?: string | null
          patient_name?: string
          patient_share?: number
          procedure_date?: string
          procedure_name?: string
          specialty?: string | null
          statement_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_items_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "billing_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_statements: {
        Row: {
          created_at: string
          hospital_name: string
          id: string
          month: string
          notes: string | null
          status: string
          submitted_at: string
          submitted_by: string | null
          total_amount: number
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          hospital_name: string
          id?: string
          month: string
          notes?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string | null
          total_amount?: number
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          hospital_name?: string
          id?: string
          month?: string
          notes?: string | null
          status?: string
          submitted_at?: string
          submitted_by?: string | null
          total_amount?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      doctor_payment_splits: {
        Row: {
          created_at: string
          created_by: string | null
          doctor_name: string
          doctor_type: string
          id: string
          split_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          doctor_name: string
          doctor_type?: string
          id?: string
          split_percentage?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          doctor_name?: string
          doctor_type?: string
          id?: string
          split_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      finance_kpi_settings: {
        Row: {
          created_at: string
          id: string
          kpi_label: string
          kpi_name: string
          target_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kpi_label: string
          kpi_name: string
          target_days: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kpi_label?: string
          kpi_name?: string
          target_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          content: string
          error_message: string | null
          id: string
          recipient_name: string | null
          recipient_phone: string | null
          recipient_role: string | null
          request_id: string | null
          sent_at: string
          sent_by: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          content: string
          error_message?: string | null
          id?: string
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_role?: string | null
          request_id?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          content?: string
          error_message?: string | null
          id?: string
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_role?: string | null
          request_id?: string | null
          sent_at?: string
          sent_by?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          ai_generated_content: string | null
          approval_note: string | null
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_by: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          target: Database["public"]["Enums"]["template_target"]
          target_doctor_id: string | null
          target_specialty: string | null
          title: string
          trigger_event: Database["public"]["Enums"]["notification_trigger"]
          updated_at: string
        }
        Insert: {
          ai_generated_content?: string | null
          approval_note?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_by?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          target?: Database["public"]["Enums"]["template_target"]
          target_doctor_id?: string | null
          target_specialty?: string | null
          title: string
          trigger_event?: Database["public"]["Enums"]["notification_trigger"]
          updated_at?: string
        }
        Update: {
          ai_generated_content?: string | null
          approval_note?: string | null
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_by?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          target?: Database["public"]["Enums"]["template_target"]
          target_doctor_id?: string | null
          target_specialty?: string | null
          title?: string
          trigger_event?: Database["public"]["Enums"]["notification_trigger"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          hospital_code: string | null
          id: string
          must_change_password: boolean | null
          phone: string | null
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          hospital_code?: string | null
          id: string
          must_change_password?: boolean | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          hospital_code?: string | null
          id?: string
          must_change_password?: boolean | null
          phone?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      template_approvals: {
        Row: {
          created_at: string
          id: string
          new_content: string
          new_title: string | null
          old_content: string | null
          requested_by: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
          template_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_content: string
          new_title?: string | null
          old_content?: string | null
          requested_by: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          template_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_content?: string
          new_title?: string | null
          old_content?: string | null
          requested_by?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_approvals_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_approvers: {
        Row: {
          created_at: string
          granted_by: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vat_invoices: {
        Row: {
          created_at: string
          hospital_name: string
          id: string
          invoice_number: string
          issued_at: string
          month: string
          paid_at: string | null
          sent_at: string | null
          statement_id: string
          status: string
          subtotal: number
          total: number
          vat_amount: number
          vat_rate: number
          year: number
        }
        Insert: {
          created_at?: string
          hospital_name: string
          id?: string
          invoice_number: string
          issued_at?: string
          month: string
          paid_at?: string | null
          sent_at?: string | null
          statement_id: string
          status?: string
          subtotal?: number
          total?: number
          vat_amount?: number
          vat_rate?: number
          year: number
        }
        Update: {
          created_at?: string
          hospital_name?: string
          id?: string
          invoice_number?: string
          issued_at?: string
          month?: string
          paid_at?: string | null
          sent_at?: string | null
          statement_id?: string
          status?: string
          subtotal?: number
          total?: number
          vat_amount?: number
          vat_rate?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vat_invoices_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "billing_statements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "nurse"
        | "hospital"
        | "case-coordinator"
        | "finance"
        | "customer-care"
      approval_status: "pending" | "approved" | "rejected"
      notification_channel: "sms" | "whatsapp" | "both"
      notification_trigger:
        | "request_created"
        | "request_approved"
        | "anesthesia_date_set"
        | "surgery_date_agreed"
        | "manual"
      template_target: "patient" | "doctor" | "coordinator" | "all"
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
      app_role: [
        "admin",
        "doctor",
        "nurse",
        "hospital",
        "case-coordinator",
        "finance",
        "customer-care",
      ],
      approval_status: ["pending", "approved", "rejected"],
      notification_channel: ["sms", "whatsapp", "both"],
      notification_trigger: [
        "request_created",
        "request_approved",
        "anesthesia_date_set",
        "surgery_date_agreed",
        "manual",
      ],
      template_target: ["patient", "doctor", "coordinator", "all"],
    },
  },
} as const
