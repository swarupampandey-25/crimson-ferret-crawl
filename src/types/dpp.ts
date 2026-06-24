export interface Chapter {
  chapter_id: string;
  subject_name: "Physics" | "Chemistry" | "Biology";
  chapter_name: string;
}

export interface Question {
  question_id: string;
  chapter_id: string;
  topic_name: string;
  question_text: string;
  diagram_url?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  parent_question_id?: string;
  created_at: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}

export interface UserAttempt {
  attempt_id: string;
  question_id: string;
  selected_option: "A" | "B" | "C" | "D" | null;
  is_correct: boolean;
  time_taken_seconds: number;
  attempted_at: string;
}

export interface MistakeEntry {
  mistake_id: string;
  question_id: string;
  chapter_id: string;
  error_type: "Conceptual Loophole" | "Calculation Error" | "Skipped";
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIChat {
  chat_id: string;
  question_id: string;
  conversation_history: ChatMessage[];
  updated_at: string;
}

export interface Formula {
  formula_id: string;
  chapter_id: string;
  subject_name: "Physics" | "Chemistry" | "Biology";
  title: string;
  expression: string;
  description: string;
  is_favorite: boolean;
}

export interface StudyStats {
  focused_minutes: number;
  completed_sessions: number;
}