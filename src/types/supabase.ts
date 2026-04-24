// Manually maintained until you run:
// npx supabase gen types typescript --project-id <id> > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          source_type: "zip" | "json";
          followers_count: number;
          following_count: number;
          not_following_back_count: number;
          not_followed_back_count: number;
          not_following_back: Json;
          not_followed_back: Json;
          drive_file_id: string | null;
          drive_file_name: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          source_type: "zip" | "json";
          followers_count: number;
          following_count: number;
          not_following_back_count: number;
          not_followed_back_count: number;
          not_following_back: Json;
          not_followed_back: Json;
          drive_file_id?: string | null;
          drive_file_name?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["analyses"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
