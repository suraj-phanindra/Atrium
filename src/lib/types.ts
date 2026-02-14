// Session types
export interface Session {
  id: string;
  interviewer_id: string;
  candidate_name: string | null;
  challenge_id: string | null;
  rubric_id: string | null;
  sandbox_id: string | null;
  status: 'pending' | 'active' | 'completed';
  duration_minutes: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sdk_docs_url: string | null;
  sdk_docs_content: string | null;
  job_description_text: string | null;
  resume_text: string | null;
  generated_files: Record<string, string>;
  solution_hints: string | null;
  expected_bugs: ExpectedBug[] | null;
  language: string;
  created_at: string;
}

export interface ExpectedBug {
  description: string;
  file: string;
  hint: string;
}

export interface RubricCriterion {
  name: string;
  weight: number;
  description: string;
  positive_signals: string[];
  negative_signals: string[];
}

export interface Rubric {
  id: string;
  challenge_id: string | null;
  criteria: RubricCriterion[];
  total_weight: number;
  created_at: string;
}

export interface Message {
  id?: number;
  role: 'user' | 'assistant' | 'tool_use' | 'tool_result';
  content: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'job_description' | 'resume';
  size: number;
  uploaded: boolean;
}

export interface Event {
  id: number;
  session_id: string;
  timestamp: string;
  event_type: 'claude_code_event' | 'terminal_output' | 'file_change' | 'command_executed' | 'session_start' | 'session_end';
  raw_content: string;
  metadata: Record<string, any>;
}

export interface Insight {
  id: number;
  session_id: string;
  timestamp: string;
  insight_type: 'reasoning_update' | 'signal' | 'copilot_question' | 'phase_change' | 'summary';
  content: ReasoningUpdateContent | SignalContent | CopilotQuestionContent | PhaseChangeContent | SummaryContent;
  rubric_criterion: string | null;
}

// Insight content types
export interface ReasoningUpdateContent {
  summary: string;
  current_hypothesis: string | null;
  approach_quality: 'methodical' | 'exploratory' | 'unfocused';
  ai_usage_pattern: string;
  phase: 'reading' | 'debugging' | 'writing' | 'testing' | 'using_ai';
  rubric_relevance: {
    criterion: string;
    assessment: string;
  };
}

export interface SignalContent {
  signal_type: 'green' | 'yellow' | 'red';
  category: string;
  title: string;
  description: string;
  evidence: string;
  rubric_criterion: string;
  rubric_weight: number;
}

export interface CopilotQuestionContent {
  question: string;
  context: string;
  priority: 'high' | 'medium' | 'low';
  rubric_criterion: string;
  rubric_weight: number;
}

export interface PhaseChangeContent {
  from_phase: string;
  to_phase: string;
  trigger: string;
  time_in_previous_phase_seconds: number;
}

export interface RubricScore {
  criterion: string;
  weight: number;
  score: number;
  notes: string;
}

export interface SummaryContent {
  overall_score: number;
  rubric_scores: RubricScore[];
  strengths: string[];
  concerns: string[];
  ai_usage_summary: {
    total_prompts: number;
    independence_score: number;
    pattern: string;
  };
  bugs_found: string[];
  bugs_missed: string[];
  recommended_follow_ups: string[];
  hiring_signal: 'strong_yes' | 'yes' | 'lean_yes' | 'lean_no' | 'no' | 'strong_no';
  one_line_summary: string;
}
