export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          bio: string | null
          avatar_url: string | null
          role: 'admin' | 'organizer' | 'supporter' | 'participant'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          bio?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'organizer' | 'supporter' | 'participant'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          bio?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'organizer' | 'supporter' | 'participant'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          name: string
          event_type: 'tournament' | 'practice'
          event_date: string
          start_time: string
          end_time: string
          venue: string
          max_participants: number
          entry_fee: number | null
          rule_set: 'rally_point' | 'service_match'
          net_height: number | null
          description: string | null
          status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          event_type: 'tournament' | 'practice'
          event_date: string
          start_time: string
          end_time?: string
          venue: string
          max_participants: number
          entry_fee?: number | null
          rule_set?: 'rally_point' | 'service_match'
          net_height?: number | null
          description?: string | null
          status?: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          event_type?: 'tournament' | 'practice'
          event_date?: string
          start_time?: string
          end_time?: string
          venue?: string
          max_participants?: number
          entry_fee?: number | null
          rule_set?: 'rally_point' | 'service_match'
          net_height?: number | null
          description?: string | null
          status?: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_participants: {
        Row: {
          id: string
          event_id: string
          user_id: string
          team_id: string | null
          registration_status: 'pending' | 'confirmed' | 'cancelled'
          registered_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          team_id?: string | null
          registration_status?: 'pending' | 'confirmed' | 'cancelled'
          registered_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          team_id?: string | null
          registration_status?: 'pending' | 'confirmed' | 'cancelled'
          registered_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          event_id: string
          name: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          created_by?: string
          created_at?: string
        }
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
          position_number: number
        }
        Insert: {
          team_id: string
          user_id: string
          position_number: number
        }
        Update: {
          team_id?: string
          user_id?: string
          position_number?: number
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
      event_type: 'tournament' | 'practice'
      rule_set_type: 'rally_point' | 'service_match'
      user_role: 'admin' | 'organizer' | 'supporter' | 'participant'
      event_status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
      registration_status: 'pending' | 'confirmed' | 'cancelled'
    }
  }
}