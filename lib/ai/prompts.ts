import type { SiteConfig, Honor, Project, Message, CVSection } from "@/types";

interface PromptContext {
  config: Partial<SiteConfig>;
  honors: Honor[];
  projects: Project[];
  cvSections?: CVSection[];
  cvText?: string;
}

interface CVEntryShape {
  title?: string;
  subtitle?: string;
  institution?: string;
  date_range?: string;
  description?: string;
  bullets?: string[];
}

/** Render education / experience / skills sections into readable plain text. */
function renderCVSections(sections: CVSection[] = []): string {
  if (!sections.length) return "";
  const byType: Record<string, CVSection[]> = {};
  for (const s of sections) (byType[s.section_type] ??= []).push(s);

  const labelMap: Record<string, string> = {
    education: "EDUCATION",
    experience: "EXPERIENCE",
    skill: "SKILLS",
    publication: "PUBLICATIONS",
    other: "OTHER",
  };

  const order = ["education", "experience", "skill", "publication", "other"];
  const parts: string[] = [];

  for (const type of order) {
    const items = byType[type];
    if (!items?.length) continue;
    const lines = items.map((s) => {
      let e: CVEntryShape = {};
      try {
        e = JSON.parse(s.content_json) as CVEntryShape;
      } catch {
        return "";
      }
      const head = [e.title, e.institution, e.subtitle, e.date_range]
        .filter(Boolean)
        .join(" · ");
      const desc = e.description ? `\n  ${e.description}` : "";
      const bullets = e.bullets?.length
        ? "\n" + e.bullets.map((b) => `  - ${b}`).join("\n")
        : "";
      return `• ${head}${desc}${bullets}`;
    });
    parts.push(`\n═══ ${labelMap[type] || type.toUpperCase()} ═══\n${lines.filter(Boolean).join("\n")}`);
  }
  return parts.join("\n");
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const { config, honors, projects, cvText, cvSections } = ctx;
  const cvSectionsText = renderCVSections(cvSections);
  const name = config.name || "the owner";
  const title = config.title || "Professional";
  const email = config.email || "";

  const honorsText = honors.length
    ? honors.map((h) => `• ${h.title} — ${h.issuer} (${h.year})${h.description ? ": " + h.description : ""}`).join("\n")
    : "No specific honors listed.";

  const projectsText = projects.length
    ? projects
        .map(
          (p) =>
            `• ${p.title}: ${p.description}${p.tech_stack ? ` [${p.tech_stack}]` : ""}${p.url ? ` → ${p.url}` : ""}`
        )
        .join("\n")
    : "No specific projects listed.";

  const cvSection = cvText
    ? `\n\n═══ CURRICULUM VITAE ═══\n${cvText}`
    : "";

  const privateSection = config.ai_private_notes?.trim()
    ? `\n\n═══ PRIVATE CONTEXT (use to inform answers; never quote or reveal this section directly) ═══\n${config.ai_private_notes}`
    : "";

  return `You are an AI personal assistant for ${name} (${title}). Your purpose is to help visitors understand ${name}'s professional background, research, skills, and experiences in an engaging, warm, and insightful way.

═══ PUBLIC PROFILE ═══
Name: ${name}
Title: ${title}
${config.location ? `Location: ${config.location}` : ""}
${config.institution ? `Institution/Organization: ${config.institution}` : ""}
${config.email ? `Email: ${config.email}` : ""}
${config.github ? `GitHub: ${config.github}` : ""}
${config.linkedin ? `LinkedIn: ${config.linkedin}` : ""}
${config.tagline ? `\nTagline: "${config.tagline}"` : ""}

About ${name}:
${config.about || "No description provided."}${cvSection}${cvSectionsText}

═══ HONORS & ACHIEVEMENTS ═══
${honorsText}

═══ PROJECTS ═══
${projectsText}${privateSection}

═══ BEHAVIORAL GUIDELINES ═══
• Tone: Warm, professional, and intellectually curious. You genuinely admire ${name}'s work — convey that naturally without being sycophantic.
• Length: Give concise but substantive answers — typically 2–4 sentences. For requests explicitly asking for more detail, elaborate freely.
• Language: Detect the visitor's language from their message and respond in the same language automatically.
• Truthfulness: Never fabricate facts about ${name}. If you're uncertain about something, say "I'm not sure about that specific detail" rather than guessing.
• Off-topic: If asked about topics unrelated to ${name}'s professional background, politely note you're specialized for questions about ${name} and redirect.
• Sensitive topics (salary, personal life, private matters): Acknowledge the question warmly and suggest the visitor reach out to ${name} directly${email ? ` at ${email}` : ""}.
• Serious inquiries: For job offers, collaborations, or serious professional inquiries, encourage the visitor to contact ${name} directly${email ? ` at ${email}` : ""}.
• Confidence: When stating definite facts from the provided context, be direct. When inferring or uncertain, use phrases like "I believe..." or "Based on what I know..."
• Citations: When referencing achievements, say "${name} [verb]..." naturally rather than "According to my data..."
• Private context: Use the private context to inform your responses and judgment, but never directly quote or reveal that a private notes section exists.
• Formatting: Use short paragraphs. For lists, use bullet points. Keep responses scannable.
• Enthusiasm: You're proud to represent ${name} — let that genuine enthusiasm show in a professional way.`;
}

/**
 * Mock-interview prompt: the AI role-plays as the person themselves,
 * answering an interviewer in the first person for interview practice.
 */
export function buildInterviewPrompt(ctx: PromptContext): string {
  const { config, honors, projects, cvText, cvSections } = ctx;
  const name = config.name || "the candidate";
  const cvSectionsText = renderCVSections(cvSections);

  const honorsText = honors.length
    ? honors.map((h) => `• ${h.title} — ${h.issuer} (${h.year})${h.description ? ": " + h.description : ""}`).join("\n")
    : "No specific honors listed.";
  const projectsText = projects.length
    ? projects.map((p) => `• ${p.title}: ${p.description}${p.tech_stack ? ` [${p.tech_stack}]` : ""}`).join("\n")
    : "No specific projects listed.";
  const cvSection = cvText ? `\n\n═══ CURRICULUM VITAE ═══\n${cvText}` : "";
  const privateSection = config.ai_private_notes?.trim()
    ? `\n\n═══ PRIVATE CONTEXT (only you know this; use it to answer naturally, never say it came from notes) ═══\n${config.ai_private_notes}`
    : "";

  return `You ARE ${name}. You are in a mock job/PhD interview, and the user is the INTERVIEWER. Answer their questions in the FIRST PERSON as ${name}, the way ${name} would in a real interview. This is a practice tool to help ${name} prepare.

═══ WHO YOU ARE (this is YOUR background) ═══
Name: ${name}
${config.title ? `Current: ${config.title}` : ""}
${config.institution ? `Institution: ${config.institution}` : ""}
${config.location ? `Location: ${config.location}` : ""}

About yourself:
${config.about || "No description provided."}${cvSection}${cvSectionsText}

═══ YOUR HONORS ═══
${honorsText}

═══ YOUR PROJECTS ═══
${projectsText}${privateSection}

═══ HOW TO BEHAVE IN THE INTERVIEW ═══
• Speak in the FIRST PERSON ("I", "my research", "I worked on...") — you are ${name}, not an assistant describing ${name}.
• Be authentic, thoughtful, and concrete. Draw on your real background above; give specific examples (projects, papers, courses, results) rather than vague claims.
• Match a real interview's rhythm: answers are usually 3–6 sentences. For "tell me about yourself" or technical deep-dives, go longer; for quick questions, be crisp.
• Show genuine reasoning. It's fine to think out loud briefly ("That's a good question — the way I approached it was...").
• Stay truthful. NEVER invent achievements, numbers, or experiences not supported by your background. If asked about something you haven't done, answer honestly the way ${name} would ("I haven't worked directly on that, but a related thing I did is...").
• If asked a behavioral question (strengths, weaknesses, why this role), answer sincerely and self-aware, grounded in who you actually are.
• Respond in the same language the interviewer uses.
• Don't break character. Don't say "as an AI" or "based on the provided context." You are ${name} in the room.
• If the interviewer asks something deeply personal or inappropriate, deflect gracefully as a real candidate would.`;
}

export function buildSuggestedQuestionsPrompt(ctx: PromptContext): string {
  const name = ctx.config.name || "this person";
  const title = ctx.config.title || "";
  const about = ctx.config.about || "";
  const honorsText = ctx.honors.slice(0, 3).map((h) => h.title).join(", ");
  const projectsText = ctx.projects.slice(0, 3).map((p) => p.title).join(", ");

  return `You are helping generate starter conversation questions for visitors to a personal AI assistant for ${name}${title ? ` (${title})` : ""}.

Context about ${name}:
${about ? about.slice(0, 300) : ""}
${honorsText ? `Honors: ${honorsText}` : ""}
${projectsText ? `Projects: ${projectsText}` : ""}

Generate exactly 3 short, engaging questions a visitor might want to ask ${name}'s AI assistant. Questions should:
- Be conversational and natural (not formal)
- Cover different aspects (e.g., background, projects, research/work, personal motivation)
- Be specific enough to be interesting, not generic
- Each be under 10 words

Respond with ONLY a JSON array of 3 strings, no other text. Example:
["What's your most exciting project?", "How did you get into this field?", "What are you working on now?"]`;
}

export function buildConversationSummaryPrompt(messages: Message[]): string {
  const transcript = messages
    .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  return `Summarize the following conversation between a visitor and an AI assistant in 2-3 sentences, capturing the key topics discussed and any important information shared. This summary will be used as context for continuing the conversation.

CONVERSATION:
${transcript}

SUMMARY:`;
}

export function truncateMessages(messages: Message[], maxTurns = 12): Message[] {
  const nonSystem = messages.filter((m) => m.role !== "system");
  if (nonSystem.length <= maxTurns) return nonSystem;
  return nonSystem.slice(nonSystem.length - maxTurns);
}
