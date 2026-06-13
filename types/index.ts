export interface SiteConfig {
  name: string;
  title: string;
  tagline: string;
  about: string;
  email: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  avatar_url?: string;
  cv_filename?: string;
  ai_provider: "openai" | "anthropic" | "deepseek";
  ai_model: string;
  ai_api_key: string;
  ai_private_notes?: string;
  suggested_questions?: string;
  admin_password_hash: string;
  setup_complete: boolean;
  accent_color?: string;
  location?: string;
  institution?: string;
  /** JSON string holding the Chinese content overlay (see seed.mjs). */
  content_cn?: string;
}

export interface Honor {
  id: number;
  title: string;
  issuer: string;
  year: string;
  description?: string;
  order_index: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  url?: string;
  tech_stack?: string;
  order_index: number;
}

export interface CVSection {
  id: number;
  section_type: "education" | "experience" | "skill" | "publication" | "other";
  content_json: string;
  order_index: number;
}

export interface CVEntry {
  title: string;
  subtitle?: string;
  institution?: string;
  date_range?: string;
  description?: string;
  bullets?: string[];
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Conversation {
  id: string;
  session_id: string;
  messages_json: string;
  created_at: string;
  updated_at: string;
}

export interface SetupData {
  // Step 1
  name: string;
  title: string;
  tagline: string;
  about: string;
  email: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  location?: string;
  institution?: string;
  // Step 2
  ai_provider: "openai" | "anthropic" | "deepseek";
  ai_model: string;
  ai_api_key: string;
  // Step 3
  honors: Omit<Honor, "id" | "order_index">[];
  projects: Omit<Project, "id" | "order_index">[];
  // Step 4
  ai_private_notes: string;
  suggested_questions: string;
  // Step 5
  admin_password: string;
}

export type AIProvider = "openai" | "anthropic" | "deepseek";

export const AI_MODELS: Record<AIProvider, { id: string; label: string }[]> = {
  openai: [
    { id: "gpt-4o", label: "GPT-4o (Recommended)" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini (Fast)" },
    { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Budget)" },
  ],
  anthropic: [
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4 (Recommended)" },
    { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4 (Fast)" },
    { id: "claude-opus-4-8", label: "Claude Opus 4 (Most Capable)" },
  ],
  deepseek: [
    { id: "deepseek-chat", label: "DeepSeek Chat (Recommended)" },
    { id: "deepseek-reasoner", label: "DeepSeek Reasoner" },
  ],
};
