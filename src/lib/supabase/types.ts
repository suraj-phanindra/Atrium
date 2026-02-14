export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          interviewer_id: string;
          candidate_name: string | null;
          challenge_id: string | null;
          rubric_id: string | null;
          sandbox_id: string | null;
          status: string;
          duration_minutes: number;
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          interviewer_id: string;
          candidate_name?: string | null;
          challenge_id?: string | null;
          rubric_id?: string | null;
          sandbox_id?: string | null;
          status?: string;
          duration_minutes?: number;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          interviewer_id?: string;
          candidate_name?: string | null;
          challenge_id?: string | null;
          rubric_id?: string | null;
          sandbox_id?: string | null;
          status?: string;
          duration_minutes?: number;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          difficulty: string;
          sdk_docs_url: string | null;
          sdk_docs_content: string | null;
          job_description_text: string | null;
          resume_text: string | null;
          generated_files: Record<string, string>;
          solution_hints: string | null;
          expected_bugs: any[] | null;
          language: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          difficulty?: string;
          sdk_docs_url?: string | null;
          sdk_docs_content?: string | null;
          job_description_text?: string | null;
          resume_text?: string | null;
          generated_files: Record<string, string>;
          solution_hints?: string | null;
          expected_bugs?: any[] | null;
          language?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          difficulty?: string;
          sdk_docs_url?: string | null;
          sdk_docs_content?: string | null;
          job_description_text?: string | null;
          resume_text?: string | null;
          generated_files?: Record<string, string>;
          solution_hints?: string | null;
          expected_bugs?: any[] | null;
          language?: string;
          created_at?: string;
        };
      };
      rubrics: {
        Row: {
          id: string;
          challenge_id: string | null;
          criteria: any[];
          total_weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id?: string | null;
          criteria: any[];
          total_weight?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenge_id?: string | null;
          criteria?: any[];
          total_weight?: number;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: number;
          session_setup_id: string;
          role: string;
          content: string;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_setup_id: string;
          role: string;
          content: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: number;
          session_setup_id?: string;
          role?: string;
          content?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: number;
          session_id: string;
          timestamp: string;
          event_type: string;
          raw_content: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: number;
          session_id: string;
          timestamp?: string;
          event_type: string;
          raw_content: string;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: number;
          session_id?: string;
          timestamp?: string;
          event_type?: string;
          raw_content?: string;
          metadata?: Record<string, any>;
        };
      };
      insights: {
        Row: {
          id: number;
          session_id: string;
          timestamp: string;
          insight_type: string;
          content: any;
          rubric_criterion: string | null;
        };
        Insert: {
          id?: number;
          session_id: string;
          timestamp?: string;
          insight_type: string;
          content: any;
          rubric_criterion?: string | null;
        };
        Update: {
          id?: number;
          session_id?: string;
          timestamp?: string;
          insight_type?: string;
          content?: any;
          rubric_criterion?: string | null;
        };
      };
    };
  };
};
