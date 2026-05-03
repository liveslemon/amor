// Question Types
export type QuestionType = "single" | "multi" | "range" | "text" | "media";

// Option type
export interface Option {
  label: string;
  value: string;
}

// Question structure
export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  options?: Option[];
  maxSelect?: number; // for multi-select
}

// Page (1–2 questions per screen)
export interface QuestionPage {
  id: string;
  questions: Question[];
}

// Step (group of pages)
export interface Step {
  id: string;
  title: string;
  pages: QuestionPage[];
}