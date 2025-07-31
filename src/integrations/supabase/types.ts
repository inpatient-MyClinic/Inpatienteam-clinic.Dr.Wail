export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
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
            referencedRelation: "medical_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_requests: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          created_at: string | null
          created_by: string
          hospital_code: string
          id: string
          medical_condition: string
          notes: string | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          specialty: string
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          created_by: string
          hospital_code: string
          id?: string
          medical_condition: string
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          specialty: string
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          created_at?: string | null
          created_by?: string
          hospital_code?: string
          id?: string
          medical_condition?: string
          notes?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
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
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          email: string
          full_name: string | null
          hospital_code: string | null
          id: string
          must_change_password: boolean | null
          password_change_required_at: string | null
          password_changed_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialty: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          hospital_code?: string | null
          id: string
          must_change_password?: boolean | null
          password_change_required_at?: string | null
          password_changed_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialty?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          hospital_code?: string | null
          id?: string
          must_change_password?: boolean | null
          password_change_required_at?: string | null
          password_changed_at?: string | null
          phone?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      check_password_similarity: {
        Args: { user_id_param: string; new_password_hash: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_users_by_role: {
        Args: { target_role?: Database["public"]["Enums"]["user_role"] }
        Returns: {
          id: string
          full_name: string
          email: string
          role: Database["public"]["Enums"]["user_role"]
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
      is_password_change_required: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      search_users: {
        Args: { search_term: string }
        Returns: {
          id: string
          full_name: string
          email: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
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
