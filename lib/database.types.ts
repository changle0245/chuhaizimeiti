export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          is_admin: boolean
          daily_usage_count: number
          last_usage_reset: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          is_admin?: boolean
          daily_usage_count?: number
          last_usage_reset?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          is_admin?: boolean
          daily_usage_count?: number
          last_usage_reset?: string
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          service_name: string
          api_key: string
          is_active: boolean
          last_tested_at: string | null
          test_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_name: string
          api_key: string
          is_active?: boolean
          last_tested_at?: string | null
          test_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_name?: string
          api_key?: string
          is_active?: boolean
          last_tested_at?: string | null
          test_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_library: {
        Row: {
          id: string
          user_id: string
          product_name: string
          category: string
          description: string
          keywords: string[]
          target_market: string
          embedding: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_name: string
          category: string
          description: string
          keywords?: string[]
          target_market?: string
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_name?: string
          category?: string
          description?: string
          keywords?: string[]
          target_market?: string
          embedding?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          original_image_url: string
          processed_image_url: string | null
          background_removed_url: string | null
          video_url: string | null
          copy_english: string | null
          copy_arabic: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          settings: Json
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id?: string | null
          original_image_url: string
          processed_image_url?: string | null
          background_removed_url?: string | null
          video_url?: string | null
          copy_english?: string | null
          copy_arabic?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          settings?: Json
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string | null
          original_image_url?: string
          processed_image_url?: string | null
          background_removed_url?: string | null
          video_url?: string | null
          copy_english?: string | null
          copy_arabic?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          settings?: Json
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          project_id: string
          action_type: string
          api_calls: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          action_type: string
          api_calls?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          action_type?: string
          api_calls?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
