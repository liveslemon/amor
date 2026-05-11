export type BuildType =
  | "Slim"
  | "Athletic"
  | "Average"
  | "Curvy";

export type FocusType =
  | "Getting my degree and doing well"
  | "Building a business/project on the side"
  | "Balancing school and enjoying life"
  | "Still figuring things out";

export interface User {
  id: string;
  name: string;
  whatsapp_number: string;
  role: "user";
  onboarding_completed: boolean;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  gender?: string;
  age?: number;
  height?: number;
  build?: BuildType;
  skin_tone?: string;
  personal_style?: string;
  social_persona?: string;
  weekend_type?: string;
  afternoon_activity?: string;
  habits?: string;
  conflict_style?: string;
  relationship_goal?: string;
  green_flag?: string;
  instagram?: string;
  tiktok?: string;
}
