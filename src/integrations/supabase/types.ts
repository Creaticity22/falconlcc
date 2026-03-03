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
      ai_usage: {
        Row: {
          created_at: string
          id: string
          last_question_at: string | null
          questions_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_question_at?: string | null
          questions_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_question_at?: string | null
          questions_count?: number
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          categories: Json
          created_at: string
          id: string
          month: string
          monthly_income: number
          updated_at: string
          user_id: string
        }
        Insert: {
          categories?: Json
          created_at?: string
          id?: string
          month: string
          monthly_income?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          categories?: Json
          created_at?: string
          id?: string
          month?: string
          monthly_income?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          expense_date: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          expense_date?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gamification: {
        Row: {
          badges: Json
          created_at: string
          id: string
          last_active_date: string | null
          streak_days: number
          updated_at: string
          user_id: string
          xp_points: number
        }
        Insert: {
          badges?: Json
          created_at?: string
          id?: string
          last_active_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id: string
          xp_points?: number
        }
        Update: {
          badges?: Json
          created_at?: string
          id?: string
          last_active_date?: string | null
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp_points?: number
        }
        Relationships: []
      }
      goal_templates: {
        Row: {
          code: string
          created_at: string
          default_topic: string
          description: string
          id: string
          lesson_id: string | null
          name: string
          resource_topics: string[]
          suggested_max_amount: number
          suggested_min_amount: number
          suggested_timeframe_months: number
        }
        Insert: {
          code: string
          created_at?: string
          default_topic?: string
          description: string
          id?: string
          lesson_id?: string | null
          name: string
          resource_topics?: string[]
          suggested_max_amount?: number
          suggested_min_amount?: number
          suggested_timeframe_months?: number
        }
        Update: {
          code?: string
          created_at?: string
          default_topic?: string
          description?: string
          id?: string
          lesson_id?: string | null
          name?: string
          resource_topics?: string[]
          suggested_max_amount?: number
          suggested_min_amount?: number
          suggested_timeframe_months?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      money_diary_entries: {
        Row: {
          created_at: string
          id: string
          mood_emoji: string
          mood_score: number
          note: string | null
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_emoji?: string
          mood_score: number
          note?: string | null
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_emoji?: string
          mood_score?: number
          note?: string | null
          user_id?: string
          week_start_date?: string
        }
        Relationships: []
      }
      money_wins: {
        Row: {
          created_at: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string | null
          created_at: string
          first_name: string | null
          id: string
          income_band: string | null
          money_goal: string | null
          onboarding_completed: boolean | null
          saving_for: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_range?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          income_band?: string | null
          money_goal?: string | null
          onboarding_completed?: boolean | null
          saving_for?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_range?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          income_band?: string | null
          money_goal?: string | null
          onboarding_completed?: boolean | null
          saving_for?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          age_max: number | null
          age_min: number | null
          created_at: string
          description: string
          id: string
          is_video: boolean
          source_name: string
          title: string
          topic: string
          url: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          created_at?: string
          description: string
          id?: string
          is_video?: boolean
          source_name: string
          title: string
          topic: string
          url: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          created_at?: string
          description?: string
          id?: string
          is_video?: boolean
          source_name?: string
          title?: string
          topic?: string
          url?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          created_at: string
          current_amount: number
          description: string | null
          id: string
          name: string
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          name: string
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          description?: string | null
          id?: string
          name?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sponsor_relationships: {
        Row: {
          created_at: string
          goal_id: string | null
          id: string
          invite_code: string | null
          match_rate: number | null
          max_match_amount: number | null
          sponsor_user_id: string | null
          status: string | null
          young_person_user_id: string
        }
        Insert: {
          created_at?: string
          goal_id?: string | null
          id?: string
          invite_code?: string | null
          match_rate?: number | null
          max_match_amount?: number | null
          sponsor_user_id?: string | null
          status?: string | null
          young_person_user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string | null
          id?: string
          invite_code?: string | null
          match_rate?: number | null
          max_match_amount?: number | null
          sponsor_user_id?: string | null
          status?: string | null
          young_person_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_relationships_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "young_person" | "sponsor"
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
      app_role: ["young_person", "sponsor"],
    },
  },
} as const
