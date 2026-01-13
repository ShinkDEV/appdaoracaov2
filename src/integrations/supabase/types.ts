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
      banned_ips: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          reason?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          mobile_image_url: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          mobile_image_url?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          mobile_image_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          is_anonymous: boolean | null
          is_deleted: boolean | null
          is_pinned: boolean | null
          theme_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          theme_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          is_anonymous?: boolean | null
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          theme_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_requests_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "prayer_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_themes: {
        Row: {
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ban_reason: string | null
          banned: boolean | null
          banned_at: string | null
          created_at: string
          display_name: string | null
          id: string
          photo_url: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          ban_reason?: string | null
          banned?: boolean | null
          banned_at?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          photo_url?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          ban_reason?: string | null
          banned?: boolean | null
          banned_at?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          photo_url?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      user_ip_tracking: {
        Row: {
          id: string
          ip_address: string
          recorded_at: string
          user_id: string
        }
        Insert: {
          id?: string
          ip_address: string
          recorded_at?: string
          user_id: string
        }
        Update: {
          id?: string
          ip_address?: string
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_prayers: {
        Row: {
          created_at: string
          id: string
          prayer_request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prayer_request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prayer_request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_prayers_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "prayer_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_prayers_prayer_request_id_fkey"
            columns: ["prayer_request_id"]
            isOneToOne: false
            referencedRelation: "public_prayer_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_prayer_requests: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_anonymous: boolean | null
          is_pinned: boolean | null
          theme_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          theme_id?: string | null
          title?: string | null
          user_id?: never
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          is_pinned?: boolean | null
          theme_id?: string | null
          title?: string | null
          user_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "prayer_requests_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "prayer_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          display_name: string | null
          id: string | null
          photo_url: string | null
          verified: boolean | null
        }
        Insert: {
          display_name?: string | null
          id?: string | null
          photo_url?: string | null
          verified?: boolean | null
        }
        Update: {
          display_name?: string | null
          id?: string | null
          photo_url?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_prayer_counts: {
        Args: { prayer_ids: string[] }
        Returns: {
          count: number
          prayer_request_id: string
        }[]
      }
      get_public_prayer_requests: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_theme_id?: string
        }
        Returns: {
          author_display_name: string
          author_photo_url: string
          author_verified: boolean
          created_at: string
          description: string
          id: string
          is_anonymous: boolean
          is_pinned: boolean
          theme_id: string
          title: string
          user_id: string
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
