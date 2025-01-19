export interface Database {
  public: {
    Tables: {
      banned_websites: {
        Row: {
          id: number
          domain: string
          location: string
          created_at: string
        }
        Insert: {
          domain: string
          location: string
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: number
          user_id: string
          blocked_domains: string[]
          override_domains: string[]
          created_at: string
        }
        Insert: {
          user_id: string
          blocked_domains?: string[]
          override_domains?: string[]
          created_at?: string
        }
      }
    }
  }
}