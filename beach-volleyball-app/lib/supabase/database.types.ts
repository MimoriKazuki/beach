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
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'organizer' | 'supporter' | 'participant'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'admin' | 'organizer' | 'supporter' | 'participant'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'admin' | 'organizer' | 'supporter' | 'participant'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          name: string
          type: 'tournament' | 'practice'
          event_date: string
          venue: string
          rule_set: 'rally_point' | 'service_match' | null
          organizer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'tournament' | 'practice'
          event_date: string
          venue: string
          rule_set?: 'rally_point' | 'service_match' | null
          organizer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'tournament' | 'practice'
          event_date?: string
          venue?: string
          rule_set?: 'rally_point' | 'service_match' | null
          organizer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      event_participants: {
        Row: {
          event_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          event_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          event_id?: string
          user_id?: string
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          captain_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          captain_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          captain_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      tournament_entries: {
        Row: {
          event_id: string
          team_id: string
          created_at: string
        }
        Insert: {
          event_id: string
          team_id: string
          created_at?: string
        }
        Update: {
          event_id?: string
          team_id?: string
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          event_id: string
          round_name: string
          team_a_id: string
          team_b_id: string
          winner_team_id: string | null
          status: 'scheduled' | 'live' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          round_name: string
          team_a_id: string
          team_b_id: string
          winner_team_id?: string | null
          status?: 'scheduled' | 'live' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          round_name?: string
          team_a_id?: string
          team_b_id?: string
          winner_team_id?: string | null
          status?: 'scheduled' | 'live' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      sets: {
        Row: {
          id: string
          match_id: string
          set_number: number
          team_a_score: number
          team_b_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          set_number: number
          team_a_score: number
          team_b_score: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          set_number?: number
          team_a_score?: number
          team_b_score?: number
          created_at?: string
          updated_at?: string
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
    }
  }
}