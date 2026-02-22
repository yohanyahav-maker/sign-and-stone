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
      approvals: {
        Row: {
          change_order_id: string
          client_name: string
          decision: string
          id: string
          ip_address: string | null
          pdf_url: string | null
          rejection_reason: string | null
          signed_at: string
          user_agent: string | null
        }
        Insert: {
          change_order_id: string
          client_name: string
          decision: string
          id?: string
          ip_address?: string | null
          pdf_url?: string | null
          rejection_reason?: string | null
          signed_at?: string
          user_agent?: string | null
        }
        Update: {
          change_order_id?: string
          client_name?: string
          decision?: string
          id?: string
          ip_address?: string | null
          pdf_url?: string | null
          rejection_reason?: string | null
          signed_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          change_order_id: string
          created_at: string
          file_name: string
          file_size_bytes: number | null
          file_type: Database["public"]["Enums"]["attachment_type"]
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          change_order_id: string
          created_at?: string
          file_name: string
          file_size_bytes?: number | null
          file_type?: Database["public"]["Enums"]["attachment_type"]
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          change_order_id?: string
          created_at?: string
          file_name?: string
          file_size_bytes?: number | null
          file_type?: Database["public"]["Enums"]["attachment_type"]
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          id: string
          new_value: Json | null
          old_value: Json | null
          performed_at: string
          performed_by: string | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          performed_at?: string
          performed_by?: string | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          performed_at?: string
          performed_by?: string | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      change_orders: {
        Row: {
          category: Database["public"]["Enums"]["change_order_category"]
          created_at: string
          description: string | null
          id: string
          impact_days: number | null
          include_vat: boolean
          portal_token_expires_at: string | null
          portal_token_hash: string | null
          portal_token_used: boolean
          price_amount: number | null
          project_id: string
          status: Database["public"]["Enums"]["change_order_status"]
          title: string
          updated_at: string
          user_id: string
          vat_rate: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["change_order_category"]
          created_at?: string
          description?: string | null
          id?: string
          impact_days?: number | null
          include_vat?: boolean
          portal_token_expires_at?: string | null
          portal_token_hash?: string | null
          portal_token_used?: boolean
          price_amount?: number | null
          project_id: string
          status?: Database["public"]["Enums"]["change_order_status"]
          title: string
          updated_at?: string
          user_id: string
          vat_rate?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["change_order_category"]
          created_at?: string
          description?: string | null
          id?: string
          impact_days?: number | null
          include_vat?: boolean
          portal_token_expires_at?: string | null
          portal_token_hash?: string | null
          portal_token_used?: boolean
          price_amount?: number | null
          project_id?: string
          status?: Database["public"]["Enums"]["change_order_status"]
          title?: string
          updated_at?: string
          user_id?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          logo_url: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          client_portal_enabled: boolean
          created_at: string
          id: string
          is_archived: boolean
          name: string
          project_type: Database["public"]["Enums"]["project_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_portal_enabled?: boolean
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          project_type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_portal_enabled?: boolean
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          project_type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          monthly_change_limit: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          project_limit: number
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_change_limit?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          project_limit?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_change_limit?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          project_limit?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "contractor" | "viewer"
      attachment_type: "image" | "video" | "pdf" | "other"
      change_order_category:
        | "structural"
        | "electrical"
        | "plumbing"
        | "finishing"
        | "hvac"
        | "flooring"
        | "painting"
        | "landscaping"
        | "safety"
        | "other"
      change_order_status:
        | "draft"
        | "priced"
        | "sent"
        | "approved"
        | "rejected"
        | "canceled"
      project_type:
        | "residential"
        | "commercial"
        | "renovation"
        | "infrastructure"
        | "other"
      subscription_plan: "basic" | "pro"
      subscription_status:
        | "trial"
        | "active"
        | "past_due"
        | "canceled"
        | "expired"
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
      app_role: ["admin", "contractor", "viewer"],
      attachment_type: ["image", "video", "pdf", "other"],
      change_order_category: [
        "structural",
        "electrical",
        "plumbing",
        "finishing",
        "hvac",
        "flooring",
        "painting",
        "landscaping",
        "safety",
        "other",
      ],
      change_order_status: [
        "draft",
        "priced",
        "sent",
        "approved",
        "rejected",
        "canceled",
      ],
      project_type: [
        "residential",
        "commercial",
        "renovation",
        "infrastructure",
        "other",
      ],
      subscription_plan: ["basic", "pro"],
      subscription_status: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "expired",
      ],
    },
  },
} as const
